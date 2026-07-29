from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.core.database import get_db
from backend.core.security import decode_access_token
from backend.models.models import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    """
    Extracts authenticated User from JWT Bearer token.
    Falls back gracefully to default User(id=1) for backward compatibility if unauthenticated.
    """
    if token:
        user_id_str = decode_access_token(token)
        if user_id_str:
            try:
                user_id = int(user_id_str)
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return user
            except (ValueError, TypeError):
                pass
    
    # Fallback to User ID 1 for legacy compatibility
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        # Auto-create default admin user for initial dev DB
        from backend.core.security import get_password_hash
        user = User(
            id=1,
            email="alex.rivera@fitx.ai",
            hashed_password=get_password_hash("FitXPassword2026!"),
            full_name="Alex Rivera",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_current_user_strict(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    """
    Strict JWT authentication dependency requiring valid Bearer Token.
    Raises 401 Unauthorized if token is missing or invalid.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id_str = decode_access_token(token)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id = int(user_id_str)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Authenticated user account not found."
            )
        return user
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user subject in authorization token."
        )
