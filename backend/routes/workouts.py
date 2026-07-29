from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.models import User, WorkoutSession, PersonalRecord
from backend.schemas.schemas import (
    WorkoutSessionStartInput, WorkoutSessionOut, LogSetInput,
    PlateCalculatorOut, WarmupProtocolOut, WarmupSetItem
)
from backend.services.workout_execution.engine import (
    start_new_workout_session, log_workout_set, complete_workout_session
)

router = APIRouter(prefix="/workout", tags=["Intelligent Workout Engine"])

@router.post("/start", response_model=WorkoutSessionOut)
def start_session(
    inp: WorkoutSessionStartInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = start_new_workout_session(db, current_user.id, inp.name)
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
        weight_kg=inp.weight_kg,
        reps=inp.reps,
        rpe=inp.rpe,
        rir=inp.rir,
        tempo=inp.tempo,
        rest_seconds=inp.rest_seconds,
        pain_level=inp.pain_level,
        form_rating=inp.form_rating,
        notes=inp.notes
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
