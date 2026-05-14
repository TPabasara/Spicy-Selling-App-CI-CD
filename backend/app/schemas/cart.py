from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CartItemCreate(BaseModel):
    """Schema for adding item to cart"""
    product_id: int = Field(..., gt=0)
    quantity: int = Field(1, ge=1, le=99)

class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity"""
    quantity: int = Field(..., ge=1, le=99)

class CartItemResponse(BaseModel):
    """Schema for cart item in response"""
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str]
    unit_price: float
    quantity: int
    subtotal: float
    unit: str
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    """Schema for cart response"""
    id: int
    user_id: int
    items: List[CartItemResponse] = []
    total_items: int = 0
    total_amount: float = 0.0
    
    class Config:
        from_attributes = True