import math
from datetime import timedelta

from backend.core.database import SessionDep
from backend.core.redis import redis_client
from backend.core.settings import settings
from backend.core.time import utc_now
from backend.models.user import User
from backend.utils.email import send_email

from .security import generate_token, save_user
from .token_store import delete_token_pair, get_subject, get_token, set_token_pair

UNLOCK_TOKEN_KEY = "unlock_token"
FAILED_LOGIN_ATTEMPTS_KEY = "failed_login_attempts"


def _failed_logins_key(user_id: str) -> str:
    return f"{FAILED_LOGIN_ATTEMPTS_KEY}:{user_id}"


def get_locked_time(failed_attempts: int, factor: float = 2.2) -> int:
    return math.floor(factor ** (failed_attempts - 1))


async def increment_failed_login_attempts(
    session: SessionDep,
    user: User,
) -> None:
    user_id = str(user.id)
    failed_logins_key = _failed_logins_key(user_id)
    failed_attempts = int(redis_client.incr(failed_logins_key))

    if failed_attempts < settings.trys_login:
        return

    lock_minutes = get_locked_time(failed_attempts)
    old_token = get_token(UNLOCK_TOKEN_KEY, user_id)
    token = old_token or generate_token()
    ttl = lock_minutes * 60
    set_token_pair(UNLOCK_TOKEN_KEY, user_id, token, ttl)

    locked_until = utc_now() + timedelta(minutes=lock_minutes)
    user.locked_until = locked_until
    save_user(session, user)

    if old_token:
        return

    await send_email(
        subject="Cuenta bloqueada",
        email_to=user.email,
        template_name="locked.html",
        template_context={
            "name": user.name,
            "email": user.email,
            "unlock_url": f"{settings.domain_auth_url}/api/v1/auth/unlock-account/{token}",
            "expiration": f"{lock_minutes} minutos",
        },
    )


def clear_failed_login_attempts(user: User) -> None:
    user_id = str(user.id)
    token = get_token(UNLOCK_TOKEN_KEY, user_id)

    pipe = redis_client.pipeline()  # pyright: ignore[reportUnknownMemberType]
    pipe.delete(_failed_logins_key(user_id))
    pipe.execute()

    delete_token_pair(UNLOCK_TOKEN_KEY, user_id, token)


def unlock_user_by_token(
    session: SessionDep,
    token: str,
) -> User | None:
    user_id = get_subject(UNLOCK_TOKEN_KEY, token)
    if not user_id:
        return None

    user = session.get(User, user_id)
    if not user:
        return None

    user.locked_until = None
    save_user(session, user)

    pipe = redis_client.pipeline()  # pyright: ignore[reportUnknownMemberType]
    pipe.delete(_failed_logins_key(user_id))
    pipe.execute()

    delete_token_pair(UNLOCK_TOKEN_KEY, user_id, token)

    return user
