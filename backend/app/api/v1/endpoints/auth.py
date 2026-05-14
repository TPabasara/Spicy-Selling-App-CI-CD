from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.auth_service import AuthService
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.core.security import create_access_token

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.register_user(db, user_data)
    # FIX: Convert to string
    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    from app.schemas.user import UserLogin
    login_data = UserLogin(email=username, password=password)
    return AuthService.authenticate_user(db, login_data)

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_fields = ['full_name', 'phone', 'address', 'city']
    for field, value in profile_data.items():
        if field in allowed_fields and value is not None:
            setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
