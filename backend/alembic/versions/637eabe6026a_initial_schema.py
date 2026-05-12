"""initial_schema

Revision ID: 637eabe6026a
Revises:
Create Date: 2026-05-06 14:15:33.915975

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '637eabe6026a'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true(),
                  comment='Desactivacion logica: false elimina al usuario sin borrar el registro.'),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('token', sa.String(), nullable=True,
                  comment='Token de version del usuario. Cambia al modificar contrasena, email o al forzar cierre de sesiones activas.'),
        sa.Column('locked_until', sa.DateTime(), nullable=True,
                  comment='Fecha hasta la cual la cuenta esta bloqueada por intentos fallidos de login.'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now(),
                  comment='Fecha y hora de creacion del registro.'),
        sa.Column('updated_at', sa.DateTime(), nullable=True,
                  comment='Fecha y hora de la ultima modificacion.'),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='RESTRICT'), nullable=True,
                  comment='Usuario que realizo la ultima modificacion.'),
    )

    op.create_table(
        'role',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('description', sa.String(), nullable=True,
                  comment='Descripcion legible del proposito del rol.'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now(),
                  comment='Fecha y hora de creacion del registro.'),
        sa.Column('updated_at', sa.DateTime(), nullable=True,
                  comment='Fecha y hora de la ultima modificacion.'),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='RESTRICT'), nullable=True,
                  comment='Usuario que realizo la ultima modificacion.'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true(),
                  comment='Desactivacion logica: false inhabilita el rol y sus permisos asociados sin borrar el registro.'),
    )

    op.create_table(
        'user_role',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('role_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('role.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now(),
                  comment='Fecha y hora de asignacion del rol al usuario.'),
        sa.Column('updated_at', sa.DateTime(), nullable=True,
                  comment='Fecha y hora de la ultima modificacion.'),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='RESTRICT'), nullable=True,
                  comment='Usuario que realizo la ultima modificacion.'),
        sa.UniqueConstraint('user_id', 'role_id', name='uq_user_role'),
        sa.Index('ix_user_role_user', 'user_id'),
        sa.Index('ix_user_role_role', 'role_id'),
    )

    op.create_table(
        'role_access',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('role_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('role.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('access', sa.String(), nullable=False,
                  comment='Referencia al permiso en codigo para control de acceso a endpoints (ej: dashboard.view, pos.sale.create).'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now(),
                  comment='Fecha y hora de creacion del permiso.'),
        sa.Column('updated_at', sa.DateTime(), nullable=True,
                  comment='Fecha y hora de la ultima modificacion.'),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('user.id', ondelete='RESTRICT'), nullable=True,
                  comment='Usuario que realizo la ultima modificacion.'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true(),
                  comment='Desactivacion logica: false inhabilita el permiso sin borrar el registro.'),
        sa.UniqueConstraint('role_id', 'access', name='uq_role_access'),
        sa.Index('ix_role_access', 'role_id', 'access'),
    )


def downgrade() -> None:
    op.drop_table('role_access')
    op.drop_table('user_role')
    op.drop_table('role')
    op.drop_table('user')
