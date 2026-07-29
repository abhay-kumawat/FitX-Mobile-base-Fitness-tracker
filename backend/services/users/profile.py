from sqlalchemy.orm import Session
from backend.models.models import Profile
from backend.schemas.schemas import ProfileSchema

def get_or_create_profile(db: Session, user_id: int) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

def update_user_profile(db: Session, user_id: int, profile_in: ProfileSchema) -> Profile:
    profile = get_or_create_profile(db, user_id)
    profile.height_cm = profile_in.height_cm
    profile.weight_kg = profile_in.weight_kg
    profile.body_fat_pct = profile_in.body_fat_pct
    profile.fitness_goal = profile_in.fitness_goal
    profile.fitness_level = profile_in.fitness_level
    profile.dietary_preference = profile_in.dietary_preference
    profile.region = profile_in.region
    profile.daily_meal_budget = profile_in.daily_meal_budget
    profile.active_injuries = profile_in.active_injuries
    profile.available_equipment = profile_in.available_equipment
    
    db.commit()
    db.refresh(profile)
    return profile
