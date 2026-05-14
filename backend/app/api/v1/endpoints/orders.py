from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, DeliveryCostRequest, DeliveryCostResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.order_service import OrderService
from app.models.order import Order
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from fastapi import HTTPException, status

router = APIRouter()

@router.post("/delivery-cost", response_model=DeliveryCostResponse)
async def calculate_delivery(
    delivery_req: DeliveryCostRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Calculate delivery cost based on delivery zone and cart value.
    """
    delivery_info = OrderService.calculate_delivery_fee(
        delivery_req.delivery_zone,
        delivery_req.cart_value
    )
    
    return delivery_info

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new order from the current user's cart.
    Requires authentication.
    """
    order = OrderService.create_order_from_cart(
        db,
        current_user.id,
        order_data.shipping_address,
        order_data.shipping_city,
        order_data.shipping_phone,
        order_data.delivery_zone,
        order_data.notes
    )
    
    return order

@router.get("/", response_model=PaginatedResponse[OrderResponse])
async def get_my_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's order history.
    Requires authentication.
    """
    skip = (page - 1) * limit
    orders, total = OrderService.get_user_orders(db, current_user.id, skip, limit)
    
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=orders,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1
    )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific order details.
    Users can only view their own orders.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order or is admin
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return order

@router.get("/track/{order_number}", response_model=OrderResponse)
async def track_order(
    order_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Track an order by order number.
    """
    order = db.query(Order).filter(Order.order_number == order_number).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only allow tracking own orders
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return order