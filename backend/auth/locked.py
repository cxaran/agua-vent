import secrets
import math
from datetime import datetime, timedelta
from typing import cast

from backend.core.settings import settings
from backend.core.database import SessionDep
from backend.models.user import User
from backend.core.redis import redis_client
from backend.utils.email import send_email

# Key de Redis para el token de desbloqueo
TOKEN_KEY: str = "locked_token"
# Key de Redis para el contador de intentos fallidos
FAILED_LOGINS_KEY: str = "failed_logins"


# Calcular el tiempo en minutos de bloqueo basado en:
# n: número de intentos fallidos consecutivos.
# delta: parámetro que ajusta la rapidez con la que crece el tiempo de bloqueo.
def get_locked_time(n: int, delta: float = 1.2) -> int:
    return math.floor((1 * (1 + delta) ** (n - 1)))


# A Manejo de bloqueo tras múltiples intentos fallidos de inicio de sesión.
async def increment_failed_logins(
    session: SessionDep,
    user: User,
) -> None:
    """
    Incrementa el contador de intentos fallidos de inicio de sesión.
    Si se alcanza el límite definido en la configuración, bloquea la cuenta.

    :param session: Sesión de base de datos.
    :type session: SessionDep
    :param user: Usuario cuyo contador incrementar.
    :type user: User
    """
    # Obtener el contador de intentos fallidos desde redis
    user_key = f"{FAILED_LOGINS_KEY}:{str(user.id)}"
    failed_logins = cast("bytes | None", redis_client.get(user_key))
    failed_logins = int(failed_logins or 0)

    # Incrementar el contador de intentos fallidos
    failed_logins += 1
    print(failed_logins)

    # Guardar el contador de intentos fallidos en Redis
    redis_client.set(user_key, failed_logins)

    # Si el contador de intentos fallidos es mayor al límite, bloquear la cuenta
    if failed_logins >= settings.trys_login:
        # Obtener el tiempo de bloqueo
        locked_time = get_locked_time(failed_logins)

        # Key para el token de desbloqueo
        token_key = f"{TOKEN_KEY}:{str(user.id)}"

        # Verificar si el token de desbloqueo ya existe
        old_token = cast("bytes | None", redis_client.get(token_key))

        # Generar token de desbloqueo
        token = old_token or secrets.token_urlsafe(32)
        ttl = locked_time * 60  # convertir a segundos
        pipe = redis_client.pipeline()  # pyright: ignore[reportUnknownMemberType]
        pipe.setex(token, ttl, str(user.id))  # token → id
        pipe.setex(token_key, ttl, token)  # id → token
        pipe.execute()

        # Sumar los minutos a la fecha actual
        locked_until = datetime.now() + timedelta(minutes=locked_time)
        user.locked_until = locked_until
        session.add(user)
        session.commit()
        session.refresh(user)

        # Enviar correo electrónico de bloqueo si no existía token previo
        if not old_token:
            await send_email(
                subject="Cuenta bloqueada",
                email_to=user.email,
                template_name="locked.html",
                template_context={
                    "nombre": user.name,
                    "email": user.email,
                    "unlocked_url": f"{settings.domain_auth_url}/api/v1/auth/unlock-account/{token}",
                    "expiration": locked_until.strftime("%I:%M %p del %d/%m/%Y").lower(),
                },
            )


# Limpiar el contador de intentos fallidos tras un inicio de sesión exitoso en Redis
def clear_failed_logins(user: User) -> None:
    """
    Limpia el contador de intentos fallidos de inicio de sesión.

    :param user: Usuario cuyo contador se limpiará.
    :type user: User
    """
    pipe = redis_client.pipeline()  # pyright: ignore[reportUnknownMemberType]
    # Limpiar el contador de intentos fallidos desde redis
    user_key = f"{FAILED_LOGINS_KEY}:{str(user.id)}"
    pipe.delete(user_key)
    # Limpiar el token de desbloqueo
    token_key = f"{TOKEN_KEY}:{str(user.id)}"
    pipe.delete(token_key)

    pipe.execute()


# B Desbloqueo de cuentas bloqueadas mediante verificación de token de desbloqueo.
def validate_locked_token(
    session: SessionDep,
    token: str,
) -> User | None:
    """
    Verifica el token de desbloqueo y retorna el id asociado si es válido.
    Elimina el bloqueo de la cuenta si es válido.

    :param token: Token de desbloqueo a validar.
    :type token: str

    :return: El usuario asociado al token si es válido; None si el token no es válido o ha expirado.
    :rtype: User | None
    """

    # Obtener el id asociado al token
    id = cast("bytes | None", redis_client.get(token))  # token → id

    if not id:
        return None

    id = id.decode("utf-8")

    # Eliminar el bloqueo de la cuenta
    user = session.get(User, id)  # id → User
    if not user:
        return None

    user.locked_until = None
    session.add(user)
    session.commit()
    session.refresh(user)

    return user
