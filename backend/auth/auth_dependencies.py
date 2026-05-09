from datetime import datetime
from typing import Annotated, Optional, cast
from fastapi import Depends, HTTPException, Cookie, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select

from backend.core.database import SessionDep
from backend.core.redis import redis_client
from backend.models.user import User, UserRole, RoleAccess
from backend.schemas.user import UserBase

from .security import decode_jwt

USER_SESSION_KEY: str = "user_session"
TTL: int = 45


# Esquema de autenticación OAuth2
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/token",
    auto_error=False,
)


def get_token(
    session_token: Optional[str] = Cookie(None),
    bearer_token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[str]:
    """
    Obtiene el token de acceso desde:
    1. Header Authorization: Bearer <token>
    2. Cookie "session_token"
    """
    if bearer_token:
        return bearer_token
    return session_token


def get_base_user(
    session: SessionDep,
    user: User,
) -> UserBase:
    """
    Devuelve un objeto UserBase con los permisos del usuario.
    """
    stmt = (
        select(RoleAccess.access)
        .join_from(RoleAccess, UserRole, RoleAccess.role_id == UserRole.role_id)
        .where(UserRole.user_id == user.id)
    )
    rows = cast("list[str]", session.exec(stmt).all())
    base_user = UserBase.model_validate(user, from_attributes=True)
    base_user.permissions = set(rows)
    return base_user


def get_current_user(
    session: SessionDep,
    token: str = Depends(get_token),
) -> Optional[UserBase]:
    """Obtiene el usuario actual si existe un token de acceso."""
    try:
        data = decode_jwt(token)
        cache_key = f"{USER_SESSION_KEY}:{data.sub}"
        cached_user = cast("bytes | None", redis_client.get(cache_key))
        if cached_user:
            return UserBase.model_validate_json(cached_user)
        user = session.get(User, data.sub)
        if not user or not user.is_active or user.token != data.jti:
            raise ValueError("invalid user")
        user.last_login = datetime.now()
        session.add(user)
        session.commit()
        base_user = get_base_user(session, user)
        redis_client.setex(cache_key, TTL, base_user.model_dump_json())
        return base_user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el usuario",
        )


# Dependencias que lanzan excepciones si se encuentra un error en la validación
CurrentUser = Annotated[UserBase, Depends(get_current_user)]
"""Usuario actual autenticado."""
