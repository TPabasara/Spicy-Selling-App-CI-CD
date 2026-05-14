from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.dependencies import get_admin_user, get_super_admin
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.services.order_service import OrderService

router = APIRouter()

# ===== Dashboard =====
@router.get("/dashboard")
async def get_dashboard(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_products = db.query(Product).filter(Product.is_active == True).count()
    total_orders = db.query(Order).count()
    total_users = db.query(User).filter(User.role == "customer").count()
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "orders_today": 0,
        "revenue_today": 0,
        "total_users": total_users
    }

# ===== Product Management =====
@router.post("/products")
async def create_product(product_data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    slug = product_data["name"].lower().replace(" ", "-")
    product = Product(**product_data, slug=slug)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}")
async def update_product(product_id: int, product_data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in product_data.items():
        if hasattr(product, field):
            setattr(product, field, value)
    db.commit()
    return product

@router.delete("/products/{product_id}")
async def delete_product(product_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated", "success": True}

# ===== Category Management =====
@router.post("/categories")
async def create_category(category_data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    slug = category_data["name"].lower().replace(" ", "-")
    category = Category(**category_data, slug=slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/categories/{category_id}")
async def update_category(category_id: int, category_data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in category_data.items():
        if hasattr(category, field):
            setattr(category, field, value)
    db.commit()
    return category

@router.delete("/categories/{category_id}")
async def delete_category(category_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.is_active = False
    db.commit()
    return {"message": "Category deleted", "success": True}

# ===== Order Management =====
@router.get("/orders")
async def get_orders(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).limit(50).all()
    return {"items": orders, "total": len(orders)}

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: int, status_data: dict, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return OrderService.update_order_status(db, order_id, status_data["status"], status_data.get("payment_status"))

# ===== User Management =====
@router.get("/users")
async def get_all_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {"items": users, "total": len(users)}

@router.put("/users/{user_id}/promote")
async def promote_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = UserRole.ADMIN
    db.commit()
    return {"message": "User promoted to admin", "success": True}

@router.put("/users/{user_id}/demote")
async def demote_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=400, detail="Cannot demote super admin")
    user.role = UserRole.CUSTOMER
    db.commit()
    return {"message": "User demoted to customer", "success": True}

@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=400, detail="Cannot deactivate super admin")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "success": True}

# ===== Super Admin Only Endpoints =====
@router.put("/users/{user_id}/make-super-admin")
async def make_super_admin(user_id: int, admin: User = Depends(get_super_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own super admin status")
    user.role = UserRole.SUPER_ADMIN
    db.commit()
    return {"message": f"{user.full_name} is now a Super Admin", "success": True}

@router.put("/users/{user_id}/remove-super-admin")
async def remove_super_admin(user_id: int, admin: User = Depends(get_super_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot remove your own super admin status")
    super_admin_count = db.query(User).filter(User.role == UserRole.SUPER_ADMIN, User.is_active == True).count()
    if super_admin_count <= 1:
        raise HTTPException(status_code=400, detail="Cannot remove the last Super Admin")
    user.role = UserRole.ADMIN
    db.commit()
    return {"message": f"{user.full_name} super admin privileges removed", "success": True}
