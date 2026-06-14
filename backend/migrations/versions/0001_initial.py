"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-14

"""
from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("icon", sa.String(100)),
        sa.Column("color", sa.String(50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("image_url", sa.String(500)),
        sa.Column("github_url", sa.String(500)),
        sa.Column("live_url", sa.String(500)),
        sa.Column("commercial_url", sa.String(500)),
        sa.Column("technologies", sa.String(500)),
        sa.Column("category_id", sa.Integer, sa.ForeignKey("categories.id")),
        sa.Column("is_featured", sa.Boolean, default=False),
        sa.Column("is_opensource", sa.Boolean, default=True),
        sa.Column("show_on_homepage", sa.Boolean, default=False),
        sa.Column("status", sa.String(50), default="completed"),
        sa.Column("stars", sa.Integer, default=0),
        sa.Column("forks", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "skills",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("category", sa.String(100)),
        sa.Column("proficiency", sa.Integer),
        sa.Column("icon", sa.String(200)),
        sa.Column("description", sa.Text),
        sa.Column("years_experience", sa.Integer),
        sa.Column("is_featured", sa.Boolean, default=False),
        sa.Column("sort_order", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "experiences",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("company", sa.String(200), nullable=False),
        sa.Column("position", sa.String(200), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("start_date", sa.String(50)),
        sa.Column("end_date", sa.String(50)),
        sa.Column("location", sa.String(200)),
        sa.Column("company_url", sa.String(500)),
        sa.Column("logo_url", sa.String(500)),
        sa.Column("technologies", sa.String(500)),
        sa.Column("achievements", sa.JSON),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "educations",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("institution", sa.String(200), nullable=False),
        sa.Column("degree", sa.String(200), nullable=False),
        sa.Column("field_of_study", sa.String(200)),
        sa.Column("start_date", sa.String(50)),
        sa.Column("end_date", sa.String(50)),
        sa.Column("description", sa.Text),
        sa.Column("logo_url", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "testimonials",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("client_name", sa.String(200), nullable=False),
        sa.Column("client_title", sa.String(200)),
        sa.Column("company", sa.String(200)),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("rating", sa.Integer),
        sa.Column("is_featured", sa.Boolean, default=False),
        sa.Column("sort_order", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "social_links",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("platform", sa.String(100), nullable=False),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("icon", sa.String(200)),
        sa.Column("display_name", sa.String(200)),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("sort_order", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "personal",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(200), default=""),
        sa.Column("title", sa.String(200), default=""),
        sa.Column("bio", sa.Text, default=""),
        sa.Column("email", sa.String(200), default=""),
        sa.Column("phone", sa.String(50), default=""),
        sa.Column("address", sa.Text, default=""),
        sa.Column("profile_image", sa.String(500), default=""),
        sa.Column("resume_url", sa.String(500), default=""),
        sa.Column("location", sa.String(200), default=""),
        sa.Column("tagline", sa.String(300), default=""),
        sa.Column("years_experience", sa.Integer, default=0),
        sa.Column("projects_completed", sa.Integer, default=0),
        sa.Column("clients_served", sa.Integer, default=0),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "seo_settings",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("page_name", sa.String(100), nullable=False),
        sa.Column("title", sa.String(300)),
        sa.Column("meta_description", sa.Text),
        sa.Column("meta_keywords", sa.String(500)),
        sa.Column("og_title", sa.String(300)),
        sa.Column("og_description", sa.Text),
        sa.Column("og_image", sa.String(500)),
        sa.Column("og_url", sa.String(500)),
        sa.Column("og_type", sa.String(50)),
        sa.Column("twitter_title", sa.String(300)),
        sa.Column("twitter_description", sa.Text),
        sa.Column("twitter_image", sa.String(500)),
        sa.Column("twitter_url", sa.String(500)),
        sa.Column("twitter_card", sa.String(100)),
        sa.Column("canonical_url", sa.String(500)),
        sa.Column("robots", sa.String(100)),
        sa.Column("focus_keywords", sa.String(300)),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "contacts",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(200), nullable=False),
        sa.Column("subject", sa.String(300)),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("is_spam", sa.Boolean, default=False),
        sa.Column("is_replied", sa.Boolean, default=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("replied_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "newsletter",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(200), nullable=False, unique=True),
        sa.Column("name", sa.String(200)),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("interests", sa.JSON),
        sa.Column("subscribed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_email_sent", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "wiki_categories",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("parent_id", sa.Integer, sa.ForeignKey("wiki_categories.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "wiki_articles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("content", sa.Text),
        sa.Column("summary", sa.Text),
        sa.Column("category_id", sa.Integer, sa.ForeignKey("wiki_categories.id")),
        sa.Column("tags", sa.String(500)),
        sa.Column("views", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "donation_projects",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("short_description", sa.String(500)),
        sa.Column("goal_amount", sa.Float),
        sa.Column("current_amount", sa.Float, default=0),
        sa.Column("image_url", sa.String(500)),
        sa.Column("github_url", sa.String(500)),
        sa.Column("demo_url", sa.String(500)),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("is_featured", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "donations",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("project_id", sa.Integer, sa.ForeignKey("donation_projects.id")),
        sa.Column("donor_name", sa.String(200)),
        sa.Column("donor_email", sa.String(200)),
        sa.Column("donor_phone", sa.String(50)),
        sa.Column("amount", sa.Float, nullable=False),
        sa.Column("currency", sa.String(10), default="USD"),
        sa.Column("message", sa.Text),
        sa.Column("is_anonymous", sa.Boolean, default=False),
        sa.Column("payment_method", sa.String(50)),
        sa.Column("payment_id", sa.String(200)),
        sa.Column("status", sa.String(50), default="pending"),
        sa.Column("verified_amount", sa.Float),
        sa.Column("admin_notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    for tbl in [
        "donations", "donation_projects", "wiki_articles", "wiki_categories",
        "newsletter", "contacts", "seo_settings", "personal", "social_links",
        "testimonials", "educations", "experiences", "skills", "projects", "categories",
    ]:
        op.drop_table(tbl)
