"""add_subscription_tables

Revision ID: a1b2c3d4e5f6
Revises: 637eabe6026a
Create Date: 2026-05-12 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '637eabe6026a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'subscription',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='RESTRICT'), nullable=False,
                  comment='Usuario titular de la suscripcion.'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.false(),
                  comment='Acceso rapido: true si puede usar el sistema.'),
        sa.Column('starts_at', sa.DateTime(), nullable=True,
                  comment='Fecha de inicio de la suscripcion.'),
        sa.Column('cutoff_date', sa.Date(), nullable=True,
                  comment='Fecha de corte del periodo actual.'),
        sa.Column('last_payment_at', sa.Date(), nullable=True,
                  comment='Fecha del ultimo pago registrado.'),
        sa.Column('max_users', sa.Integer(), nullable=False, server_default='1',
                  comment='Limite de usuarios/empleados.'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now(),
                  comment='Fecha y hora de creacion del registro.'),
        sa.Column('updated_at', sa.DateTime(), nullable=True,
                  comment='Fecha y hora de la ultima modificacion.'),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='RESTRICT'), nullable=True,
                  comment='Usuario que realizo la ultima modificacion.'),
        sa.UniqueConstraint('user_id', name='uq_subscription_user'),
        sa.Index('ix_subscription_user', 'user_id'),
        sa.Index('ix_subscription_active', 'is_active'),
    )

    op.create_table(
        'user_subscription',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('subscription.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('role.id', ondelete='RESTRICT'), nullable=False,
                  comment='Rol del usuario dentro de esta suscripcion.'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true(),
                  comment='Desactivacion logica: false inhabilita al miembro sin borrar el registro.'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now(),
                  comment='Fecha y hora de asignacion.'),
        sa.Column('updated_at', sa.DateTime(), nullable=True,
                  comment='Fecha y hora de la ultima modificacion.'),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='RESTRICT'), nullable=True,
                  comment='Usuario que realizo la ultima modificacion.'),
        sa.UniqueConstraint('user_id', 'subscription_id', name='uq_user_subscription'),
        sa.Index('ix_user_subscription_user', 'user_id'),
        sa.Index('ix_user_subscription_subscription', 'subscription_id'),
        sa.Index('ix_user_subscription_role', 'role_id'),
    )


def downgrade() -> None:
    op.drop_table('user_subscription')
    op.drop_table('subscription')
