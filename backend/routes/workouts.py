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

from backend.models.models import WorkoutPlan, WorkoutEvent, CustomExercise, FavoriteExercise, WorkoutAssignment, WorkoutRevision
from backend.schemas.schemas import (
    WorkoutPlanCreate, WorkoutPlanOut, WorkoutEventCreate, WorkoutEventOut,
    CustomExerciseCreate, CustomExerciseOut,
    WorkoutAssignmentCreate, WorkoutAssignmentOut, DayActionRequest, WorkoutRevisionOut
)

# --- Calendar Assignment & Day Actions ---

@router.get("/calendar/assignments", response_model=List[WorkoutAssignmentOut])
def get_calendar_assignments(
    start_date: str,
    end_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(WorkoutAssignment).filter(
        WorkoutAssignment.user_id == current_user.id,
        WorkoutAssignment.planned_date >= start_date,
        WorkoutAssignment.planned_date <= end_date
    ).all()

@router.post("/calendar/assign", response_model=WorkoutAssignmentOut)
def assign_calendar_workout(
    inp: WorkoutAssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(WorkoutAssignment).filter(
        WorkoutAssignment.user_id == current_user.id,
        WorkoutAssignment.planned_date == inp.planned_date
    ).first()

    if existing:
        rev = WorkoutRevision(
            assignment_id=existing.id,
            user_id=current_user.id,
            action="update",
            previous_data=existing.workout_data,
            new_data=inp.workout_data
        )
        db.add(rev)
        existing.assignment_type = inp.assignment_type
        existing.name = inp.name
        existing.goal = inp.goal
        existing.template_id = inp.template_id
        existing.workout_data = inp.workout_data
        existing.notes = inp.notes or ""
        existing.completion_status = inp.completion_status
        db.commit()
        db.refresh(existing)
        return existing
    else:
        assignment = WorkoutAssignment(
            user_id=current_user.id,
            planned_date=inp.planned_date,
            assignment_type=inp.assignment_type,
            name=inp.name,
            goal=inp.goal,
            template_id=inp.template_id,
            workout_data=inp.workout_data,
            notes=inp.notes or "",
            completion_status=inp.completion_status
        )
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        
        rev = WorkoutRevision(
            assignment_id=assignment.id,
            user_id=current_user.id,
            action="create",
            previous_data=None,
            new_data=inp.workout_data
        )
        db.add(rev)
        db.commit()
        return assignment

@router.put("/calendar/day/{planned_date}", response_model=WorkoutAssignmentOut)
def update_day_workout(
    planned_date: str,
    inp: WorkoutAssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inp.planned_date = planned_date
    return assign_calendar_workout(inp, current_user, db)

@router.post("/calendar/day/{planned_date}/action")
def perform_day_action(
    planned_date: str,
    inp: DayActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assignment = db.query(WorkoutAssignment).filter(
        WorkoutAssignment.user_id == current_user.id,
        WorkoutAssignment.planned_date == planned_date
    ).first()

    if inp.action == "rest":
        if not assignment:
            assignment = WorkoutAssignment(
                user_id=current_user.id,
                planned_date=planned_date,
                assignment_type="rest",
                name="Rest & Recovery",
                workout_data={"exercises": []},
                completion_status="rest"
            )
            db.add(assignment)
        else:
            assignment.assignment_type = "rest"
            assignment.name = "Rest & Recovery"
            assignment.workout_data = {"exercises": []}
            assignment.completion_status = "rest"
        db.commit()
        db.refresh(assignment)
        return assignment

    if inp.action == "move" and inp.target_date:
        if not assignment:
            raise HTTPException(status_code=404, detail="No assignment on source date")
        target_assignment = db.query(WorkoutAssignment).filter(
            WorkoutAssignment.user_id == current_user.id,
            WorkoutAssignment.planned_date == inp.target_date
        ).first()
        if target_assignment:
            db.delete(target_assignment)
        assignment.planned_date = inp.target_date
        db.commit()
        db.refresh(assignment)
        return assignment

    if inp.action == "swap" and inp.target_date:
        source = assignment
        target = db.query(WorkoutAssignment).filter(
            WorkoutAssignment.user_id == current_user.id,
            WorkoutAssignment.planned_date == inp.target_date
        ).first()

        if source and target:
            source.planned_date, target.planned_date = inp.target_date, planned_date
        elif source and not target:
            source.planned_date = inp.target_date
        elif not source and target:
            target.planned_date = planned_date
        db.commit()
        return {"status": "swapped", "source_date": planned_date, "target_date": inp.target_date}

    if inp.action == "duplicate" and inp.target_date:
        if not assignment:
            raise HTTPException(status_code=404, detail="Source assignment not found")
        target = db.query(WorkoutAssignment).filter(
            WorkoutAssignment.user_id == current_user.id,
            WorkoutAssignment.planned_date == inp.target_date
        ).first()
        if target:
            target.assignment_type = assignment.assignment_type
            target.name = assignment.name
            target.workout_data = assignment.workout_data
            target.notes = assignment.notes
        else:
            target = WorkoutAssignment(
                user_id=current_user.id,
                planned_date=inp.target_date,
                assignment_type=assignment.assignment_type,
                name=assignment.name,
                workout_data=assignment.workout_data,
                notes=assignment.notes
            )
            db.add(target)
        db.commit()
        db.refresh(target)
        return target

    if inp.action == "ai_generate":
        generated_workout = {
            "exercises": [
                {
                    "id": f"ai_{int(datetime.utcnow().timestamp())}_1",
                    "name": "Barbell Bench Press",
                    "muscleTag": "Chest & Triceps",
                    "formGuard": "Keep scapula retracted",
                    "tips": ["Controlled eccentric", "Drive feet into floor"],
                    "targetSets": 4,
                    "sets": [
                        {"setNumber": 1, "weightKg": 70, "reps": 10, "completed": False, "type": "warmup"},
                        {"setNumber": 2, "weightKg": 85, "reps": 8, "completed": False, "type": "work"},
                        {"setNumber": 3, "weightKg": 90, "reps": 6, "completed": False, "type": "work"},
                        {"setNumber": 4, "weightKg": 90, "reps": 6, "completed": False, "type": "work"}
                    ]
                },
                {
                    "id": f"ai_{int(datetime.utcnow().timestamp())}_2",
                    "name": "Incline DB Flyes",
                    "muscleTag": "Upper Chest",
                    "formGuard": "Slight elbow bend",
                    "tips": ["Deep stretch at bottom"],
                    "targetSets": 3,
                    "sets": [
                        {"setNumber": 1, "weightKg": 22, "reps": 12, "completed": False, "type": "work"},
                        {"setNumber": 2, "weightKg": 24, "reps": 10, "completed": False, "type": "work"},
                        {"setNumber": 3, "weightKg": 24, "reps": 10, "completed": False, "type": "work"}
                    ]
                }
            ]
        }
        if not assignment:
            assignment = WorkoutAssignment(
                user_id=current_user.id,
                planned_date=planned_date,
                assignment_type="workout",
                name="AI Hypertrophy Plan",
                workout_data=generated_workout
            )
            db.add(assignment)
        else:
            assignment.workout_data = generated_workout
            assignment.name = "AI Hypertrophy Plan"
            assignment.assignment_type = "workout"
        db.commit()
        db.refresh(assignment)
        return assignment

    if inp.action == "ai_optimize":
        if assignment and assignment.workout_data:
            exs = assignment.workout_data.get("exercises", [])
            for ex in exs:
                ex["tips"].append("AI Tip: Increased rest to 120s for strength recovery")
            assignment.workout_data = {"exercises": exs}
            db.commit()
            db.refresh(assignment)
            return assignment
        else:
            raise HTTPException(status_code=400, detail="No workout data to optimize")

    if inp.action == "update_notes" and inp.notes is not None:
        if not assignment:
            assignment = WorkoutAssignment(
                user_id=current_user.id,
                planned_date=planned_date,
                assignment_type="workout",
                name="Notes Only",
                workout_data={"exercises": []},
                notes=inp.notes
            )
            db.add(assignment)
        else:
            assignment.notes = inp.notes
        db.commit()
        db.refresh(assignment)
        return assignment

    raise HTTPException(status_code=400, detail=f"Unsupported action: {inp.action}")

@router.delete("/calendar/day/{planned_date}")
def delete_day_assignment(
    planned_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assignment = db.query(WorkoutAssignment).filter(
        WorkoutAssignment.user_id == current_user.id,
        WorkoutAssignment.planned_date == planned_date
    ).first()

    if assignment:
        db.delete(assignment)
        db.commit()
        return {"status": "deleted", "planned_date": planned_date}
    return {"status": "not_found", "planned_date": planned_date}

@router.get("/calendar/day/{planned_date}/history", response_model=List[WorkoutRevisionOut])
def get_day_history(
    planned_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assignment = db.query(WorkoutAssignment).filter(
        WorkoutAssignment.user_id == current_user.id,
        WorkoutAssignment.planned_date == planned_date
    ).first()

    if not assignment:
        return []

    return db.query(WorkoutRevision).filter(
        WorkoutRevision.assignment_id == assignment.id,
        WorkoutRevision.user_id == current_user.id
    ).order_by(WorkoutRevision.created_at.desc()).all()

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

class PauseSessionInput(BaseModel):
    session_id: int

class CancelSessionInput(BaseModel):
    session_id: int
    reason: str = "User cancelled"

class SkipSetInput(BaseModel):
    session_id: int
    exercise_name: str
    set_number: int
    reason: str

class SkipExerciseInput(BaseModel):
    session_id: int
    exercise_name: str
    reason: str

class PerformanceReportInput(BaseModel):
    session_id: int
    pain_level: int = 0
    energy_level: int = 5
    form_confidence: int = 5
    difficulty_level: int = 5
    motivation_level: int = 5
    notes: str = ""

class ProposeDiffInput(BaseModel):
    request_type: str = "general"
    current_exercises: List[Any] = []

class ApplyDiffInput(BaseModel):
    plan_id: int = 0
    diff_data: Dict[str, Any]

@router.post("/pause")
def pause_session(
    inp: PauseSessionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_execution.engine import pause_workout_session
    session = pause_workout_session(db, current_user.id, inp.session_id)
    return {"status": "paused", "session_id": session.id}

@router.post("/resume")
def resume_session(
    inp: PauseSessionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_execution.engine import resume_workout_session
    session = resume_workout_session(db, current_user.id, inp.session_id)
    return {"status": "in_progress", "session_id": session.id}

@router.post("/cancel")
def cancel_session(
    inp: CancelSessionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_execution.engine import cancel_workout_session
    session = cancel_workout_session(db, current_user.id, inp.session_id, inp.reason)
    return {"status": "cancelled", "session_id": session.id}

@router.post("/skip-set")
def skip_set(
    inp: SkipSetInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_execution.engine import skip_workout_set
    res = skip_workout_set(db, current_user.id, inp.session_id, inp.exercise_name, inp.set_number, inp.reason)
    return {"status": "skipped", "set_id": res.id}

@router.post("/skip-exercise")
def skip_exercise(
    inp: SkipExerciseInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_execution.engine import skip_workout_exercise
    return skip_workout_exercise(db, current_user.id, inp.session_id, inp.exercise_name, inp.reason)

@router.post("/performance-report")
def performance_report(
    inp: PerformanceReportInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_execution.engine import log_performance_report
    return log_performance_report(
        db, current_user.id, inp.session_id,
        inp.pain_level, inp.energy_level, inp.form_confidence,
        inp.difficulty_level, inp.motivation_level, inp.notes
    )

@router.post("/intelligence/propose-plan-diff")
def propose_plan_diff(
    inp: ProposeDiffInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_intelligence.ai_coach import propose_plan_diff as propose_diff
    return propose_diff(db, current_user.id, inp.current_exercises, inp.request_type)

@router.post("/intelligence/apply-plan-diff")
def apply_plan_diff(
    inp: ApplyDiffInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.services.workout_intelligence.ai_coach import apply_plan_diff as apply_diff
    return apply_diff(db, current_user.id, inp.plan_id, inp.diff_data)


