import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from pydantic import SecretStr

from backend.core.settings import settings
from backend.schemas.auth import TokenPayload


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def create_access_token(subject: str, user_token: str | None = None) -> str:
    """
    Crea un token de acceso JWT.
    """
    expire = datetime.now() + timedelta(hours=settings.access_token_expire)
    to_encode = TokenPayload(
        sub=subject,
        exp=int(expire.timestamp()),
        iat=int(datetime.now().timestamp()),
        jti=user_token or "",
    )

    encoded_jwt = jwt.encode(
        to_encode.model_dump(), settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def verify_password(plain_password: SecretStr, hashed_password: str) -> bool:
    """
    Verifica que una contraseña en texto plano coincida con su versión hasheada.
    """
    return pwd_context.verify(plain_password.get_secret_value(), hashed_password)


def decode_jwt(token: str) -> TokenPayload:
    """
    Decodifica un token JWT y devuelve su contenido como un objeto TokenPayload.
    """
    payload = jwt.decode(
        token,
        settings.secret_key,
        algorithms=[settings.algorithm],
        options={"require": ["sub", "exp", "iat", "jti"]},
    )
    return TokenPayload(**payload)


def get_password_hash(password: SecretStr) -> str:
    """
    Genera el hash seguro de una contraseña usando argon2.
    """
    return pwd_context.hash(password.get_secret_value())


def get_token_expire_time() -> timedelta:
    """
    Devuelve el tiempo de expiración configurado para los tokens de acceso.
    """
    return timedelta(hours=settings.access_token_expire)
