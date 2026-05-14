from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, categories, cart, orders, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(cart.router, prefix="/cart", tags=["Shopping Cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
