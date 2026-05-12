import re
import uuid
from datetime import date, timedelta
from typing import cast

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlmodel import select

from backend.auth.auth_dependencies import CurrentUser
from backend.core.database import SessionDep
from backend.models.subscription import Subscription
from backend.models.user import User
from backend.schemas.auth import MessageResponse
from backend.schemas.pagination import Limit, Offset, Page
from backend.schemas.subscription import (
    PaymentRegister,
    SubscriptionCreate,
    SubscriptionListItem,
    SubscriptionRead,
    SubscriptionStats,
    SubscriptionUpdate,
    UserSearchResult,
)
from backend.security.groups.subscription import SubscriptionGroup


router = APIRouter(prefix="/subscriptions", tags=["admin:subscriptions"])


def today() -> date:
    return date.today()


def days_to_cutoff(cutoff_date: date | None) -> int | None:
    return (cutoff_date - today()).days if cutoff_date else None


def subscription_status(subscription: Subscription, due_in_days: int = 7) -> str:
    days = days_to_cutoff(subscription.cutoff_date)
    if not subscription.is_active:
        return "inactive"
    if days is None:
        return "no_cutoff"
    if days < 0:
        return "expired"
    if days <= due_in_days:
        return "due_soon"
    return "active"


def read_item(subscription: Subscription, owner: User) -> SubscriptionListItem:
    return SubscriptionListItem(
        **SubscriptionRead.model_validate(
            subscription, from_attributes=True
        ).model_dump(),
        owner_name=owner.name,
        owner_last_name=owner.last_name,
        owner_email=owner.email,
        days_to_cutoff=days_to_cutoff(subscription.cutoff_date),
        status=subscription_status(subscription),
    )


def get_existing_subscription(
    session: SessionDep,
    subscription_id: uuid.UUID,
) -> Subscription:
    subscription = session.get(Subscription, subscription_id)
    if subscription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suscripción no encontrada",
        )
    return subscription


def user_search_stmt(q: str | None = None, without_subscription: bool = False):
    stmt = select(User, Subscription.id).outerjoin(
        Subscription, Subscription.user_id == User.id
    )
    if q:
        escaped = re.sub(r"([%_])", r"\\\1", q)
        search = f"%{escaped}%"
        stmt = stmt.where(
            or_(
                User.email.ilike(search),
                User.name.ilike(search),
                User.last_name.ilike(search),
            )
        )
    if without_subscription:
        stmt = stmt.where(Subscription.id.is_(None))
    return stmt.order_by(User.email)


def user_search_count_stmt(q: str | None = None, without_subscription: bool = False):
    stmt = select(func.count(User.id)).outerjoin(
        Subscription, Subscription.user_id == User.id
    )
    if q:
        escaped = re.sub(r"([%_])", r"\\\1", q)
        search = f"%{escaped}%"
        stmt = stmt.where(
            or_(
                User.email.ilike(search),
                User.name.ilike(search),
                User.last_name.ilike(search),
            )
        )
    if without_subscription:
        stmt = stmt.where(Subscription.id.is_(None))
    return stmt


def user_search_result(
    user: User,
    subscription_id: uuid.UUID | None,
) -> UserSearchResult:
    return UserSearchResult(
        id=user.id,
        name=user.name,
        last_name=user.last_name,
        email=user.email,
        is_active=user.is_active,
        has_subscription=subscription_id is not None,
    )


