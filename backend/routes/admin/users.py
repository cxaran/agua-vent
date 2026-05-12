import re
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import SecretStr
from sqlalchemy import func, or_
from sqlmodel import select

from backend.auth.auth_dependencies import CurrentUser
from backend.auth.security import generate_token, get_password_hash
from backend.core.database import SessionDep
from backend.core.time import utc_now
from backend.models.subscription import Subscription
from backend.models.user import Role, RoleAccess, User, UserRole
from backend.schemas.auth import MessageResponse
from backend.schemas.pagination import Limit, Offset, Page
from backend.schemas.user import (
    AdminUserCreate,
    AdminUserPasswordUpdate,
    AdminUserRead,
    AdminUserRoleRead,
    AdminUserRolesUpdate,
    AdminUserUpdate,
)
from backend.security.groups.user import UserAdminGroup


router = APIRouter(prefix="/users", tags=["admin:users"])


def get_user(session: SessionDep, user_id: uuid.UUID) -> User:
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
    return user


def user_by_email(session: SessionDep, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def user_roles(session: SessionDep, user_id: uuid.UUID) -> list[AdminUserRoleRead]:
    rows = session.exec(
        select(Role, RoleAccess.access)
        .join(UserRole, UserRole.role_id == Role.id)
        .outerjoin(RoleAccess, (RoleAccess.role_id == Role.id) & (RoleAccess.is_active == True))  # noqa: E712
        .where(UserRole.user_id == user_id)
        .order_by(Role.name, RoleAccess.access)
    ).all()

    roles_map: dict[uuid.UUID, tuple[Role, list[str]]] = {}
    for role, access in rows:
        if role.id not in roles_map:
            roles_map[role.id] = (role, [])
        if access is not None:
            roles_map[role.id][1].append(access)

    return [
        AdminUserRoleRead(
            id=role.id,
            name=role.name,
            description=role.description,
            permissions=perms,
        )
        for role, perms in roles_map.values()
    ]


def user_subscription(session: SessionDep, user_id: uuid.UUID) -> Subscription | None:
    return session.exec(
        select(Subscription).where(Subscription.user_id == user_id)
    ).first()


def user_read(session: SessionDep, user: User) -> AdminUserRead:
    subscription = user_subscription(session, user.id)
    return AdminUserRead(
        id=user.id,
        name=user.name,
        last_name=user.last_name,
        email=user.email,
        is_active=user.is_active,
        locked_until=user.locked_until,
        created_at=user.created_at,
        updated_at=user.updated_at,
        roles=user_roles(session, user.id),
        has_subscription=subscription is not None,
        subscription_id=subscription.id if subscription else None,
    )


def replace_roles(
    session: SessionDep,
    user: User,
    role_ids: list[uuid.UUID],
    current_user: CurrentUser,
) -> None:
    roles = session.exec(select(Role).where(Role.id.in_(role_ids))).all()
    if len(roles) != len(set(role_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uno o más roles no existen",
        )

    existing = {
        link.role_id: link
        for link in session.exec(
            select(UserRole).where(UserRole.user_id == user.id)
        ).all()
    }
    wanted = set(role_ids)

    for role_id, link in existing.items():
        if role_id not in wanted:
            session.delete(link)

    for role_id in wanted - set(existing):
        session.add(
            UserRole(
                user_id=user.id,
                role_id=role_id,
                updated_by=current_user.id,
            )
        )


@router.get("", response_model=Page[AdminUserRead])
def list_users(
    session: SessionDep,
    _: UserAdminGroup.USER_VIEW.requiere,
    q: str | None = Query(default=None, min_length=2),
    active: bool | None = None,
    has_subscription: bool | None = None,
    role_id: uuid.UUID | None = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> Page[AdminUserRead]:
    stmt = select(User)
    count_stmt = select(func.count(User.id))

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
    if active is not None:
        stmt = stmt.where(User.is_active == active)
        count_stmt = count_stmt.where(User.is_active == active)
    if role_id is not None:
        condition = User.id.in_(
            select(UserRole.user_id).where(UserRole.role_id == role_id)
        )
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)
    if has_subscription is True:
        condition = User.id.in_(select(Subscription.user_id))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)
    if has_subscription is False:
        condition = User.id.not_in(select(Subscription.user_id))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    total = session.exec(count_stmt).one()
    users = session.exec(stmt.order_by(User.email).offset(offset).limit(limit)).all()
    return Page(
        items=[user_read(session, user) for user in users],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=AdminUserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: AdminUserCreate,
    session: SessionDep,
    current_user: CurrentUser,
    _: UserAdminGroup.USER_CREATE.requiere,
) -> AdminUserRead:
    if user_by_email(session, str(payload.email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese email",
        )

    user = User(
        name=payload.name,
        last_name=payload.last_name,
        email=str(payload.email),
        hashed_password=get_password_hash(payload.password),
        token=generate_token(),
        is_active=payload.is_active,
        updated_by=current_user.id,
    )
    session.add(user)
    session.flush()
    replace_roles(session, user, payload.role_ids, current_user)
    session.commit()
    session.refresh(user)
    return user_read(session, user)


@router.get("/{user_id}", response_model=AdminUserRead)
def get_user_detail(
    user_id: uuid.UUID,
    session: SessionDep,
    _: UserAdminGroup.USER_VIEW.requiere,
) -> AdminUserRead:
    return user_read(session, get_user(session, user_id))


@router.patch("/{user_id}", response_model=AdminUserRead)
def update_user(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    session: SessionDep,
    current_user: CurrentUser,
    _: UserAdminGroup.USER_UPDATE.requiere,
) -> AdminUserRead:
    user = get_user(session, user_id)
    data = payload.model_dump(exclude_unset=True)

    if "email" in data and str(data["email"]) != user.email:
        if user_by_email(session, str(data["email"])):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un usuario con ese email",
            )

    for key, value in data.items():
        setattr(user, key, str(value) if key == "email" else value)
    user.updated_by = current_user.id
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user_read(session, user)


@router.put("/{user_id}/roles", response_model=AdminUserRead)
def update_user_roles(
    user_id: uuid.UUID,
    payload: AdminUserRolesUpdate,
    session: SessionDep,
    current_user: CurrentUser,
    _: UserAdminGroup.USER_ROLES_UPDATE.requiere,
) -> AdminUserRead:
    user = get_user(session, user_id)
    replace_roles(session, user, payload.role_ids, current_user)
    user.updated_by = current_user.id
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user_read(session, user)


@router.post("/{user_id}/reset-password", response_model=MessageResponse)
def reset_user_password(
    user_id: uuid.UUID,
    payload: AdminUserPasswordUpdate,
    session: SessionDep,
    current_user: CurrentUser,
    _: UserAdminGroup.USER_PASSWORD_RESET.requiere,
) -> MessageResponse:
    user = get_user(session, user_id)
    user.hashed_password = get_password_hash(SecretStr(payload.password.get_secret_value()))
    user.token = generate_token()
    user.updated_by = current_user.id
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    return MessageResponse(message="Contraseña actualizada")


@router.post("/{user_id}/activate", response_model=AdminUserRead)
def activate_user(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    _: UserAdminGroup.USER_UPDATE.requiere,
) -> AdminUserRead:
    user = get_user(session, user_id)
    user.is_active = True
    user.updated_by = current_user.id
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user_read(session, user)


@router.post("/{user_id}/deactivate", response_model=AdminUserRead)
def deactivate_user(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    _: UserAdminGroup.USER_UPDATE.requiere,
) -> AdminUserRead:
    user = get_user(session, user_id)
    user.is_active = False
    user.updated_by = current_user.id
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user_read(session, user)


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: uuid.UUID,
    session: SessionDep,
    _: UserAdminGroup.USER_DELETE.requiere,
) -> MessageResponse:
    user = get_user(session, user_id)
    session.delete(user)
    session.commit()
    return MessageResponse(message="Usuario eliminado")
