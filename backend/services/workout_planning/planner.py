from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
from backend.models.models import WorkoutPlan, TemporalEvent, User

def create_workout_plan(db: Session, user_id: int, name: str, goal: str, workout_data: dict, scheduled_start: datetime) -> WorkoutPlan:
    """
    Creates a workout plan and schedules it via the Temporal Event System.
    """
    # 1. Create the Temporal Event
    te = TemporalEvent(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=f"Workout: {name}",
        category="workout",
        event_type="session",
        status="SCHEDULED",
        planned_start_at=scheduled_start,
        source="USER"
    )
    db.add(te)
    db.flush()

    # 2. Create the Workout Plan
    plan = WorkoutPlan(
        user_id=user_id,
        master_event_id=te.id,
        name=name,
        goal=goal,
        workout_data=workout_data
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    return plan

def get_upcoming_plans(db: Session, user_id: int, days_ahead: int = 7) -> list:
    """
    Fetches upcoming scheduled workout plans.
    """
    end_date = datetime.utcnow() + timedelta(days=days_ahead)
    
    events = db.query(TemporalEvent).filter(
        TemporalEvent.user_id == user_id,
        TemporalEvent.category == "workout",
        TemporalEvent.event_type == "session",
        TemporalEvent.status == "SCHEDULED",
        TemporalEvent.planned_start_at >= datetime.utcnow(),
        TemporalEvent.planned_start_at <= end_date
    ).all()
    
    return events
