"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-01-01 00:00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# create_type=False: the type is created/dropped explicitly below, so the
# CREATE TYPE that create_table would otherwise fire for an enum column
# doesn't run a second time and collide with it.
user_role = postgresql.ENUM("citizen", "authority", name="user_role", create_type=False)
report_category = postgresql.ENUM(
    "pothole", "lighting", "waste", "flooding", "other", name="report_category", create_type=False
)
report_priority = postgresql.ENUM("low", "medium", "high", "critical", name="report_priority", create_type=False)
report_status = postgresql.ENUM("open", "in_progress", "resolved", name="report_status", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)
    report_category.create(bind, checkfirst=True)
    report_priority.create(bind, checkfirst=True)
    report_status.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", user_role, nullable=False, server_default="citizen"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("category", report_category, nullable=False, server_default="other"),
        sa.Column("priority", report_priority, nullable=False, server_default="medium"),
        sa.Column("status", report_status, nullable=False, server_default="open"),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("ai_confidence", sa.Float, nullable=True),
        sa.Column("ai_reasoning", sa.Text, nullable=True),
        sa.Column("duplicate_of_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("reports.id"), nullable=True),
        sa.Column("reporter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("assigned_to_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_reports_status", "reports", ["status"])
    op.create_index("ix_reports_category", "reports", ["category"])
    op.create_index("ix_reports_lat_lng", "reports", ["latitude", "longitude"])

    op.create_table(
        "report_images",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("report_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("url", sa.String(1024), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("report_images")
    op.drop_index("ix_reports_lat_lng", table_name="reports")
    op.drop_index("ix_reports_category", table_name="reports")
    op.drop_index("ix_reports_status", table_name="reports")
    op.drop_table("reports")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    report_status.drop(bind, checkfirst=True)
    report_priority.drop(bind, checkfirst=True)
    report_category.drop(bind, checkfirst=True)
    user_role.drop(bind, checkfirst=True)
