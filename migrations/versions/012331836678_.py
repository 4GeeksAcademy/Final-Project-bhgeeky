"""empty message

Revision ID: 012331836678
Revises: bdaca345e234
Create Date: 2025-05-17 09:45:03.507960

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '012331836678'
down_revision = 'bdaca345e234'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(None, 'users', ['user_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('user_id')

    # ### end Alembic commands ###
