from sqlalchemy.orm import Session
from backend.models.models import User
from backend.core.security import verify_password

def authenticate_user_email(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
