"""add users table

Revision ID: 0002_users
Revises: 0001_initial
Create Date: 2026-06-14

"""
from alembic import op
import sqlalchemy as sa


revision = "0002_users"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.String(100), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("email", sa.String(200)),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("is_admin", sa.Boolean, default=True),
        sa.Column("must_change_password", sa.Boolean, default=False),
        sa.Column("password_reset_token", sa.String(255)),
        sa.Column("password_reset_expires", sa.DateTime(timezone=True)),
        sa.Column("last_login_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.execute("CREATE UNIQUE INDEX one_admin_only ON users ((TRUE)) WHERE is_admin = TRUE")


def downgrade() -> None:
    op.drop_table("users")
