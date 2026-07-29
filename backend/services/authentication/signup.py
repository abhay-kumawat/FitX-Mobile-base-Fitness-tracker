from sqlalchemy.orm import Session
from backend.models.models import User, Profile, StreakRecord
from backend.core.security import get_password_hash
from backend.schemas.schemas import UserCreate

def register_new_user(db: Session, user_in: UserCreate) -> User:
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise ValueError("User with this email already exists.")

    hashed = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default profile & streak tracker
    profile = Profile(user_id=user.id)
    streak = StreakRecord(user_id=user.id, current_streak=0, highest_streak=0)
    db.add(profile)
    db.add(streak)
    db.commit()

    return user
