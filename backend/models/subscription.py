import uuid
from typing import TYPE_CHECKING, Optional
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .user import Role, User


class Subscription(Base):
    """Suscripción activa o pendiente de un negocio."""

    __tablename__ = "subscription"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Usuario titular de la suscripción.",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Acceso rápido: true si puede usar el sistema.",
    )
    starts_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="Fecha de inicio de la suscripción.",
    )
    cutoff_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Fecha de corte del periodo actual.",
    )
    last_payment_at: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Fecha del último pago registrado.",
    )
    max_users: Mapped[int] = mapped_column(
        nullable=False,
        default=1,
        comment="Límite de usuarios/empleados.",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
        comment="Fecha y hora de creación del registro.",
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        onupdate=func.now(),
        comment="Fecha y hora de la última modificación.",
    )
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="RESTRICT"),
        nullable=True,
        comment="Usuario que realizó la última modificación.",
    )

    owner: Mapped["User"] = relationship(
        back_populates="owned_subscription", foreign_keys=[user_id]
    )
    members: Mapped[list["UserSubscription"]] = relationship(
        back_populates="subscription", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("user_id", name="uq_subscription_user"),
        Index("ix_subscription_user", "user_id"),
        Index("ix_subscription_active", "is_active"),
    )


class UserSubscription(Base):
    """Membresía de un usuario dentro de una suscripción."""

    __tablename__ = "user_subscription"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("subscription.id", ondelete="CASCADE"),
        nullable=False,
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("role.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Rol del usuario dentro de esta suscripción.",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        comment="Desactivación lógica: false inhabilita al miembro sin borrar el registro.",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
        comment="Fecha y hora de asignación.",
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        onupdate=func.now(),
        comment="Fecha y hora de la última modificación.",
    )
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="RESTRICT"),
        nullable=True,
        comment="Usuario que realizó la última modificación.",
    )
    user: Mapped["User"] = relationship(
        back_populates="user_subscriptions", foreign_keys=[user_id]
    )
    subscription: Mapped["Subscription"] = relationship(back_populates="members")
    role: Mapped["Role"] = relationship(foreign_keys=[role_id])

    __table_args__ = (
        UniqueConstraint("user_id", "subscription_id", name="uq_user_subscription"),
        Index("ix_user_subscription_user", "user_id"),
        Index("ix_user_subscription_subscription", "subscription_id"),
        Index("ix_user_subscription_role", "role_id"),
    )
