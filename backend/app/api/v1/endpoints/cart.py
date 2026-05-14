from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse
from app.services.cart_service import CartService
from app.api.v1.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's shopping cart.
    Requires authentication.
    """
    cart = CartService.get_or_create_cart(db, current_user.id)
    
    # Calculate totals
    total_items = sum(item.quantity for item in cart.items)
    total_amount = sum(item.subtotal for item in cart.items)
    
    # Build response
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name,
                "product_image": item.product.image_url,
                "unit_price": item.unit_price,
                "quantity": item.quantity,
                "subtotal": item.subtotal,
                "unit": item.product.unit
            }
            for item in cart.items
        ],
        "total_items": total_items,
        "total_amount": total_amount
    }

@router.post("/items", response_model=CartResponse)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add an item to the shopping cart.
    Requires authentication.
    """
    cart = CartService.add_to_cart(
        db,
        current_user.id,
        item_data.product_id,
        item_data.quantity
    )
    
    # Return updated cart
    return await get_cart(current_user, db)

@router.put("/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update quantity of a cart item.
    Requires authentication.
    """
    cart = CartService.update_cart_item(
        db,
        current_user.id,
        item_id,
        item_data.quantity
    )
    
    return await get_cart(current_user, db)

@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove an item from the cart.
    Requires authentication.
    """
    cart = CartService.remove_from_cart(db, current_user.id, item_id)
    
    return await get_cart(current_user, db)

@router.delete("/", response_model=dict)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear all items from the cart.
    Requires authentication.
    """
    CartService.clear_cart(db, current_user.id)
    
    return {"message": "Cart cleared successfully", "success": True}

@router.get("/count")
async def get_cart_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get total number of items in cart.
    Useful for displaying cart badge.
    """
    cart = CartService.get_or_create_cart(db, current_user.id)
    total_items = sum(item.quantity for item in cart.items)
    
    return {"count": total_items}