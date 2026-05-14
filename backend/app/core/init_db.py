from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal, Base
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product
from app.core.security import get_password_hash

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")

def seed_categories(db: Session):
    categories = [
        {"name": "Vanilla", "slug": "vanilla", "description": "Premium vanilla pods and extracts", "sort_order": 1},
        {"name": "Nutmeg & Mace", "slug": "nutmeg-mace", "description": "Fresh nutmeg and mace from Sri Lanka", "sort_order": 2},
        {"name": "Tea", "slug": "tea", "description": "Ceylon tea", "sort_order": 3},
        {"name": "Cardamom", "slug": "cardamom", "description": "Green cardamom pods", "sort_order": 4},
        {"name": "Other Spices", "slug": "other-spices", "description": "Premium quality spices", "sort_order": 5}
    ]
    
    for cat_data in categories:
        category = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not category:
            db.add(Category(**cat_data))
    db.commit()
    print("✓ Categories seeded successfully")

def seed_products(db: Session):
    vanilla_cat = db.query(Category).filter(Category.slug == "vanilla").first()
    nutmeg_cat = db.query(Category).filter(Category.slug == "nutmeg-mace").first()
    tea_cat = db.query(Category).filter(Category.slug == "tea").first()
    cardamom_cat = db.query(Category).filter(Category.slug == "cardamom").first()
    spices_cat = db.query(Category).filter(Category.slug == "other-spices").first()
    
    products = [
        {"name": "Madagascar Vanilla Pods - Grade A", "slug": "madagascar-vanilla-pods-grade-a", "description": "Premium Grade A Madagascar vanilla pods.", "short_description": "Premium Grade A Madagascar vanilla pods, 5 pods per pack", "price": 2500.00, "compare_price": 3000.00, "stock_quantity": 100, "unit": "5 pods", "is_featured": True, "category_id": vanilla_cat.id if vanilla_cat else 1},
        {"name": "Whole Nutmeg - Sri Lankan Premium", "slug": "whole-nutmeg-sri-lankan-premium", "description": "Fresh whole nutmeg from Sri Lanka.", "short_description": "Premium Sri Lankan whole nutmeg, 100g pack", "price": 800.00, "compare_price": 950.00, "stock_quantity": 200, "unit": "100g", "is_featured": True, "category_id": nutmeg_cat.id if nutmeg_cat else 2},
        {"name": "Ceylon Black Tea - Orange Pekoe", "slug": "ceylon-black-tea-orange-pekoe", "description": "Premium Ceylon black tea.", "short_description": "Premium Ceylon black tea, 250g pack", "price": 1500.00, "compare_price": 1800.00, "stock_quantity": 150, "unit": "250g", "is_featured": True, "category_id": tea_cat.id if tea_cat else 3},
        {"name": "Green Cardamom Pods - Premium", "slug": "green-cardamom-pods-premium", "description": "Aromatic green cardamom pods.", "short_description": "Premium green cardamom, 50g pack", "price": 900.00, "stock_quantity": 120, "unit": "50g", "is_featured": True, "category_id": cardamom_cat.id if cardamom_cat else 4},
        {"name": "Ceylon Cinnamon Sticks", "slug": "ceylon-cinnamon-sticks", "description": "True Ceylon cinnamon sticks.", "short_description": "Ceylon cinnamon sticks, 100g pack", "price": 700.00, "compare_price": 850.00, "stock_quantity": 180, "unit": "100g", "is_featured": True, "category_id": spices_cat.id if spices_cat else 5},
    ]
    
    for prod_data in products:
        product = db.query(Product).filter(Product.slug == prod_data["slug"]).first()
        if not product:
            db.add(Product(**prod_data))
    db.commit()
    print("✓ Products seeded successfully")

def seed_users(db: Session):
    # Super Admin
    super_admin = db.query(User).filter(User.email == "super@spiceshop.lk").first()
    if not super_admin:
        db.add(User(
            email="super@spiceshop.lk",
            username="superadmin",
            hashed_password=get_password_hash("Super@123"),
            full_name="Super Admin",
            role=UserRole.SUPER_ADMIN
        ))
        print("✓ Super Admin created")
    
    # Regular Admin
    admin = db.query(User).filter(User.email == "admin@spiceshop.lk").first()
    if not admin:
        db.add(User(
            email="admin@spiceshop.lk",
            username="admin",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Shop Admin",
            role=UserRole.ADMIN
        ))
        print("✓ Admin created")

    db.commit()

def init_database():
    print("Initializing database...")
    create_tables()
    db = SessionLocal()
    try:
        seed_categories(db)
        seed_products(db)
        seed_users(db)
        print("\n✓ Database initialization complete!")
        print("\nDefault credentials:")
        print("  Super Admin: super@spiceshop.lk / Super@123")
        print("  Admin:       admin@spiceshop.lk / Admin@123")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
