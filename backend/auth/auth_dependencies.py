from typing import Annotated, cast
from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select

from backend.core.database import SessionDep
from backend.core.time import utc_now
from backend.models.subscription import Subscription, UserSubscription
from backend.models.user import RoleAccess, User, UserRole
from backend.schemas.user import SubscriptionSummary, UserBase

from .security import decode_jwt

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/token",
    auto_error=False,
)


def _unauthorized_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el usuario",
    )


def get_token(
    session_token: str | None = Cookie(None),
    bearer_token: str | None = Depends(oauth2_scheme),
) -> str | None:
    return bearer_token or session_token


def _load_active_subscription(
    session: SessionDep,
    user: User,
) -> SubscriptionSummary | None:
    stmt = (
        select(
            Subscription.id,
            Subscription.user_id,
            Subscription.cutoff_date,
            UserSubscription.role_id,
        )
        .join(UserSubscription, UserSubscription.subscription_id == Subscription.id)
        .where(
            UserSubscription.user_id == user.id,
            UserSubscription.is_active == True,  # noqa: E712
            Subscription.is_active == True,  # noqa: E712
        )
        .order_by(UserSubscription.created_at.desc())
        .limit(1)
    )
    row = session.exec(stmt).first()
    if row is None:
        return None

    sub_id, owner_id, cutoff_date, role_id = row
    permissions = cast(
        "list[str]",
        session.exec(
            select(RoleAccess.access).where(
                RoleAccess.role_id == role_id,
                RoleAccess.is_active == True,  # noqa: E712
            )
        ).all(),
    )
    days_to_cutoff = (
        (cutoff_date - utc_now().date()).days if cutoff_date is not None else None
    )
    return SubscriptionSummary(
        id=sub_id,
        is_owner=owner_id == user.id,
        days_to_cutoff=days_to_cutoff,
        permissions=set(permissions),
    )


def build_current_user(
    session: SessionDep,
    user: User,
) -> UserBase:
    stmt = (
        select(RoleAccess.access)
        .join_from(RoleAccess, UserRole, RoleAccess.role_id == UserRole.role_id)
        .where(UserRole.user_id == user.id)
    )
    permissions = cast("list[str]", session.exec(stmt).all())
    base_user = UserBase.model_validate(user, from_attributes=True)
    base_user.permissions = set(permissions)
    base_user.subscription = _load_active_subscription(session, user)
    return base_user


def get_current_user(
    session: SessionDep,
    token: str | None = Depends(get_token),
) -> UserBase:
    if not token:
        raise _unauthorized_error()

    try:
        data = decode_jwt(token)
    except Exception:
        raise _unauthorized_error()

    user = session.get(User, data.sub)
    if not user or not user.is_active or user.token != data.jti:
        raise _unauthorized_error()

    return build_current_user(session, user)


CurrentUser = Annotated[UserBase, Depends(get_current_user)]
