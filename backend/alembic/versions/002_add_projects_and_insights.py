"""Add projects, functional_role, and insights support

Revision ID: 002_add_projects_and_insights
Revises: 001_add_frameworks
Create Date: 2026-02-26

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_projects_and_insights'
down_revision = '001_add_frameworks'
branch_labels = None
depends_on = None


def upgrade():
    # Create projects table
    op.create_table('projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Add functional_role to users (VARCHAR for flexibility)
    op.add_column('users', sa.Column('functional_role', sa.String(50), nullable=True))

    # Add project_id, tags, campaign_id to assessments
    op.add_column('assessments', sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('assessments', sa.Column('tags', sa.ARRAY(sa.String()), nullable=True))
    op.add_column('assessments', sa.Column('campaign_id', sa.String(255), nullable=True))
    op.create_foreign_key('fk_assessment_project', 'assessments', 'projects', ['project_id'], ['id'], ondelete='SET NULL')


def downgrade():
    op.drop_constraint('fk_assessment_project', 'assessments', type_='foreignkey')
    op.drop_column('assessments', 'campaign_id')
    op.drop_column('assessments', 'tags')
    op.drop_column('assessments', 'project_id')
    op.drop_column('users', 'functional_role')
    op.drop_table('projects')
