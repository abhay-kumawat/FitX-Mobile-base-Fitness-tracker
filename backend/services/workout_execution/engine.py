from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.models.models import WorkoutSession, WorkoutSet, PersonalRecord, MasterExercise, TemporalEvent

def start_new_workout_session(db: Session, user_id: int, name: str, temporal_event_id: Optional[str] = None) -> WorkoutSession:
    if not temporal_event_id:
        # Create an ad-hoc temporal event for this session
        te = TemporalEvent(
            user_id=user_id,
            title=name,
            category="workout",
            event_type="session",
            status="ACTIVE",
            planned_start_at=datetime.utcnow(),
            actual_start_at=datetime.utcnow(),
            source="USER"
        )
        db.add(te)
        db.flush()
        temporal_event_id = te.id
    else:
        # Update existing scheduled event
        te = db.query(TemporalEvent).filter(TemporalEvent.id == temporal_event_id).first()
        if te:
            te.status = "ACTIVE"
            te.actual_start_at = datetime.utcnow()

    session = WorkoutSession(
        user_id=user_id,
        temporal_event_id=temporal_event_id,
        name=name,
        status="in_progress",
        start_time=datetime.utcnow(),
        duration_seconds=0,
        total_volume_kg=0.0,
        total_sets_completed=0,
        calories_burned=0.0,
        avg_heart_rate=125,
        ai_guidance_logs=[{
            "timestamp": datetime.utcnow().isoformat(),
            "message": f"Session '{name}' initialized. AI Live Coach active."
        }]
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def calculate_epley_1rm(weight_kg: float, reps: int) -> float:
    if reps <= 0:
        return 0.0
    if reps == 1:
        return weight_kg
    return round(weight_kg * (1.0 + (reps / 30.0)), 1)

def log_workout_set(
    db: Session,
    user_id: int,
    session_id: int,
    exercise_name: str,
    set_number: int,
    set_type: str,
    weight_kg: float,
    reps: int,
    rpe: float,
    rir: int,
    tempo: str,
    rest_seconds: int,
    pain_level: int,
    form_rating: int,
    notes: str,
    planned_reps: int = 0,
    target_weight_kg: float = 0.0,
    failure_reason: Optional[str] = None,
    actual_rest_seconds: int = 0,
    is_ai_modified: bool = False,
    is_manual_modified: bool = False,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None
) -> Dict[str, Any]:
    session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id, WorkoutSession.user_id == user_id).first()
    if not session:
        raise ValueError("Workout session not found.")

    estimated_1rm = calculate_epley_1rm(weight_kg, reps)
    is_pr = False
    pr_type = None

    # Check for existing PR for this exercise
    existing_1rm_pr = db.query(PersonalRecord).filter(
        PersonalRecord.user_id == user_id,
        PersonalRecord.exercise_name == exercise_name,
        PersonalRecord.record_type == "estimated_1rm"
    ).first()

    if weight_kg > 0 and reps > 0:
        if not existing_1rm_pr:
            is_pr = True
            pr_type = "estimated_1rm"
            new_pr = PersonalRecord(
                user_id=user_id,
                exercise_name=exercise_name,
                record_type="estimated_1rm",
                value=estimated_1rm,
                unit="kg",
                notes=f"First recorded PR! ({weight_kg}kg x {reps})"
            )
            db.add(new_pr)
        elif estimated_1rm > existing_1rm_pr.value:
            is_pr = True
            pr_type = "estimated_1rm"
            existing_1rm_pr.value = estimated_1rm
            existing_1rm_pr.achieved_at = datetime.utcnow()
            existing_1rm_pr.notes = f"New 1RM Record! ({weight_kg}kg x {reps})"

    new_set = WorkoutSet(
        session_id=session_id,
        exercise_name=exercise_name,
        set_number=set_number,
        set_type=set_type,
        weight_kg=weight_kg,
        reps=reps,
        planned_reps=planned_reps,
        target_weight_kg=target_weight_kg,
        failure_reason=failure_reason,
        rpe=rpe,
        rir=rir,
        tempo=tempo,
        rest_seconds=rest_seconds,
        actual_rest_seconds=actual_rest_seconds,
        is_completed=True,
        is_ai_modified=is_ai_modified,
        is_manual_modified=is_manual_modified,
        is_pr=is_pr,
        pain_level=pain_level,
        form_rating=form_rating,
        notes=notes,
        start_time=start_time,
        end_time=end_time
    )
    db.add(new_set)

    # Update session metrics
    session.total_volume_kg += (weight_kg * reps)
    session.total_sets_completed += 1
    session.calories_burned += round(weight_kg * reps * 0.05 + 4.5, 1)

    # Generate live AI coach feedback
    ai_advice = generate_live_set_advice(exercise_name, weight_kg, reps, rpe, pain_level)
    session.ai_guidance_logs.append({
        "timestamp": datetime.utcnow().isoformat(),
        "exercise": exercise_name,
        "set_number": set_number,
        "advice": ai_advice
    })

    db.commit()
    db.refresh(new_set)
    db.refresh(session)

    return {
        "set": new_set,
        "estimated_1rm": estimated_1rm,
        "is_pr": is_pr,
        "pr_type": pr_type,
        "ai_advice": ai_advice
    }

def generate_live_set_advice(exercise_name: str, weight_kg: float, reps: int, rpe: float, pain_level: int) -> str:
    if pain_level >= 5:
        return f"🚨 Pain level {pain_level}/10 reported on {exercise_name}. Immediately terminate set and substitute with joint-friendly alternative."
    if rpe <= 6.0:
        return f"⚡ RPE {rpe} was light. Consider increasing weight by 2.5kg for your next set."
    elif rpe >= 9.5:
        return f"🔥 High intensity (RPE {rpe}). Increase rest by 30s before the next set to prevent neural fatigue."
    elif reps >= 12 and rpe <= 7.5:
        return f"💪 Excellent rep target hit ({reps} reps). High hypertrophy yield!"
    else:
        return f"✅ Target intensity achieved (RPE {rpe}). Maintain form and tempo."

def complete_workout_session(db: Session, user_id: int, session_id: int, notes: str = "") -> WorkoutSession:
    session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id, WorkoutSession.user_id == user_id).first()
    if not session:
        raise ValueError("Workout session not found.")

    session.status = "completed"
    session.end_time = datetime.utcnow()
    if session.start_time:
        duration = (session.end_time - session.start_time).total_seconds()
        session.duration_seconds = int(duration)
    session.notes = notes

    if session.temporal_event_id:
        te = db.query(TemporalEvent).filter(TemporalEvent.id == session.temporal_event_id).first()
        if te:
            te.status = "COMPLETED"
            te.actual_end_at = session.end_time
            te.duration_minutes = session.duration_seconds // 60
            te.metadata_payload = {
                "total_volume_kg": session.total_volume_kg,
                "total_sets": session.total_sets_completed,
                "calories_burned": session.calories_burned
            }

    db.commit()
    db.refresh(session)
    return session
