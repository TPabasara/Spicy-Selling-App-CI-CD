from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App
    APP_NAME: str = "SpiceShop API"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://spice_user:spice_password@localhost:5432/spice_shop"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # Delivery Zones (simplified - in production, use a proper service)
    DELIVERY_ZONES: dict = {
        "colombo": {"fee": 300, "name": "Colombo"},
        "suburbs": {"fee": 500, "name": "Suburbs"},
        "outstation": {"fee": 800, "name": "Outstation"}
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()