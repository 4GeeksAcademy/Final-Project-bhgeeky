"""empty message

Revision ID: c81f7422bc37
Revises: 54eb90d151be
Create Date: 2025-05-16 09:20:02.530837

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c81f7422bc37'
down_revision = '54eb90d151be'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('Orders',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('subtotal_amount', sa.Float(), nullable=False),
    sa.Column('total_amount', sa.Float(), nullable=False),
    sa.Column('status', sa.String(length=100), nullable=False),
    sa.Column('adress', sa.String(length=120), nullable=False),
    sa.Column('city', sa.String(length=120), nullable=False),
    sa.Column('postal_code', sa.Integer(), nullable=False),
    sa.Column('country', sa.String(length=120), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('Products', schema=None) as batch_op:
        batch_op.alter_column(
            'price',
            type_=sa.Float(),
            postgresql_using="price::double precision"
        )

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Products', schema=None) as batch_op:
        batch_op.alter_column('price',
               existing_type=sa.Float(),
               type_=sa.VARCHAR(length=120),
               existing_nullable=False)

    op.drop_table('Orders')
    # ### end Alembic commands ###
