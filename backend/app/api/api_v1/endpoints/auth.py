from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud.user import authenticate_user
from app.schemas.user import User, UserLogin
from app.core.security import create_access_token
from app.core.config import settings
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

# Remove the register endpoint completely
# @router.post("/register", response_model=User)
# def register(user_data: UserCreate, db: Session = Depends(get_db)):
#     # Check if user already exists
#     existing_user = get_user_by_email(db, email=user_data.email)
#     if existing_user:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Email already registered"
#         )
#     
#     user = create_user(db, user_data)
#     return user

@router.post("/login")
@limiter.limit("5/minute")  # Only 5 login attempts per minute
def login(request: Request, user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        # Don't reveal whether email exists or not
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
