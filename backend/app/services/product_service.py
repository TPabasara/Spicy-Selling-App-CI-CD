from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from typing import Optional
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate, ProductSearchParams

class ProductService:
    """Service for product-related operations"""
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Product:
        """Get product by ID with error handling"""
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return product
    
    @staticmethod
    def get_products(
        db: Session,
        search_params: ProductSearchParams,
        active_only: bool = True
    ) -> tuple:
        """Get products with filtering, search, and pagination"""
        query = db.query(Product)
        
        # Filter active products only
        if active_only:
            query = query.filter(Product.is_active == True)
        
        # Category filter
        if search_params.category_id:
            query = query.filter(Product.category_id == search_params.category_id)
        
        # Search by name or description
        if search_params.q:
            search_term = f"%{search_params.q}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term),
                    Product.short_description.ilike(search_term)
                )
            )
        
        # Price range filter
        if search_params.min_price is not None:
            query = query.filter(Product.price >= search_params.min_price)
        if search_params.max_price is not None:
            query = query.filter(Product.price <= search_params.max_price)
        
        # Featured products
        if search_params.is_featured:
            query = query.filter(Product.is_featured == True)
        
        # Sorting
        if search_params.sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif search_params.sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif search_params.sort_by == "newest":
            query = query.order_by(Product.created_at.desc())
        else:
            query = query.order_by(Product.name.asc())
        
        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        products = query.offset(
            (search_params.page - 1) * search_params.limit
        ).limit(search_params.limit).all()
        
        return products, total
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        """Create a new product"""
        # Check if category exists
        category = db.query(Category).filter(
            Category.id == product_data.category_id,
            Category.is_active == True
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Create slug from name
        slug = product_data.name.lower().replace(' ', '-')
        
        db_product = Product(
            **product_data.model_dump(),
            slug=slug
        )
        
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        return db_product
    
    @staticmethod
    def update_product(
        db: Session,
        product_id: int,
        product_data: ProductUpdate
    ) -> Product:
        """Update an existing product"""
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Update only provided fields
        update_data = product_data.model_dump(exclude_unset=True)
        
        if 'name' in update_data:
            update_data['slug'] = update_data['name'].lower().replace(' ', '-')
        
        for field, value in update_data.items():
            setattr(product, field, value)
        
        db.commit()
        db.refresh(product)
        
        return product
    
    @staticmethod
    def delete_product(db: Session, product_id: int):
        """Soft delete a product (deactivate)"""
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        product.is_active = False
        db.commit()