# Import all models here to ensure they're registered with SQLAlchemy
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem

# This ensures all models are imported when running Alembic migrations
__all__ = [
    "User",
    "Category", 
    "Product",
    "Cart",
    "CartItem",
    "Order",
    "OrderItem"
]