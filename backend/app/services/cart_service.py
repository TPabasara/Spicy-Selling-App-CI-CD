from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User

class CartService:
    """Service for cart operations"""
    
    @staticmethod
    def get_or_create_cart(db: Session, user_id: int) -> Cart:
        """Get user's cart or create if doesn't exist"""
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        
        return cart
    
    @staticmethod
    def add_to_cart(
        db: Session,
        user_id: int,
        product_id: int,
        quantity: int = 1
    ) -> Cart:
        """Add item to cart"""
        # Get or create cart
        cart = CartService.get_or_create_cart(db, user_id)
        
        # Check if product exists and is active
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check stock availability
        if product.stock_quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Only {product.stock_quantity} available"
            )
        
        # Check if item already in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        ).first()
        
        if existing_item:
            # Update quantity
            existing_item.quantity += quantity
            existing_item.unit_price = product.price
        else:
            # Add new item
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
                unit_price=product.price
            )
            db.add(cart_item)
        
        db.commit()
        db.refresh(cart)
        
        return cart
    
    @staticmethod
    def update_cart_item(
        db: Session,
        user_id: int,
        item_id: int,
        quantity: int
    ) -> Cart:
        """Update cart item quantity"""
        cart = CartService.get_or_create_cart(db, user_id)
        
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        # Check stock availability
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if product and quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Only {product.stock_quantity} available"
            )
        
        cart_item.quantity = quantity
        cart_item.unit_price = product.price if product else cart_item.unit_price
        
        db.commit()
        db.refresh(cart)
        
        return cart
    
    @staticmethod
    def remove_from_cart(db: Session, user_id: int, item_id: int) -> Cart:
        """Remove item from cart"""
        cart = CartService.get_or_create_cart(db, user_id)
        
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        db.delete(cart_item)
        db.commit()
        db.refresh(cart)
        
        return cart
    
    @staticmethod
    def clear_cart(db: Session, user_id: int):
        """Clear all items from cart"""
        cart = CartService.get_or_create_cart(db, user_id)
        
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()