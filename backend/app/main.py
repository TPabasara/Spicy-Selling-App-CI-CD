from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import api_router

# Import all models so they register with Base metadata
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem

# AUTO-CREATE TABLES on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="E-commerce API for traditional spice shop",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to SpiceShop API",
        "docs": "/docs",
        "version": "1.0.0"
    }
