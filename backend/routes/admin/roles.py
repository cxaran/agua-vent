import importlib
import pkgutil
import re
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func
from sqlmodel import select

from backend.auth.auth_dependencies import CurrentUser
from backend.core.database import SessionDep
from backend.core.time import utc_now
from backend.models.user import Role, RoleAccess, UserRole
from backend.schemas.auth import MessageResponse
from backend.schemas.pagination import Limit, Offset, Page
from backend.schemas.role import (
    PermissionGroupRead,
    PermissionRead,
    RoleCreate,
    RoleListItem,
    RolePermissionUpdate,
    RoleRead,
    RoleUpdate,
)
from backend.security.groups.role import RoleGroup
from backend.security.security_group import SecurityGroup


router = APIRouter(prefix="/roles", tags=["admin:roles"])


def get_role(session: SessionDep, role_id: uuid.UUID) -> Role:
    role = session.get(Role, role_id)
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado",
        )
    return role


def role_by_name(session: SessionDep, name: str) -> Role | None:
    return session.exec(select(Role).where(Role.name == name)).first()


def discover_permission_groups() -> list[PermissionGroupRead]:
    package = importlib.import_module("backend.security.groups")
    groups: list[PermissionGroupRead] = []

    for module_info in pkgutil.iter_modules(package.__path__):
        module = importlib.import_module(f"{package.__name__}.{module_info.name}")
        for value in vars(module).values():
            if not isinstance(value, type) or not issubclass(value, SecurityGroup):
                continue
            if value is SecurityGroup:
                continue
            groups.append(
                PermissionGroupRead(
                    name=value.__name__,
                    permissions=[
                        PermissionRead(
                            access=item.permission,
                            description=item.description,
                        )
                        for item in value
                    ],
                )
            )

    return sorted(groups, key=lambda group: group.name)


def role_permissions(session: SessionDep, role_id: uuid.UUID) -> list[str]:
    return list(
        session.exec(
            select(RoleAccess.access)
            .where(
                RoleAccess.role_id == role_id,
                RoleAccess.is_active == True,  # noqa: E712
            )
            .order_by(RoleAccess.access)
        ).all()
    )


def role_item(session: SessionDep, role: Role) -> RoleListItem:
    users_count = session.exec(
        select(func.count(UserRole.id)).where(UserRole.role_id == role.id)
    ).one()
    permissions = role_permissions(session, role.id)

    return RoleListItem(
        **RoleRead.model_validate(role, from_attributes=True).model_dump(),
        users_count=users_count,
        permissions_count=len(permissions),
        permissions=permissions,
    )


def replace_permissions(
    session: SessionDep,
    role: Role,
    permissions: list[str],
    current_user: CurrentUser,
) -> None:
    existing = {
        row.access: row
        for row in session.exec(
            select(RoleAccess).where(RoleAccess.role_id == role.id)
        ).all()
    }
    wanted = set(permissions)

    for access, row in existing.items():
        row.is_active = access in wanted
        row.updated_by = current_user.id
        session.add(row)

    for access in sorted(wanted - set(existing)):
        session.add(
            RoleAccess(
                role_id=role.id,
                access=access,
                is_active=True,
                updated_by=current_user.id,
            )
        )


@router.get("/permission-groups", response_model=list[PermissionGroupRead])
def list_permission_groups(
    _: RoleGroup.ROLE_VIEW.requiere,
) -> list[PermissionGroupRead]:
    return discover_permission_groups()


@router.get("", response_model=Page[RoleListItem])
def list_roles(
    session: SessionDep,
    _: RoleGroup.ROLE_VIEW.requiere,
    q: str | None = Query(default=None, min_length=2),
    active: bool | None = None,
    limit: Limit = 50,
    offset: Offset = 0,
) -> Page[RoleListItem]:
    stmt = select(Role)
    count_stmt = select(func.count(Role.id))

    if q:
        escaped = re.sub(r"([%_])", r"\\\1", q)
        condition = Role.name.ilike(f"%{escaped}%")
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)
    if active is not None:
        stmt = stmt.where(Role.is_active == active)
        count_stmt = count_stmt.where(Role.is_active == active)

    total = session.exec(count_stmt).one()
    roles = session.exec(stmt.order_by(Role.name).offset(offset).limit(limit)).all()
    return Page(
        items=[role_item(session, role) for role in roles],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=RoleListItem, status_code=status.HTTP_201_CREATED)
def create_role(
    payload: RoleCreate,
    session: SessionDep,
    current_user: CurrentUser,
    _: RoleGroup.ROLE_CREATE.requiere,
) -> RoleListItem:
    if role_by_name(session, payload.name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un rol con ese nombre",
        )

    role = Role(
        name=payload.name,
        description=payload.description,
        is_active=True,
        updated_by=current_user.id,
    )
    session.add(role)
    session.flush()
    replace_permissions(session, role, payload.permissions, current_user)
    session.commit()
    session.refresh(role)
    return role_item(session, role)


@router.get("/{role_id}", response_model=RoleListItem)
def get_role_detail(
    role_id: uuid.UUID,
    session: SessionDep,
    _: RoleGroup.ROLE_VIEW.requiere,
) -> RoleListItem:
    return role_item(session, get_role(session, role_id))


@router.patch("/{role_id}", response_model=RoleListItem)
def update_role(
    role_id: uuid.UUID,
    payload: RoleUpdate,
    session: SessionDep,
    current_user: CurrentUser,
    _: RoleGroup.ROLE_UPDATE.requiere,
) -> RoleListItem:
    role = get_role(session, role_id)
    data = payload.model_dump(exclude_unset=True)

    if "name" in data and data["name"] != role.name and role_by_name(session, data["name"]):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un rol con ese nombre",
        )

    for key, value in data.items():
        setattr(role, key, value)
    role.updated_by = current_user.id
    role.updated_at = utc_now()
    session.add(role)
    session.commit()
    session.refresh(role)
    return role_item(session, role)


@router.put("/{role_id}/permissions", response_model=RoleListItem)
def update_role_permissions(
    role_id: uuid.UUID,
    payload: RolePermissionUpdate,
    session: SessionDep,
    current_user: CurrentUser,
    _: RoleGroup.ROLE_PERMISSIONS_UPDATE.requiere,
) -> RoleListItem:
    role = get_role(session, role_id)
    replace_permissions(session, role, payload.permissions, current_user)
    role.updated_by = current_user.id
    role.updated_at = utc_now()
    session.add(role)
    session.commit()
    session.refresh(role)
    return role_item(session, role)


@router.delete("/{role_id}", response_model=MessageResponse)
def delete_role(
    role_id: uuid.UUID,
    session: SessionDep,
    _: RoleGroup.ROLE_DELETE.requiere,
) -> MessageResponse:
    role = get_role(session, role_id)
    session.delete(role)
    session.commit()
    return MessageResponse(message="Rol eliminado")
