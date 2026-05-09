from datetime import datetime
from fastapi import Response
from pydantic import EmailStr, SecretStr
from sqlmodel import select


from backend.core.settings import settings
from backend.core.database import SessionDep
from backend.models.user import User

from .locked import increment_failed_logins, clear_failed_logins
from .security import verify_password, create_access_token, get_token_expire_time

SESSION_COOKIE_KEY: str = "session_token"
"""Clave de la cookie de sesión."""


async def authenticate(
    session: SessionDep,
    email: EmailStr,
    password: SecretStr,
) -> str | None:
    """
    Método para autenticar un usuario y obtener el token de acceso.
    """

    # Obtener el usuario
    user = session.exec(select(User).where(User.email == email)).first()

    if not user:
        return None

    if not user.is_active:
        return None

    if user.locked_until:
        if datetime.now() < user.locked_until:
            return None

    # Comprobar si la contraseña es correcta
    if not verify_password(password, user.hashed_password):
        await increment_failed_logins(session, user)
        return None

    clear_failed_logins(user)

    # Obtener el token de acceso
    access_token = create_access_token(str(user.id), user.token)

    return access_token


def set_session_cookie(
    response: Response,
    token: str,
) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_KEY,
        value=token,
        httponly=True,
        max_age=int(get_token_expire_time().total_seconds()),
        secure=".com" in settings.domain,
        samesite="lax",
        domain="." + settings.domain,
        path="/",
    )


def delete_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE_KEY,
        domain="." + settings.domain,
    )
