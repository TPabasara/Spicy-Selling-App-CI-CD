from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar('T')

class PaginationParams(BaseModel):
    """Common pagination parameters"""
    page: int = 1
    limit: int = 20

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response"""
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
    has_next: bool
    has_prev: bool

class MessageResponse(BaseModel):
    """Simple message response"""
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
    error_code: Optional[str] = None