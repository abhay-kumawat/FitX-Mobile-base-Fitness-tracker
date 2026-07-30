from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.models.models import WorkoutSession, WorkoutSet, PersonalRecord, MasterExercise

def calculate_weekly_volume(db: Session, user_id: int) -> float:
    """Calculates total volume (kg) lifted by the user in the last 7 days."""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    total_volume = db.query(func.sum(WorkoutSession.total_volume_kg)).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.start_time >= seven_days_ago,
        WorkoutSession.status == "completed"
    ).scalar()
    
    return total_volume or 0.0

def calculate_monthly_volume(db: Session, user_id: int) -> float:
    """Calculates total volume (kg) lifted by the user in the last 30 days."""
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    total_volume = db.query(func.sum(WorkoutSession.total_volume_kg)).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.start_time >= thirty_days_ago,
        WorkoutSession.status == "completed"
    ).scalar()
    
    return total_volume or 0.0

def get_muscle_frequency(db: Session, user_id: int, days: int = 30) -> Dict[str, int]:
    """
    Returns how many times each muscle group was targeted in the last `days`.
    Requires joining WorkoutSession -> WorkoutSet -> MasterExercise
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get all sets from the last X days for this user
    sets = db.query(WorkoutSet, MasterExercise).join(
        WorkoutSession, WorkoutSession.id == WorkoutSet.session_id
    ).join(
        MasterExercise, MasterExercise.name == WorkoutSet.exercise_name
    ).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.start_time >= start_date,
        WorkoutSet.is_completed == True
    ).all()
    
    frequency: Dict[str, int] = {}
    for s, ex in sets:
        pm = ex.primary_muscle.lower()
        frequency[pm] = frequency.get(pm, 0) + 1
        
        for sm in ex.secondary_muscles:
            sm_lower = sm.lower()
            frequency[sm_lower] = frequency.get(sm_lower, 0) + 1
            
    return frequency

def get_recent_prs(db: Session, user_id: int, limit: int = 5) -> List[Dict[str, Any]]:
    """Fetches the most recent personal records for the user."""
    prs = db.query(PersonalRecord).filter(
        PersonalRecord.user_id == user_id
    ).order_by(PersonalRecord.achieved_at.desc()).limit(limit).all()
    
    return [
        {
            "exercise": pr.exercise_name,
            "record_type": pr.record_type,
            "value": pr.value,
            "unit": pr.unit,
            "date": pr.achieved_at.isoformat(),
            "notes": pr.notes
        } for pr in prs
    ]
