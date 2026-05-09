import secrets
from typing import cast
from pydantic import EmailStr
from sqlmodel import select
from sqlalchemy.exc import IntegrityError

from backend.core.settings import settings
from backend.core.database import SessionDep
from backend.core.redis import redis_client
from backend.utils.email import send_email
from backend.models.user import User
from backend.schemas.user import UserCreate

from .security import get_password_hash

# Key de Redis para el token de registro
TOKEN_KEY: str = "email_token"


# 1 Segunda capa: genera token solo si email es válido
async def generate_email_token(
    session: SessionDep,
    email: EmailStr,
    validate_email: bool = True,
) -> str | None:
    """
    Genera un token de registro para un correo electrónico y lo almacena temporalmente en Redis.
    Este token se utiliza para validar la dirección de correo electrónico de un nuevo usuario antes de crear su cuenta.

    :param session: Sesión de base de datos para realizar consultas.
    :type session: SessionDep
    :param email: Correo electrónico a validar.
    :type email: EmailStr

    :return: El token generado si el correo no existe en la base de datos; None si ya existe un usuario con ese correo.
    :rtype: str | None
    """

    # Verificar que el usuario no exista en la base de datos
    statement = select(User).where(User.email == email)
    existing_user = session.exec(statement).first()

    if existing_user:
        return None

    # Clave para el email
    tokens_key = f"{TOKEN_KEY}:{email}"

    # Borrar token anterior si existe
    old_token = cast("bytes | None", redis_client.get(tokens_key))
    if old_token:
        redis_client.delete(old_token)

    # Generar nuevo token
    token = secrets.token_urlsafe(32)
    ttl = settings.email_token_expire * 3600

    # Guardar el token y la referencia email→token
    pipe = redis_client.pipeline()  # pyright: ignore[reportUnknownMemberType]
    pipe.setex(token, ttl, email)  # token → email
    pipe.setex(tokens_key, ttl, token)  # email → token
    pipe.execute()

    # Enviar el email con el token generado
    await send_email(
        subject="Solicitud de registro",
        email_to=email,
        template_name="verification.html",
        template_context={
            "token": token,
            "register_url": f"{settings.domain_auth_url}/register/{token}",
        },
    )

    return token


# 2 Tercera capa: valida el token y retorna el email asociado
def validate_email_token(token: str) -> str | None:
    """
    Valida un token de registro y retorna el correo electrónico asociado si es válido.

    :param token: Token de registro a validar.
    :type token: str

    :return: El correo electrónico asociado al token si es válido; None si el token no es válido o ha expirado.
    :rtype: EmailStr | None
    """
    email = cast("bytes | None", redis_client.get(token))
    if email:
        email_str = email.decode("utf-8")
        token_key = cast("bytes | None", redis_client.get(f"{TOKEN_KEY}:{email_str}"))
        if not token_key:
            return None
        return email_str
    return None


# 3 Cuarta capa: crea el usuario en la base de datos
def create_user(
    session: SessionDep,
    user_data: UserCreate,
) -> User | None:
    """
    Genera un nuevo usuario en la base de datos.

    :param session: Sesión de base de datos para realizar consultas.
    :type session: SessionDep
    :param user_data: Datos del usuario a crear.
    :type user_data: UserCreate

    :return: El nuevo usuario creado o None si hubo un error.
    :rtype: User | None
    """
    try:
        # Verifica el token y el email que coincida con el de registro
        email = validate_email_token(user_data.token)

        if not email:
            return None

        if email != user_data.email:
            return None

        # Obtener el hash password
        hashed_password = get_password_hash(user_data.password)

        new_user = User(
            name=user_data.name,
            last_name=user_data.last_name,
            email=email,
            hashed_password=hashed_password,
            token=secrets.token_urlsafe(32),
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        # Eliminar el token de registro de Redis
        redis_client.delete(user_data.token)
        redis_client.delete(f"{TOKEN_KEY}:{email}")

        return new_user

    except IntegrityError:
        session.rollback()

    return None

