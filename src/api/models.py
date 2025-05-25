from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

class User(db.Model):
    __tablename__= "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_name: Mapped[int] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(600), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), unique=False, nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), unique=False, nullable=False)
    phone: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    address: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<User: {self.id} - {self.email}>'


    def serialize(self):
        return {
            "user_id": self.id,
            "user_name": self.user_name,
            "email": self.email,
            "is_active": self.is_active,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "address": self.address
        }
    
    
    favorites = db.relationship("Favorites", back_populates="user")
    shopping_cart = db.relationship("ShoppingCart", back_populates="user")
    product = db.relationship("Products", back_populates="user")



class Products(db.Model):
    __tablename__= "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String(400), unique=False, nullable=False)
    img: Mapped[str] = mapped_column(String(500), unique=False, nullable=False)
    brand: Mapped[str] = mapped_column(String(120), unique=False, nullable=False)
    type: Mapped[str] = mapped_column(String(120), unique=False, nullable=False)
    price: Mapped[float] = mapped_column(nullable=False)
    stock: Mapped[str] = mapped_column(String(120), unique=False, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)


    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "img": self.img,
            "brand": self.brand,
            "type": self.type,
            "price": self.price,
            "stock": self.stock
        }
    
    favorites = db.relationship("Favorites", back_populates="product")
    products_in_order = db.relationship("ProductsInOrder", back_populates="product")
    shopping_cart = db.relationship("ShoppingCart", back_populates="product")
    user = db.relationship("User", back_populates="product")


class Orders(db.Model):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    subtotal_amount: Mapped[float] = mapped_column(nullable=False)
    total_amount: Mapped[float] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(String(100), unique=False, nullable=False)
    adress: Mapped[str] = mapped_column(String(120), unique=False, nullable=False)
    city: Mapped[str] = mapped_column(String(120), unique=False, nullable=False)
    postal_code: Mapped[int] = mapped_column(nullable=False)
    country: Mapped[str] = mapped_column(String(120), unique=False, nullable=False)


    def serialize(self):
        return {
            "id": self.id,
            "subtotal_amount": self.subtotal_amount,
            "total_amount": self.total_amount,
            "status": self.status,
            "adress": self.adress,
            "city": self.city,
            "postal_code": self.postal_code,
            "country": self.country

        }
    
    products_in_order = db.relationship("ProductsInOrder", back_populates="order")
    checkout = db.relationship("Checkout", back_populates="order")


class ProductsInOrder(db.Model):
    __tablename__ = "products_in_order"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)

    def serialize(self):
        return{
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id
        }
    
    product = db.relationship("Products", back_populates="products_in_order")
    order = db.relationship("Orders", back_populates="products_in_order")

class Checkout(db.Model):
    __tablename__ = "checkout"
    id: Mapped[int] = mapped_column(primary_key=True)
    payment_method: Mapped[str] = mapped_column(String(120), nullable=False, unique=False)
    status: Mapped[str] = mapped_column(Enum("pending", "received", "completed", name="status_transaction"), nullable=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    def serialize(self):
        return{
            "id": self.id,
            "payment_method": self.payment_method,
            "status": self.status,
            "order_id": self.order_id,
            "user_id": self.user_id
        }

    order = db.relationship("Orders", back_populates="checkout")

class ShoppingCart(db.Model):
    __tablename__ = "shopping_cart"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    cart_id: Mapped[str] = mapped_column(nullable=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(default=1, nullable=False)

    user = db.relationship("User", back_populates="shopping_cart")
    product = db.relationship("Products", back_populates="shopping_cart")

    def serialize(self):
        product_name = self.product.name if self.product else "Producto Desconocido"
        product_price = self.product.price if self.product else 0.00 

        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "cart_id": self.cart_id,
            "quantity": self.quantity,
            "product_name": product_name,
            "product_price": product_price 
        }

class Favorites(db.Model):
    __tablename__ = "favorites"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id
        }
    
    user = db.relationship("User", back_populates="favorites")
    product = db.relationship("Products", back_populates="favorites")