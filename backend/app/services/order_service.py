from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
import random
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.core.config import settings

class OrderService:
    """Service for order operations"""
    
    @staticmethod
    def calculate_delivery_fee(delivery_zone: str, subtotal: float) -> dict:
        """Calculate delivery fee based on zone and cart value"""
        zones = settings.DELIVERY_ZONES
        
        if delivery_zone not in zones:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid delivery zone. Available zones: {', '.join(zones.keys())}"
            )
        
        zone_info = zones[delivery_zone]
        free_threshold = 5000.0  # Free delivery above LKR 5000
        
        # Check if eligible for free delivery
        if subtotal >= free_threshold:
            delivery_fee = 0
            is_free = True
        else:
            delivery_fee = zone_info["fee"]
            is_free = False
        
        return {
            "delivery_zone": delivery_zone,
            "zone_name": zone_info["name"],
            "delivery_fee": delivery_fee,
            "is_free_delivery": is_free,
            "cart_value": subtotal,
            "total_with_delivery": subtotal + delivery_fee,
            "free_delivery_threshold": free_threshold
        }
    
    @staticmethod
    def create_order_from_cart(
        db: Session,
        user_id: int,
        shipping_address: str,
        shipping_city: str,
        shipping_phone: str,
        delivery_zone: str,
        notes: str = None
    ) -> Order:
        """Create order from user's cart"""
        # Get user's cart
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Calculate subtotal
        subtotal = sum(item.subtotal for item in cart.items)
        
        # Calculate delivery fee
        delivery_info = OrderService.calculate_delivery_fee(delivery_zone, subtotal)
        
        # Generate order number
        order_number = f"SP-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
        
        # Create order
        order = Order(
            user_id=user_id,
            order_number=order_number,
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            shipping_address=shipping_address,
            shipping_city=shipping_city,
            shipping_phone=shipping_phone,
            delivery_zone=delivery_zone,
            delivery_fee=delivery_info["delivery_fee"],
            subtotal=subtotal,
            total=delivery_info["total_with_delivery"],
            notes=notes
        )
        
        db.add(order)
        
        # Create order items from cart items
        for cart_item in cart.items:
            product = cart_item.product
            
            # Check stock availability
            if product.stock_quantity < cart_item.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product.name}"
                )
            
            # Create order item
            order_item = OrderItem(
                order=order,
                product_id=product.id,
                product_name=product.name,
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price,
                subtotal=cart_item.subtotal
            )
            
            db.add(order_item)
            
            # Update stock quantity
            product.stock_quantity -= cart_item.quantity
        
        # Clear the cart
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        
        db.commit()
        db.refresh(order)
        
        return order
    
    @staticmethod
    def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 20):
        """Get user's order history"""
        orders = db.query(Order).filter(
            Order.user_id == user_id
        ).order_by(
            Order.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        total = db.query(Order).filter(Order.user_id == user_id).count()
        
        return orders, total
    
    @staticmethod
    def update_order_status(
        db: Session,
        order_id: int,
        status: str,
        payment_status: str = None
    ) -> Order:
        """Update order status (admin)"""
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Validate status
        if status not in [s.value for s in OrderStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Valid values: {[s.value for s in OrderStatus]}"
            )
        
        order.status = status
        
        if payment_status:
            if payment_status not in [ps.value for ps in PaymentStatus]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid payment status"
                )
            order.payment_status = payment_status
        
        db.commit()
        db.refresh(order)
        
        return order