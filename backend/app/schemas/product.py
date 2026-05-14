from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    """Base product schema"""
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    compare_price: Optional[float] = Field(None, gt=0)
    unit: str = Field(..., description="e.g., 50g, 100g, 1kg")
    weight_grams: Optional[int] = Field(None, gt=0)
    origin: Optional[str] = None

class ProductCreate(ProductBase):
    """Schema for creating a product"""
    category_id: int = Field(..., gt=0)
    stock_quantity: int = Field(0, ge=0)
    image_url: Optional[str] = None
    is_featured: bool = False
    
    @validator('compare_price')
    def compare_price_must_be_greater(cls, v, values):
        """Validate compare price is greater than regular price"""
        if v and 'price' in values and v <= values['price']:
            raise ValueError('Compare price must be greater than regular price')
        return v

class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    compare_price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = None
    weight_grams: Optional[int] = Field(None, gt=0)
    origin: Optional[str] = None
    category_id: Optional[int] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class ProductResponse(ProductBase):
    """Schema for product response"""
    id: int
    slug: str
    stock_quantity: int
    image_url: Optional[str]
    is_active: bool
    is_featured: bool
    category_id: int
    category_name: Optional[str] = None  # Populated from relationship
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductSearchParams(BaseModel):
    """Schema for product search/filter parameters"""
    q: Optional[str] = None
    category_id: Optional[int] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    is_featured: Optional[bool] = None
    sort_by: Optional[str] = "name"  # name, price_asc, price_desc, newest
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)