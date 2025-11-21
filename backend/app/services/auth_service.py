from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, Token
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from typing import Optional


class AuthService:
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=user_data.role or UserRole.student
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> Optional[User]:
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user:
            return None
        if not verify_password(login_data.password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_tokens(user_id: int) -> Token:
        access_token = create_access_token(data={"sub": str(user_id)})
        refresh_token = create_refresh_token(data={"sub": str(user_id)})
        return Token(
            access_token=access_token,
            refresh_token=refresh_token
        )
