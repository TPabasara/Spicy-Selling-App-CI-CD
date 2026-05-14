from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.schemas.category import CategoryResponse, CategoryWithProducts
from app.models.category import Category
from app.models.product import Product
from fastapi import HTTPException, status

router = APIRouter()

@router.get("/", response_model=list[CategoryResponse])
async def get_categories(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    List all product categories.
    """
    query = db.query(Category)
    
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    
    categories = query.order_by(Category.sort_order).all()
    
    # Add product count to each category
    for category in categories:
        category.product_count = db.query(Product).filter(
            Product.category_id == category.id,
            Product.is_active == True
        ).count()
    
    return categories

@router.get("/{category_id}", response_model=CategoryWithProducts)
async def get_category_with_products(
    category_id: int,
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get category details with its products.
    """
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.is_active == True
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Get active products in this category
    category.products = db.query(Product).filter(
        Product.category_id == category_id,
        Product.is_active == True
    ).limit(limit).all()
    
    return category