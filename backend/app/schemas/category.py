from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    """Base category schema"""
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    """Schema for creating a category"""
    image_url: Optional[str] = None
    sort_order: int = 0

class CategoryUpdate(BaseModel):
    """Schema for updating a category"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    """Schema for category response"""
    id: int
    slug: str
    image_url: Optional[str]
    is_active: bool
    sort_order: int
    product_count: int = 0  # Will be populated from relationship
    created_at: datetime
    
    class Config:
        from_attributes = True

class CategoryWithProducts(CategoryResponse):
    """Category with its products included"""
    products: list = []  # Will be populated with ProductResponse objects