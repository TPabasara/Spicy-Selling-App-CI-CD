from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category
from fastapi import HTTPException

router = APIRouter()

@router.get("/")
async def get_products(
    q: Optional[str] = None,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    sort_by: str = "name",
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if q:
        query = query.filter(Product.name.ilike(f"%{q}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if is_featured:
        query = query.filter(Product.is_featured == True)
    
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.name.asc())
    
    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()
    pages = (total + limit - 1) // limit
    
    return {
        "items": products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1
    }

@router.get("/featured")
async def get_featured_products(limit: int = 8, db: Session = Depends(get_db)):
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.is_featured == True
    ).limit(limit).all()
    return products

@router.get("/{product_id}")
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/slug/{slug}")
async def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.slug == slug, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
