import secrets
from typing import cast
from pydantic import EmailStr, SecretStr
from sqlmodel import select
from sqlalchemy.exc import IntegrityError


from backend.core.settings import settings
from backend.core.database import SessionDep
from backend.core.redis import redis_client
from backend.utils.email import send_email
from backend.models.user import User

from .security import get_password_hash, verify_password

# Key de Redis para el token de recuperación de contraseña
TOKEN_KEY: str = "forgot_password_token"


# 1 Primera capa: genera token solo si email es válido
async def generate_email_token(
    session: SessionDep,
    email: EmailStr,
) -> str | None:

    # Verificar que el usuario exista en la base de datos
    statement = select(User).where(User.email == email)
    existing_user = session.exec(statement).first()

    if not existing_user:
        return None

    # Si el usuario no está activo, no se puede generar el token
    if not existing_user.is_active:
        return None

    # Clave para el email
    tokens_key = f"{TOKEN_KEY}:{str(existing_user.id)}"

    # Borrar token anterior si existe
    old_token = cast("bytes | None", redis_client.get(tokens_key))
    if old_token:
        redis_client.delete(old_token)

    # Generar nuevo token
    token = secrets.token_urlsafe(32)
    ttl = settings.email_token_expire * 3600

    # Guardar el token y la referencia user.id→token
    pipe = redis_client.pipeline()  # pyright: ignore[reportUnknownMemberType]
    pipe.setex(token, ttl, str(existing_user.id))  # token → user.id
    pipe.setex(tokens_key, ttl, token)  # user.id → token
    pipe.execute()

    # Enviar el email con el token generado
    await send_email(
        subject="Recuperar contraseña",
        email_to=email,
        template_name="forgotpassword.html",
        template_context={
            "token": token,
            "email": email,
            "nombre": existing_user.name,
            "forgotpassword_url": f"{settings.domain_auth_url}/forgot-password/{token}",
        },
    )

    return token


# 2 Verifica el token y retorna el email asociado
def validate_forgot_password_token(
    session: SessionDep,
    token: str,
) -> User | None:
    """
    Valida un token de recuperación de contraseña y retorna el correo electrónico asociado si es válido.

    :param session: Sesión de base de datos.
    :type session: SessionDep
    :param token: Token de recuperación de contraseña a validar.
    :type token: str

    :return: El usuario asociado al token si es válido; None si el token no es válido o ha expirado.
    :rtype: User | None
    """
    user_id = cast("bytes | None", redis_client.get(token))
    if user_id:
        user_id_str = user_id.decode("utf-8")
        existing_user = session.get(User, user_id_str)
        if not existing_user:
            return None
        return existing_user

    return None


# 3 Cambia la contraseña y elimina el token
def reset_password(
    session: SessionDep,
    email: EmailStr,
    token: str,
    password: SecretStr,
) -> User | None:
    """
    Cambia la contraseña del usuario asociado al correo electrónico y elimina el token de recuperación.

    :param session: Sesión de base de datos.
    :type session: SessionDep

    :param email: Correo electrónico del usuario.
    :type email: EmailStr

    :param token: Token de recuperación de contraseña.
    :type token: str

    :param password: Nueva contraseña para el usuario.
    :type password: str

    :return: El usuario con la contraseña actualizada si la operación fue exitosa; None si hubo un error.
    :rtype: User | None
    """
    try:
        # Verifica el token y el email que coincida con la solicitud
        user = validate_forgot_password_token(session, token)

        if not user:
            return None

        if user.email != email:
            return None

        # Si el usuario no está activo, no se puede cambiar la contraseña
        if not user.is_active:
            return None

        # Verificar que la nueva contraseña no sea igual a la anterior
        if verify_password(password, user.hashed_password):
            return None

        # Actualizar la contraseña
        hashed_password = get_password_hash(password)
        user.hashed_password = hashed_password
        user.locked_until = None  # Desbloquear cuenta
        user.token = secrets.token_urlsafe(32)  # Cambiar el token de sesión
        session.add(user)
        session.commit()
        session.refresh(user)

        # Eliminar el token de Redis
        redis_client.delete(token)
        redis_client.delete(f"{TOKEN_KEY}:{email}")

        return user

    except IntegrityError:
        session.rollback()
