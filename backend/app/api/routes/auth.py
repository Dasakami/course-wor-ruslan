from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import AuthResponse, UserCreate, UserLogin, UserResponse, Token, TokenRefresh
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User
from app.utils.jwt import verify_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.create_user(db, user_data)
    tokens = AuthService.create_tokens(user.id)
    return AuthResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        user=user 
    )

@router.post("/login", response_model=AuthResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, login_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    tokens = AuthService.create_tokens(user.id)
    return AuthResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        user=user
    )



@router.post("/refresh", response_model=Token)
def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    token_payload = verify_token(token_data.refresh_token, "refresh")
    if not token_payload or not token_payload.sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недопустимый refresh токен"
        )
    
    tokens = AuthService.create_tokens(int(token_payload.sub))
    return tokens


@router.get("/users/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
