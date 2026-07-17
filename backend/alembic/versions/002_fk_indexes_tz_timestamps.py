"""Add FK indexes and convert timestamps to timezone-aware

Every ForeignKey column the API filters on gets an index (previously 0 of
11 were indexed). All timestamp columns convert to TIMESTAMPTZ; existing
naive values were written as UTC, so the USING clause interprets them as
UTC rather than the session timezone.

Revision ID: 002_fk_indexes_tz
Revises: 001_add_frameworks
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "002_fk_indexes_tz"
down_revision = "001_add_frameworks"
branch_labels = None
depends_on = None

FK_INDEXES = [
    ("ix_users_organization_id", "users", "organization_id"),
    ("ix_framework_domains_framework_id", "framework_domains", "framework_id"),
    ("ix_framework_gates_domain_id", "framework_gates", "domain_id"),
    ("ix_framework_questions_gate_id", "framework_questions", "gate_id"),
    ("ix_assessments_organization_id", "assessments", "organization_id"),
    ("ix_assessments_assessor_id", "assessments", "assessor_id"),
    ("ix_assessments_framework_id", "assessments", "framework_id"),
    ("ix_domain_scores_assessment_id", "domain_scores", "assessment_id"),
    ("ix_domain_scores_domain_id", "domain_scores", "domain_id"),
    ("ix_gate_responses_assessment_id", "gate_responses", "assessment_id"),
    ("ix_gate_responses_question_id", "gate_responses", "question_id"),
]

TIMESTAMP_COLUMNS = [
    ("organizations", ["created_at", "updated_at"]),
    ("users", ["created_at", "updated_at", "last_login"]),
    ("frameworks", ["created_at", "updated_at"]),
    ("framework_domains", ["created_at", "updated_at"]),
    ("framework_gates", ["created_at", "updated_at"]),
    ("framework_questions", ["created_at", "updated_at"]),
    ("assessments", ["started_at", "completed_at", "created_at", "updated_at"]),
    ("domain_scores", ["created_at", "updated_at"]),
    ("gate_responses", ["created_at", "updated_at"]),
]


def upgrade() -> None:
    for name, table, column in FK_INDEXES:
        op.create_index(name, table, [column], if_not_exists=True)

    for table, columns in TIMESTAMP_COLUMNS:
        for column in columns:
            op.execute(
                f"ALTER TABLE {table} ALTER COLUMN {column} "
                f"TYPE TIMESTAMP WITH TIME ZONE "
                f"USING {column} AT TIME ZONE 'UTC'"
            )
        # New rows default server-side; existing app code no longer needs
        # to supply created_at/updated_at explicitly.
        if "created_at" in columns:
            op.execute(f"ALTER TABLE {table} ALTER COLUMN created_at SET DEFAULT now()")
        if "updated_at" in columns:
            op.execute(f"ALTER TABLE {table} ALTER COLUMN updated_at SET DEFAULT now()")


def downgrade() -> None:
    for table, columns in TIMESTAMP_COLUMNS:
        if "created_at" in columns:
            op.execute(f"ALTER TABLE {table} ALTER COLUMN created_at DROP DEFAULT")
        if "updated_at" in columns:
            op.execute(f"ALTER TABLE {table} ALTER COLUMN updated_at DROP DEFAULT")
        for column in columns:
            op.execute(
                f"ALTER TABLE {table} ALTER COLUMN {column} "
                f"TYPE TIMESTAMP WITHOUT TIME ZONE "
                f"USING {column} AT TIME ZONE 'UTC'"
            )

    for name, table, _ in FK_INDEXES:
        op.drop_index(name, table_name=table, if_exists=True)
