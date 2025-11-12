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
    pass


def downgrade() -> None:
    pass
