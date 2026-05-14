from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user schema with common attributes"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=100)

class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=6, max_length=50)
    
    @validator('password')
    def password_complexity(cls, v):
        """Validate password meets minimum requirements"""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

class UserResponse(UserBase):
    """Schema for user response (excludes sensitive data)"""
    id: int
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    is_active: bool
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    """Schema for JWT token payload"""
    sub: int  # user id
    email: str
    role: str
    exp: Optional[int] = None