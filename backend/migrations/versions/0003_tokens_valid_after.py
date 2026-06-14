"""add tokens_valid_after to users for session revocation

Revision ID: 0003_tokens_valid_after
Revises: 0002_users
Create Date: 2026-06-14

"""
from alembic import op
import sqlalchemy as sa


revision = "0003_tokens_valid_after"
down_revision = "0002_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("tokens_valid_after", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "tokens_valid_after")
