"""initial schema - all tables

Revision ID: 20251007_1600
Revises:
Create Date: 2025-10-07 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20251007_1600'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE organizationsize AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE')")
    op.execute("CREATE TYPE userrole AS ENUM ('ADMIN', 'ASSESSOR', 'VIEWER')")
    op.execute("CREATE TYPE domaintype AS ENUM ('DOMAIN1', 'DOMAIN2', 'DOMAIN3', 'DOMAIN4', 'DOMAIN5')")
    op.execute("CREATE TYPE assessmentstatus AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED')")
    op.execute("CREATE TYPE maturitylevel AS ENUM ('LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL5')")

    # Organizations table
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('industry', sa.String(length=255), nullable=True),
        sa.Column('size', postgresql.ENUM('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE', name='organizationsize', create_type=False), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('role', postgresql.ENUM('ADMIN', 'ASSESSOR', 'VIEWER', name='userrole', create_type=False), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Assessments table
    op.create_table(
        'assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('team_name', sa.String(length=255), nullable=False),
        sa.Column('status', postgresql.ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', name='assessmentstatus', create_type=False), nullable=False, server_default='DRAFT'),
        sa.Column('overall_score', sa.Float(), nullable=True),
        sa.Column('maturity_level', postgresql.ENUM('LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL5', name='maturitylevel', create_type=False), nullable=True),
        sa.Column('assessor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['assessor_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Domain scores table
    op.create_table(
        'domain_scores',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('domain', postgresql.ENUM('DOMAIN1', 'DOMAIN2', 'DOMAIN3', 'DOMAIN4', 'DOMAIN5', name='domaintype', create_type=False), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('maturity_level', sa.Integer(), nullable=False),
        sa.Column('strengths', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('gaps', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Gate responses table
    op.create_table(
        'gate_responses',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('domain', postgresql.ENUM('DOMAIN1', 'DOMAIN2', 'DOMAIN3', 'DOMAIN4', 'DOMAIN5', name='domaintype', create_type=False), nullable=False),
        sa.Column('gate_id', sa.String(length=50), nullable=False),
        sa.Column('question_id', sa.String(length=50), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('assessment_id', 'gate_id', 'question_id', name='uq_assessment_gate_question')
    )

    # Create indexes
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_organization_id', 'users', ['organization_id'])
    op.create_index('ix_assessments_assessor_id', 'assessments', ['assessor_id'])
    op.create_index('ix_assessments_organization_id', 'assessments', ['organization_id'])
    op.create_index('ix_assessments_status', 'assessments', ['status'])
    op.create_index('ix_domain_scores_assessment_id', 'domain_scores', ['assessment_id'])
    op.create_index('ix_gate_responses_assessment_id', 'gate_responses', ['assessment_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_gate_responses_assessment_id', table_name='gate_responses')
    op.drop_index('ix_domain_scores_assessment_id', table_name='domain_scores')
    op.drop_index('ix_assessments_status', table_name='assessments')
    op.drop_index('ix_assessments_organization_id', table_name='assessments')
    op.drop_index('ix_assessments_assessor_id', table_name='assessments')
    op.drop_index('ix_users_organization_id', table_name='users')
    op.drop_index('ix_users_email', table_name='users')

    # Drop tables
    op.drop_table('gate_responses')
    op.drop_table('domain_scores')
    op.drop_table('assessments')
    op.drop_table('users')
    op.drop_table('organizations')

    # Drop enum types
    op.execute('DROP TYPE maturitylevel')
    op.execute('DROP TYPE assessmentstatus')
    op.execute('DROP TYPE domaintype')
    op.execute('DROP TYPE userrole')
    op.execute('DROP TYPE organizationsize')
