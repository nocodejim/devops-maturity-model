"""update_domain_enum_values

Revision ID: 2d801ad1aac1
Revises: 20251007_1600
Create Date: 2025-10-15 04:09:01.452365+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2d801ad1aac1'
down_revision: Union[str, None] = '20251007_1600'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new enum type with updated values
    op.execute("""
        CREATE TYPE domaintype_new AS ENUM (
            'source_control',
            'security', 
            'cicd',
            'infrastructure',
            'observability'
        )
    """)
    
    # Update domain_scores table
    op.execute("""
        ALTER TABLE domain_scores 
        ALTER COLUMN domain TYPE domaintype_new 
        USING (
            CASE domain::text
                WHEN 'DOMAIN1' THEN 'source_control'::domaintype_new
                WHEN 'DOMAIN2' THEN 'security'::domaintype_new
                WHEN 'DOMAIN3' THEN 'cicd'::domaintype_new
                WHEN 'DOMAIN4' THEN 'infrastructure'::domaintype_new
                WHEN 'DOMAIN5' THEN 'observability'::domaintype_new
            END
        )
    """)
    
    # Update gate_responses table
    op.execute("""
        ALTER TABLE gate_responses 
        ALTER COLUMN domain TYPE domaintype_new 
        USING (
            CASE domain::text
                WHEN 'DOMAIN1' THEN 'source_control'::domaintype_new
                WHEN 'DOMAIN2' THEN 'security'::domaintype_new
                WHEN 'DOMAIN3' THEN 'cicd'::domaintype_new
                WHEN 'DOMAIN4' THEN 'infrastructure'::domaintype_new
                WHEN 'DOMAIN5' THEN 'observability'::domaintype_new
            END
        )
    """)
    
    # Drop old enum type
    op.execute("DROP TYPE domaintype")
    
    # Rename new enum type to original name
    op.execute("ALTER TYPE domaintype_new RENAME TO domaintype")


def downgrade() -> None:
    # Create old enum type
    op.execute("""
        CREATE TYPE domaintype_old AS ENUM (
            'DOMAIN1',
            'DOMAIN2',
            'DOMAIN3',
            'DOMAIN4',
            'DOMAIN5'
        )
    """)
    
    # Revert domain_scores table
    op.execute("""
        ALTER TABLE domain_scores 
        ALTER COLUMN domain TYPE domaintype_old 
        USING (
            CASE domain::text
                WHEN 'source_control' THEN 'DOMAIN1'::domaintype_old
                WHEN 'security' THEN 'DOMAIN2'::domaintype_old
                WHEN 'cicd' THEN 'DOMAIN3'::domaintype_old
                WHEN 'infrastructure' THEN 'DOMAIN4'::domaintype_old
                WHEN 'observability' THEN 'DOMAIN5'::domaintype_old
            END
        )
    """)
    
    # Revert gate_responses table
    op.execute("""
        ALTER TABLE gate_responses 
        ALTER COLUMN domain TYPE domaintype_old 
        USING (
            CASE domain::text
                WHEN 'source_control' THEN 'DOMAIN1'::domaintype_old
                WHEN 'security' THEN 'DOMAIN2'::domaintype_old
                WHEN 'cicd' THEN 'DOMAIN3'::domaintype_old
                WHEN 'infrastructure' THEN 'DOMAIN4'::domaintype_old
                WHEN 'observability' THEN 'DOMAIN5'::domaintype_old
            END
        )
    """)
    
    # Drop new enum type
    op.execute("DROP TYPE domaintype")
    
    # Rename old enum type back
    op.execute("ALTER TYPE domaintype_old RENAME TO domaintype")
