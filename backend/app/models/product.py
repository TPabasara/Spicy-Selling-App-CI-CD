from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Product(Base):
    """Spice product model"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(220), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    compare_price = Column(Float, nullable=True)  # Original price for showing discounts
    stock_quantity = Column(Integer, default=0)
    unit = Column(String(50), nullable=False)  # e.g., "50g", "100g", "1kg"
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    weight_grams = Column(Integer, nullable=True)  # Weight in grams for delivery calc
    origin = Column(String(100), nullable=True)  # Country/story of origin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    
    def __repr__(self):
        return f"<Product {self.name}>"