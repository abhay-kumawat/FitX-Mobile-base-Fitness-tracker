from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.models import User, WorkoutSession, PersonalRecord
from backend.schemas.schemas import (
    WorkoutSessionStartInput, WorkoutSessionOut, LogSetInput,
    PlateCalculatorOut, WarmupProtocolOut, WarmupSetItem, MasterExerciseOut,
    AIWorkoutRecommendationOut
)
from backend.services.workout_execution.engine import (
    start_new_workout_session, log_workout_set, complete_workout_session
)
from backend.services.workout_intelligence.injury_engine import get_safe_alternatives
from backend.services.workout_intelligence.progression_engine import calculate_weekly_volume, get_recent_prs
from backend.models.models import TemporalEvent, MasterExercise

router = APIRouter(prefix="/workout", tags=["Intelligent Workout Engine"])

@router.post("/start", response_model=WorkoutSessionOut)
def start_session(
    inp: WorkoutSessionStartInput,
    temporal_event_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = start_new_workout_session(db, current_user.id, inp.name, temporal_event_id)
    return session

@router.post("/log-set")
def log_set(
    inp: LogSetInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = log_workout_set(
        db=db,
        user_id=current_user.id,
        session_id=inp.session_id,
        exercise_name=inp.exercise_name,
        set_number=inp.set_number,
        set_type=inp.set_type,
        planned_reps=inp.planned_reps,
        reps=inp.reps,
        target_weight_kg=inp.target_weight_kg,
        weight_kg=inp.weight_kg,
        failure_reason=inp.failure_reason,
        rpe=inp.rpe,
        rir=inp.rir,
        tempo=inp.tempo,
        rest_seconds=inp.rest_seconds,
        actual_rest_seconds=inp.actual_rest_seconds,
        is_ai_modified=inp.is_ai_modified,
        is_manual_modified=inp.is_manual_modified,
        pain_level=inp.pain_level,
        form_rating=inp.form_rating,
        notes=inp.notes,
        start_time=inp.start_time,
        end_time=inp.end_time
    )
    return {
        "status": "success",
        "set_id": res["set"].id,
        "estimated_1rm": res["estimated_1rm"],
        "is_pr": res["is_pr"],
        "ai_advice": res["ai_advice"]
    }

@router.post("/complete")
def complete_session(
    session_id: int,
    notes: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = complete_workout_session(db, current_user.id, session_id, notes)
    return {
        "status": "completed",
        "session_id": session.id,
        "total_volume_kg": session.total_volume_kg,
        "total_sets": session.total_sets_completed
    }

@router.get("/active", response_model=Optional[WorkoutSessionOut])
def get_active_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.status == "in_progress"
    ).order_by(WorkoutSession.id.desc()).first()
    return session

@router.get("/plate-calculator", response_model=PlateCalculatorOut)
def calculate_plates(
    target_weight_kg: float = 100.0,
    barbell_weight_kg: float = 20.0,
    current_user: User = Depends(get_current_user)
):
    """
    Computes exact barbell plate counts (25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, 1.25kg) per side.
    """
    if target_weight_kg < barbell_weight_kg:
        return PlateCalculatorOut(
            target_weight_kg=target_weight_kg,
            barbell_weight_kg=barbell_weight_kg,
            weight_per_side_kg=0.0,
            plates_per_side={},
            is_exact_match=True
        )

    rem = (target_weight_kg - barbell_weight_kg) / 2.0
    weight_per_side = rem
    available_plates = [25.0, 20.0, 15.0, 10.0, 5.0, 2.5, 1.25]
    plates_count: Dict[str, int] = {}

    for plate in available_plates:
        count = int(rem // plate)
        if count > 0:
            plates_count[f"{plate}kg"] = count
            rem -= count * plate

    return PlateCalculatorOut(
        target_weight_kg=target_weight_kg,
        barbell_weight_kg=barbell_weight_kg,
        weight_per_side_kg=weight_per_side,
        plates_per_side=plates_count,
        is_exact_match=(rem == 0.0)
    )

@router.get("/warmup-protocol", response_model=WarmupProtocolOut)
def get_warmup_protocol(
    exercise_name: str = "Barbell Back Squat",
    working_weight_kg: float = 100.0,
    current_user: User = Depends(get_current_user)
):
    w1 = round(working_weight_kg * 0.40, 1)
    w2 = round(working_weight_kg * 0.60, 1)
    w3 = round(working_weight_kg * 0.80, 1)

    return WarmupProtocolOut(
        exercise_name=exercise_name,
        working_weight_kg=working_weight_kg,
        warmup_sets=[
            WarmupSetItem(set_number=1, weight_kg=20.0, reps=10, pct_working_weight=20.0),
            WarmupSetItem(set_number=2, weight_kg=w1, reps=8, pct_working_weight=40.0),
            WarmupSetItem(set_number=3, weight_kg=w2, reps=5, pct_working_weight=60.0),
            WarmupSetItem(set_number=4, weight_kg=w3, reps=3, pct_working_weight=80.0),
        ]
    )

@router.get("/intelligence/safe-alternatives", response_model=List[MasterExerciseOut])
def safe_alternatives(
    target_muscle: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns safe alternative exercises for a given muscle based on active injuries."""
    safe_exs = get_safe_alternatives(db, current_user.id, target_muscle)
    return safe_exs

@router.get("/intelligence/progression-dashboard")
def progression_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns summary of recent volume and PRs."""
    vol = calculate_weekly_volume(db, current_user.id)
    prs = get_recent_prs(db, current_user.id)
    return {
        "weekly_volume_kg": vol,
        "recent_prs": prs
    }

@router.get("/exercises/search", response_model=List[MasterExerciseOut])
def search_exercises(
    query: Optional[str] = None,
    muscle: Optional[str] = None,
    equipment: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Production-grade exercise search with smart filtering."""
    q = db.query(MasterExercise)
    if query:
        q = q.filter(MasterExercise.name.ilike(f"%{query}%"))
    if muscle:
        q = q.filter(MasterExercise.primary_muscle.ilike(f"%{muscle}%"))
    if equipment:
        q = q.filter(MasterExercise.equipment.ilike(f"%{equipment}%"))
    if difficulty:
        q = q.filter(MasterExercise.difficulty == difficulty)
        
    return q.limit(50).all()

@router.get("/intelligence/recommendations", response_model=List[AIWorkoutRecommendationOut])
def get_ai_recommendations(
    session_id: Optional[int] = None,
    context_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import AIWorkoutRecommendation
    q = db.query(AIWorkoutRecommendation).filter(AIWorkoutRecommendation.user_id == current_user.id)
    if session_id:
        q = q.filter(AIWorkoutRecommendation.session_id == session_id)
    if context_type:
        q = q.filter(AIWorkoutRecommendation.context_type == context_type)
    return q.order_by(AIWorkoutRecommendation.created_at.desc()).limit(10).all()

from backend.models.models import WorkoutPlan, WorkoutEvent, CustomExercise, FavoriteExercise
from backend.schemas.schemas import (
    WorkoutPlanCreate, WorkoutPlanOut, WorkoutEventCreate, WorkoutEventOut,
    CustomExerciseCreate, CustomExerciseOut
)

@router.post("/plans", response_model=WorkoutPlanOut)
def create_plan(
    inp: WorkoutPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = WorkoutPlan(
        user_id=current_user.id,
        name=inp.name,
        goal=inp.goal,
        is_recurring=inp.is_recurring,
        recurrence_rule=inp.recurrence_rule,
        planned_date=inp.planned_date,
        workout_data=inp.workout_data
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.get("/plans", response_model=List[WorkoutPlanOut])
def get_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(WorkoutPlan).filter(WorkoutPlan.user_id == current_user.id).all()

@router.put("/plans/{plan_id}", response_model=WorkoutPlanOut)
def update_plan(
    plan_id: int,
    inp: WorkoutPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from fastapi import HTTPException
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id, WorkoutPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan.name = inp.name
    plan.goal = inp.goal
    plan.is_recurring = inp.is_recurring
    plan.recurrence_rule = inp.recurrence_rule
    plan.planned_date = inp.planned_date
    plan.workout_data = inp.workout_data
    
    db.commit()
    db.refresh(plan)
    return plan

@router.post("/events", response_model=WorkoutEventOut)
def create_event(
    inp: WorkoutEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = WorkoutEvent(
        user_id=current_user.id,
        plan_id=inp.plan_id,
        planned_date=inp.planned_date
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/events", response_model=List[WorkoutEventOut])
def get_events(
    start_date: str,
    end_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(WorkoutEvent).filter(
        WorkoutEvent.user_id == current_user.id,
        WorkoutEvent.planned_date >= start_date,
        WorkoutEvent.planned_date <= end_date
    ).all()

@router.post("/custom-exercises", response_model=CustomExerciseOut)
def create_custom_exercise(
    inp: CustomExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exercise = CustomExercise(
        user_id=current_user.id,
        **inp.model_dump()
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise

@router.get("/custom-exercises", response_model=List[CustomExerciseOut])
def get_custom_exercises(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(CustomExercise).filter(CustomExercise.user_id == current_user.id).all()

from pydantic import BaseModel
class CoachChatRequest(BaseModel):
    message: str

@router.post("/intelligence/agent-chat")
def agent_chat(
    inp: CoachChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_intelligence.ai_coach import process_coach_chat
    return process_coach_chat(db, current_user.id, inp.message)

