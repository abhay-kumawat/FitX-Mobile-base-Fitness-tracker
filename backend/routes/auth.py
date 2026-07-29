from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.models import User
from backend.core.security import create_refresh_token, verify_refresh_token, create_access_token
from backend.schemas.schemas import (
    UserCreate, UserLogin, Token, UserOut, ProfileSchema, RefreshTokenInput
)
from backend.services.authentication.signup import register_new_user
from backend.services.authentication.email import authenticate_user_email
from backend.services.authentication.jwt import issue_user_jwt
from backend.services.users.profile import get_or_create_profile, update_user_profile

router = APIRouter(tags=["Authentication & Profiles"])

@router.post("/auth/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = register_new_user(db, user_in)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/auth/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user_email(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    jwt_data = issue_user_jwt(user.id)
    refresh_token = create_refresh_token(user.id)
    return {
        "access_token": jwt_data["access_token"],
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/auth/refresh")
def refresh_access_token(rf_in: RefreshTokenInput):
    user_id_str = verify_refresh_token(rf_in.refresh_token)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
    new_access_token = create_access_token(user_id_str)
    new_refresh_token = create_refresh_token(user_id_str)
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users/profile", response_model=ProfileSchema)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user.id)
    return profile

@router.put("/users/profile", response_model=ProfileSchema)
def update_profile(
    profile_in: ProfileSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = update_user_profile(db, current_user.id, profile_in)
    return profile