@router.get("/users/search", response_model=Page[UserSearchResult])
def search_users(
    session: SessionDep,
    _: SubscriptionGroup.SUBSCRIPTION_VIEW.requiere,
    q: str | None = Query(default=None, min_length=2),
    active: bool | None = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> Page[UserSearchResult]:
    stmt = user_search_stmt(q)
    count_stmt = user_search_count_stmt(q)
    if active is not None:
        stmt = stmt.where(User.is_active == active)
        count_stmt = count_stmt.where(User.is_active == active)

    rows = cast(
        list[tuple[User, uuid.UUID | None]],
        session.exec(stmt.offset(offset).limit(limit)).all(),
    )
    return Page(
        items=[
            user_search_result(user, subscription_id)
            for user, subscription_id in rows
        ],
        total=session.exec(count_stmt).one(),
        limit=limit,
        offset=offset,
    )


@router.get("/users/without-subscription", response_model=Page[UserSearchResult])
def users_without_subscription(
    session: SessionDep,
    _: SubscriptionGroup.SUBSCRIPTION_VIEW.requiere,
    q: str | None = Query(default=None, min_length=2),
    active: bool | None = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> Page[UserSearchResult]:
    stmt = user_search_stmt(q, without_subscription=True)
    count_stmt = user_search_count_stmt(q, without_subscription=True)
    if active is not None:
        stmt = stmt.where(User.is_active == active)
        count_stmt = count_stmt.where(User.is_active == active)

    rows = cast(
        list[tuple[User, uuid.UUID | None]],
        session.exec(stmt.offset(offset).limit(limit)).all(),
    )
    return Page(
        items=[user_search_result(user, None) for user, _ in rows],
        total=session.exec(count_stmt).one(),
        limit=limit,
        offset=offset,
    )


@router.get("/stats", response_model=SubscriptionStats)
def subscription_stats(
    session: SessionDep,
    _: SubscriptionGroup.SUBSCRIPTION_STATS.requiere,
    due_in_days: int = Query(default=7, ge=1, le=90),
) -> SubscriptionStats:
    current = today()
    due_limit = current + timedelta(days=due_in_days)

    total = session.exec(select(func.count(Subscription.id))).one()
    active = session.exec(
        select(func.count(Subscription.id)).where(Subscription.is_active == True)  # noqa: E712
    ).one()
    expired = session.exec(
        select(func.count(Subscription.id)).where(
            Subscription.cutoff_date < current,
            Subscription.is_active == True,  # noqa: E712
        )
    ).one()
    due_soon = session.exec(
        select(func.count(Subscription.id)).where(
            Subscription.cutoff_date >= current,
            Subscription.cutoff_date <= due_limit,
            Subscription.is_active == True,  # noqa: E712
        )
    ).one()
    without_cutoff = session.exec(
        select(func.count(Subscription.id)).where(Subscription.cutoff_date.is_(None))
    ).one()

    return SubscriptionStats(
        total=total,
        active=active,
        inactive=total - active,
        expired=expired,
        due_soon=due_soon,
        without_cutoff_date=without_cutoff,
    )


@router.post("/deactivate-expired", response_model=MessageResponse)
def deactivate_expired(
    session: SessionDep,
    current_user: CurrentUser,
    _: SubscriptionGroup.SUBSCRIPTION_DEACTIVATE_EXPIRED.requiere,
) -> MessageResponse:
    rows = session.exec(
        select(Subscription).where(
            Subscription.cutoff_date < today(),
            Subscription.is_active == True,  # noqa: E712
        )
    ).all()
    for subscription in rows:
        subscription.is_active = False
        subscription.updated_by = current_user.id
        session.add(subscription)
    session.commit()
    return MessageResponse(message=f"Suscripciones desactivadas: {len(rows)}")


@router.get("", response_model=Page[SubscriptionListItem])
def list_subscriptions(
    session: SessionDep,
    _: SubscriptionGroup.SUBSCRIPTION_VIEW.requiere,
    q: str | None = Query(default=None, min_length=2),
    owner_id: uuid.UUID | None = None,
    active: bool | None = None,
    expired: bool = False,
    due_in_days: int | None = Query(default=None, ge=1, le=90),
    cutoff_from: date | None = None,
    cutoff_to: date | None = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> Page[SubscriptionListItem]:
    stmt = select(Subscription, User).join(User, User.id == Subscription.user_id)
    count_stmt = select(func.count(Subscription.id)).join(
        User, User.id == Subscription.user_id
    )

    if q:
        escaped = re.sub(r"([%_])", r"\\\1", q)
        search = f"%{escaped}%"
        condition = or_(
            User.email.ilike(search),
            User.name.ilike(search),
            User.last_name.ilike(search),
        )
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)
    if owner_id is not None:
        stmt = stmt.where(Subscription.user_id == owner_id)
        count_stmt = count_stmt.where(Subscription.user_id == owner_id)
    if active is not None:
        stmt = stmt.where(Subscription.is_active == active)
        count_stmt = count_stmt.where(Subscription.is_active == active)
    if expired:
        stmt = stmt.where(Subscription.cutoff_date < today())
        count_stmt = count_stmt.where(Subscription.cutoff_date < today())
    if due_in_days is not None:
        condition = (
            Subscription.cutoff_date >= today(),
            Subscription.cutoff_date <= today() + timedelta(days=due_in_days),
        )
        stmt = stmt.where(*condition)
        count_stmt = count_stmt.where(*condition)
    if cutoff_from is not None:
        stmt = stmt.where(Subscription.cutoff_date >= cutoff_from)
        count_stmt = count_stmt.where(Subscription.cutoff_date >= cutoff_from)
    if cutoff_to is not None:
        stmt = stmt.where(Subscription.cutoff_date <= cutoff_to)
        count_stmt = count_stmt.where(Subscription.cutoff_date <= cutoff_to)

    total = session.exec(count_stmt).one()
    rows = session.exec(
        stmt.order_by(Subscription.created_at.desc()).offset(offset).limit(limit)
    ).all()
    return Page(
        items=[read_item(subscription, owner) for subscription, owner in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=SubscriptionRead, status_code=status.HTTP_201_CREATED)
def create_subscription(
    payload: SubscriptionCreate,
    session: SessionDep,
    current_user: CurrentUser,
    _: SubscriptionGroup.SUBSCRIPTION_CREATE.requiere,
) -> SubscriptionRead:
    if session.get(User, payload.user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario titular no encontrado",
        )

    existing = session.exec(
        select(Subscription).where(Subscription.user_id == payload.user_id)
    ).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El usuario ya tiene una suscripción",
        )

    subscription = Subscription(
        **payload.model_dump(),
        updated_by=current_user.id,
    )
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return SubscriptionRead.model_validate(subscription, from_attributes=True)


@router.get("/{subscription_id}", response_model=SubscriptionRead)
def get_subscription(
    subscription_id: uuid.UUID,
    session: SessionDep,
    _: SubscriptionGroup.SUBSCRIPTION_VIEW.requiere,
) -> SubscriptionRead:
    subscription = get_existing_subscription(session, subscription_id)
    return SubscriptionRead.model_validate(subscription, from_attributes=True)


@router.patch("/{subscription_id}", response_model=SubscriptionRead)
def update_subscription(
    subscription_id: uuid.UUID,
    payload: SubscriptionUpdate,
    session: SessionDep,
    current_user: CurrentUser,
    _: SubscriptionGroup.SUBSCRIPTION_UPDATE.requiere,
) -> SubscriptionRead:
    subscription = get_existing_subscription(session, subscription_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(subscription, key, value)
    subscription.updated_by = current_user.id
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return SubscriptionRead.model_validate(subscription, from_attributes=True)


@router.post("/{subscription_id}/payments", response_model=SubscriptionRead)
def register_payment(
    subscription_id: uuid.UUID,
    payload: PaymentRegister,
    session: SessionDep,
    current_user: CurrentUser,
    _: SubscriptionGroup.SUBSCRIPTION_PAYMENTS.requiere,
) -> SubscriptionRead:
    subscription = get_existing_subscription(session, subscription_id)
    subscription.last_payment_at = payload.paid_at
    subscription.cutoff_date = payload.new_cutoff_date
    subscription.is_active = True
    subscription.updated_by = current_user.id
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return SubscriptionRead.model_validate(subscription, from_attributes=True)


@router.post("/{subscription_id}/activate", response_model=SubscriptionRead)
def activate_subscription(
    subscription_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    _: SubscriptionGroup.SUBSCRIPTION_UPDATE.requiere,
) -> SubscriptionRead:
    subscription = get_existing_subscription(session, subscription_id)
    subscription.is_active = True
    subscription.updated_by = current_user.id
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return SubscriptionRead.model_validate(subscription, from_attributes=True)


@router.post("/{subscription_id}/deactivate", response_model=SubscriptionRead)
def deactivate_subscription(
    subscription_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    _: SubscriptionGroup.SUBSCRIPTION_UPDATE.requiere,
) -> SubscriptionRead:
    subscription = get_existing_subscription(session, subscription_id)
    subscription.is_active = False
    subscription.updated_by = current_user.id
    session.add(subscription)
    session.commit()
    session.refresh(subscription)
    return SubscriptionRead.model_validate(subscription, from_attributes=True)


@router.delete("/{subscription_id}", response_model=MessageResponse)
def delete_subscription(
    subscription_id: uuid.UUID,
    session: SessionDep,
    _: SubscriptionGroup.SUBSCRIPTION_DELETE.requiere,
) -> MessageResponse:
    subscription = get_existing_subscription(session, subscription_id)
    session.delete(subscription)
    session.commit()
    return MessageResponse(message="Suscripción eliminada")
