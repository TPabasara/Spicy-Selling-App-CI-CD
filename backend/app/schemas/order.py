from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderItemResponse(BaseModel):
    """Schema for order item in response"""
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    """Schema for creating an order from cart"""
    shipping_address: str = Field(..., min_length=10, max_length=500)
    shipping_city: str = Field(..., min_length=2, max_length=100)
    shipping_phone: str = Field(..., min_length=10, max_length=20)
    delivery_zone: str = Field(..., description="colombo, suburbs, or outstation")
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    """Schema for order response"""
    id: int
    user_id: int
    order_number: str
    status: str
    payment_status: str
    shipping_address: str
    shipping_city: str
    shipping_phone: str
    delivery_zone: str
    delivery_fee: float
    subtotal: float
    total: float
    notes: Optional[str]
    items: List[OrderItemResponse] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    """Schema for updating order status (admin)"""
    status: str
    payment_status: Optional[str] = None

class DeliveryCostRequest(BaseModel):
    """Schema for calculating delivery cost"""
    delivery_zone: str = Field(..., description="colombo, suburbs, or outstation")
    cart_value: float = Field(..., ge=0)

class DeliveryCostResponse(BaseModel):
    """Schema for delivery cost response"""
    delivery_zone: str
    zone_name: str
    delivery_fee: float
    free_delivery_threshold: float = 5000.0  # Free delivery above this amount
    is_free_delivery: bool
    cart_value: float
    total_with_delivery: float