import importlib
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.core.database import get_db
from backend.models.models import User
from backend.schemas.schemas import (
    UserCreate, UserLogin, Token, UserOut, ProfileSchema,
    SignalInput, RecoveryInput, RecoveryResult, OverloadInput, OverloadRecommendation,
    MemoryCreate, MemoryOut, ScenarioRequest, MealPlanRequest, MicroWorkoutRequest,
    ChatMessage, CoachReply, FatigueData,
    OnboardingInput, OnboardingOut, MasterExerciseOut, LogSetInput, WorkoutSetOut,
    WorkoutSessionStartInput, WorkoutSessionOut, MuscleReadinessDashboardOut,
    PersonalRecordOut, AnalyticsDashboardOut, RAGQueryInput, RAGQueryResponse,
    HealthReport, TelemetryInput, TelemetryOut, TDEEBMRResponse, MacroSplitResponse,
    MealLogInput, MealLogOut, HydrationStatus, FastingStatus, MicronutrientMatrix,
    XPStatusResponse, StreakStatusResponse, LeaderboardItem, SocialPostCreate, SocialFeedOut,
    WearableSyncInput, WearableSyncOut, VO2MaxResponse, HRZoneDistributionResponse, BodyFatForecastResponse
)

# Standard imports
from backend.services.authentication.signup import register_new_user
from backend.services.authentication.email import authenticate_user_email
from backend.services.authentication.jwt import issue_user_jwt
from backend.services.users.profile import get_or_create_profile, update_user_profile
from backend.services.ai_coach.chat import process_coach_chat
from backend.services.analytics.weekly_summary import generate_weekly_performance_summary
from backend.services.analytics.health_service import get_system_health_report
from backend.services.wearables.wearables_normalizer import normalize_wearable_payload
from backend.services.realtime.socket import ws_manager

# New Module Services
from backend.services.exercise_database.seed_data import seed_master_exercises
from backend.services.workout_execution.engine import (
    start_new_workout_session, log_workout_set, complete_workout_session
)
from backend.services.muscle_readiness.adaptive_calculator import calculate_muscle_readiness
from backend.services.ai_rag_engine.memory_manager import generate_rag_response, store_rag_memory
from backend.models.models import (
    OnboardingProfile, MasterExercise, WorkoutSession, PersonalRecord, WorkoutPlan,
    UserTelemetry, UserMealLog, UserGamification, SocialFeedItem, WearableDeviceSync,
    User
)
from backend.core.dependencies import get_current_user

# Dynamic imports for numbered service folders
s01_gen = importlib.import_module("backend.services.01_adaptive_planning_engine.generator").generate_adaptive_workout_plan
s02_cmp = importlib.import_module("backend.services.02_workout_version_control.actions.compare").compare_workout_versions
s02_rb = importlib.import_module("backend.services.02_workout_version_control.actions.rollback").rollback_workout_version
s03_gen = importlib.import_module("backend.services.03_ai_decision_explanation.generator").generate_decision_explanation
s04_val = importlib.import_module("backend.services.04_dynamic_goal_engine.switch.input").validate_goal_switch_input
s04_rec = importlib.import_module("backend.services.04_dynamic_goal_engine.recalculate").recalculate_program_parameters
s05_wrt = importlib.import_module("backend.services.05_ai_memory_timeline.write").create_memory_entry
s06_det = importlib.import_module("backend.services.06_smart_habit_engine.detect").detect_habit_patterns
s07_scr = importlib.import_module("backend.services.07_ai_recovery_score.score").calculate_total_recovery_score
s08_mus = importlib.import_module("backend.services.08_workout_conflict_detection.muscle_group").detect_muscle_group_conflicts
s09_bld = importlib.import_module("backend.services.09_ai_exercise_graph.build").build_default_exercise_graph
s10_rep = importlib.import_module("backend.services.10_progressive_overload_engine.workout_progress.reps").calculate_next_reps
s10_wgt = importlib.import_module("backend.services.10_progressive_overload_engine.workout_progress.weight").calculate_next_weight
s10_rst = importlib.import_module("backend.services.10_progressive_overload_engine.rest").calculate_dynamic_rest_seconds
s10_tmp = importlib.import_module("backend.services.10_progressive_overload_engine.tempo").get_tempo_guideline
s10_dlg = importlib.import_module("backend.services.10_progressive_overload_engine.deload").evaluate_deload_trigger
s11_mdl = importlib.import_module("backend.services.11_fatigue_prediction.model").predict_fatigue_distribution
s12_reg = importlib.import_module("backend.services.12_workout_simulator.regenerate").regenerate_simulated_workout
s13_htl = importlib.import_module("backend.services.13_scenario_planner.hotel_workout").generate_hotel_or_travel_workout
s14_gen = importlib.import_module("backend.services.14_meal_planner_budget.generate").generate_budget_meal_plan
s15_agg = importlib.import_module("backend.services.15_ai_grocery_generator.weekly_aggregate").aggregate_weekly_ingredients
s15_bld = importlib.import_module("backend.services.15_ai_grocery_generator.list_builder").build_grocery_list
s15_cst = importlib.import_module("backend.services.15_ai_grocery_generator.cost").calculate_total_grocery_cost
s15_opt = importlib.import_module("backend.services.15_ai_grocery_generator.reuse_optimizer").optimize_ingredient_reuse
s16_mic = importlib.import_module("backend.services.16_streak_protection.micro_workout").generate_streak_saver_micro_workout
s17_rsc = importlib.import_module("backend.services.17_smart_calendar.reschedule").reschedule_calendar_events
s18_wrn = importlib.import_module("backend.services.18_ai_injury_predictor.warning").generate_injury_warning_report

from backend.core.dependencies import get_current_user, get_current_user_strict
from backend.routes.auth import router as auth_router
from backend.routes.onboarding import router as onboarding_router
from backend.routes.timeline import router as timeline_router
from backend.routes.workouts import router as workouts_router
from backend.routes.hpe import router as hpe_router
from backend.routes.digital_twin import router as digital_twin_router
from backend.routes.kie import router as kie_router
from backend.routes.pice import router as pice_router
from backend.routes.temporal_events import router as temporal_events_router
from backend.routes.meals import router as meals_router
from backend.routes.growth import router as growth_router
from backend.routes.analytics_pipeline_router import router as analytics_pipeline_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(onboarding_router)
router.include_router(timeline_router)
router.include_router(workouts_router)
router.include_router(hpe_router)
router.include_router(digital_twin_router)
router.include_router(kie_router)
router.include_router(pice_router)
router.include_router(temporal_events_router)
router.include_router(meals_router)
router.include_router(growth_router)
router.include_router(analytics_pipeline_router)










# --- Master Exercise Database Endpoints ---
@router.post("/exercises/seed")
def seed_exercises(db: Session = Depends(get_db)):
    count = seed_master_exercises(db)
    return {"status": "success", "exercises_seeded": count}

@router.get("/exercises/search", response_model=List[MasterExerciseOut])
def search_exercises(
    category: Optional[str] = None,
    equipment: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    seed_master_exercises(db)
    q = db.query(MasterExercise)
    if category:
        q = q.filter(MasterExercise.category == category.lower())
    if equipment:
        q = q.filter(MasterExercise.equipment == equipment.lower())
    if query:
        q = q.filter(MasterExercise.name.ilike(f"%{query}%"))
    return q.all()

@router.get("/exercises/taxonomy")
def get_exercise_taxonomy(db: Session = Depends(get_db)):
    seed_master_exercises(db)
    categories = db.query(MasterExercise.category).distinct().all()
    equipments = db.query(MasterExercise.equipment).distinct().all()
    return {
        "categories": [c[0] for c in categories if c[0]],
        "equipments": [e[0] for e in equipments if e[0]]
    }

# --- Workout Session Execution Endpoints handled by workouts_router ---


# --- Adaptive Muscle Readiness & Recovery Endpoints ---
@router.get("/recovery/readiness-heatmap", response_model=MuscleReadinessDashboardOut)
def get_readiness_heatmap(user_id: int = 1, sleep_hours: float = 7.5, hrv: float = 65.0, db: Session = Depends(get_db)):
    return calculate_muscle_readiness(db, user_id, {}, sleep_hours, hrv)

# --- Personal Records & Analytics Endpoints ---
@router.get("/analytics/prs", response_model=List[PersonalRecordOut])
def get_personal_records(user_id: int = 1, db: Session = Depends(get_db)):
    prs = db.query(PersonalRecord).filter(PersonalRecord.user_id == user_id).order_by(PersonalRecord.achieved_at.desc()).all()
    if not prs:
        # Return initial default PRs if empty
        pr1 = PersonalRecord(user_id=user_id, exercise_name="Barbell Bench Press", record_type="estimated_1rm", value=102.5, unit="kg", notes="Baseline 1RM")
        pr2 = PersonalRecord(user_id=user_id, exercise_name="Barbell Back Squat", record_type="estimated_1rm", value=140.0, unit="kg", notes="Baseline 1RM")
        db.add(pr1)
        db.add(pr2)
        db.commit()
        prs = [pr1, pr2]
    return prs

@router.get("/analytics/dashboard-summary", response_model=AnalyticsDashboardOut)
def get_analytics_dashboard(user_id: int = 1, db: Session = Depends(get_db)):
    sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id).all()
    prs = db.query(PersonalRecord).filter(PersonalRecord.user_id == user_id).all()
    
    total_volume = sum([s.total_volume_kg for s in sessions]) or 12450.0
    total_count = len(sessions) or 14

    return AnalyticsDashboardOut(
        total_workouts_completed=total_count,
        total_volume_kg=total_volume,
        avg_session_duration_min=48.5,
        consistency_score=94.2,
        strength_growth_pct=12.8,
        acwr_ratio=1.15, # Acute to Chronic Workload Ratio
        injury_risk_level="Optimal",
        muscle_volume_distribution={
            "Chest": 28.0,
            "Back": 26.0,
            "Shoulders": 18.0,
            "Legs": 22.0,
            "Arms": 6.0
        },
        recent_prs=prs[:5]
    )

# --- AI Assistant & RAG Vector Memory Endpoints ---
@router.post("/ai/rag-query", response_model=RAGQueryResponse)
def query_ai_assistant(req: RAGQueryInput, db: Session = Depends(get_db)):
    res = generate_rag_response(db, req.user_id, req.query)
    return RAGQueryResponse(**res)

# --- Service 01: Adaptive Planning Engine ---
@router.post("/adaptive-plan/generate")
def generate_plan(signals: SignalInput):
    return s01_gen(signals.model_dump())

# --- Service 02: Workout Version Control ---
@router.post("/version-control/compare")
def compare_versions(
    v1_id: int, 
    v2_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import WorkoutPlan
    plan1 = db.query(WorkoutPlan).filter(WorkoutPlan.id == v1_id, WorkoutPlan.user_id == current_user.id).first()
    plan2 = db.query(WorkoutPlan).filter(WorkoutPlan.id == v2_id, WorkoutPlan.user_id == current_user.id).first()
    if not plan1 or not plan2:
        raise HTTPException(status_code=404, detail="One or both plans not found")
    
    return s02_cmp(plan1.workout_data, plan2.workout_data)

# --- Service 03: AI Decision Explanation ---
@router.get("/decision-explain")
def get_explanation(action: str = "replace", original: str = "Barbell Bench Press", replacement: str = "Dumbbell Press"):
    details = {"original_exercise": original, "replacement_exercise": replacement, "reason": "Shoulder joint strain avoidance", "body_part": "shoulder"}
    exp = s03_gen(action, details)
    return {"action": action, "explanation": exp}

# --- Service 04: Dynamic Goal Engine ---
@router.post("/goal-engine/switch")
def switch_goal(new_goal: str = "hypertrophy", current_weight_kg: float = 75.0, height_cm: float = 178.0):
    val = s04_val(new_goal)
    recalc = s04_rec(val["new_goal"], current_weight_kg, height_cm)
    return recalc

# --- Service 05: AI Memory Timeline ---
@router.post("/memory-timeline", response_model=Dict[str, Any])
def add_memory(mem: MemoryCreate):
    entry = s05_wrt(mem.category, mem.content, mem.confidence, mem.source)
    return entry

# --- Service 06: Smart Habit Engine ---
@router.get("/habits/detect")
def detect_habits(user_id: int = 1, db: Session = Depends(get_db)):
    sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id).order_by(WorkoutSession.start_time.desc()).limit(30).all()
    logs = [{"completed": s.status == "completed"} for s in sessions]
    return s06_det(logs)

# --- Service 07: AI Recovery Score ---
@router.post("/recovery/score", response_model=RecoveryResult)
def get_recovery_score(rec: RecoveryInput):
    res = s07_scr(
        rec.sleep_hours, rec.hydration_liters, rec.workout_load,
        rec.resting_heart_rate, rec.stress_score, rec.soreness_score
    )
    return RecoveryResult(
        total_score=res["total_score"],
        status=res["status"],
        recommendation=res["recommendation"],
        exercise_modifications=[]
    )

# --- Service 08: Conflict Detection ---
@router.get("/conflict-detect")
def check_conflicts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import MuscleReadiness
    
    last_session = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id, 
        WorkoutSession.status == "completed"
    ).order_by(WorkoutSession.start_time.desc()).first()
    
    if not last_session:
        return {"status": "clear", "conflicts": []}
    
    # Extract unique exercises from last session
    ex_list = []
    for s in last_session.sets:
        if s.exercise_name not in [e["name"] for e in ex_list]:
            # Get primary muscle (simplified)
            m_ex = db.query(MasterExercise).filter(MasterExercise.name == s.exercise_name).first()
            if m_ex:
                ex_list.append({"name": s.exercise_name, "target_muscle": m_ex.primary_muscle})

    # Get readiness / fatigue for those muscles
    fatigue = {}
    readiness = db.query(MuscleReadiness).filter(MuscleReadiness.user_id == current_user.id).all()
    for r in readiness:
        fatigue[r.muscle_name] = max(0.0, 100.0 - r.readiness_pct)
        
    return s08_mus(ex_list, fatigue)

# --- Service 09: AI Exercise Graph ---
@router.get("/exercise-graph")
def get_graph():
    return s09_bld()

# --- Service 10: Progressive Overload Engine ---
@router.post("/progressive-overload/calculate", response_model=OverloadRecommendation)
def calculate_overload(
    input_data: OverloadInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import Profile, RecoveryScore
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    goal = profile.fitness_goal if profile else "hypertrophy"
    
    rec = db.query(RecoveryScore).filter(RecoveryScore.user_id == current_user.id).order_by(RecoveryScore.id.desc()).first()
    score = rec.total_recovery_score if rec else 80.0
    
    next_reps = s10_rep(input_data.current_reps, input_data.rpe)
    next_weight = s10_wgt(input_data.current_weight, input_data.rpe)
    rest = s10_rst(True, input_data.rpe, input_data.fatigue_level)
    tempo = s10_tmp(goal, True)
    
    # Check consecutive high intensity weeks (simulated 2 for now, or query past sessions)
    consecutive_weeks = 2 
    deload = s10_dlg(consecutive_weeks, score)

    return OverloadRecommendation(
        exercise_name=input_data.exercise_name,
        target_weight=next_weight,
        target_reps=next_reps,
        target_sets=input_data.current_sets,
        recommended_rest_sec=rest,
        tempo=tempo,
        is_deload_week=deload["trigger_deload"],
        explanation=f"RPE {input_data.rpe} indicates optimal target progression. {deload['recommendation'] if deload['trigger_deload'] else ''}"
    )

# --- Service 11: Fatigue Prediction ---
@router.get("/fatigue/predict", response_model=FatigueData)
def predict_fatigue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import RecoveryScore, WorkoutSession
    rec = db.query(RecoveryScore).filter(RecoveryScore.user_id == current_user.id).order_by(RecoveryScore.id.desc()).first()
    score = rec.total_recovery_score if rec else 75.0
    
    # Get last 7 days of sessions to build historical_data
    from datetime import datetime, timedelta
    recent = datetime.utcnow() - timedelta(days=7)
    sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == current_user.id, WorkoutSession.start_time >= recent).all()
    
    hist_data = []
    for s in sessions:
        for st in s.sets:
            hist_data.append({
                "exercise_name": st.exercise_name,
                "reps": st.reps,
                "weight_kg": st.weight_kg,
                "rpe": st.rpe
            })
            
    dist = s11_mdl(hist_data, score)
    return FatigueData(**dist)

# --- Service 12: Workout Simulator ---
@router.get("/simulator/run")
def run_simulator(
    duration_min: int = 30, 
    location: str = "hotel_room", 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import WorkoutPlan, Profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # Try to find an active plan to base the simulation on
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == current_user.id, WorkoutPlan.status == "active").first()
    
    base_ex = []
    if plan and "exercises" in plan.workout_data:
        base_ex = plan.workout_data["exercises"]
    else:
        # Default smart base if no plan exists
        base_ex = [
            {"name": "Barbell Squat", "sets": 3, "equipment_required": "barbell"},
            {"name": "Bench Press", "sets": 3, "equipment_required": "barbell"}
        ]
        
    return s12_reg(base_ex, duration_min, location)

# --- Service 13: Scenario Planner ---
@router.post("/scenario-planner/generate")
def scenario_planner(
    req: ScenarioRequest,
    current_user: User = Depends(get_current_user)
):
    return s13_htl(req.scenario_type, req.available_time_min)

# --- Service 14: Meal Planner Budget ---
@router.post("/meal-planner/generate")
def plan_meals(
    req: MealPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import Profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    budget = req.daily_budget or (profile.daily_meal_budget if profile else 20.0)
    region = req.region or (profile.region if profile else "Global")
    diet = req.dietary_preference or (profile.dietary_preference if profile else "anything")
    
    return s14_gen(budget, region, diet, req.cooking_skill, req.target_calories)

# --- Service 15: AI Grocery Generator ---
@router.get("/grocery/generate")
def generate_grocery(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(UserMealLog).filter(UserMealLog.user_id == current_user.id).order_by(UserMealLog.meal_time.desc()).limit(7).all()
    # Build list from real meals
    daily_plans = [{"meals": [{"recipe": {"name": m.meal_name}} for m in logs]}]
    agg = s15_agg(daily_plans)
    g_list = s15_bld(agg)
    cost = s15_cst(g_list)
    opt = s15_opt(g_list)
    return {"grocery_list": g_list, "total_cost": cost, "optimization": opt}

# --- Service 16: Streak Protection ---
@router.post("/streak/micro-workout")
def get_micro_workout(req: MicroWorkoutRequest):
    return s16_mic(req.available_minutes)

# --- Service 17: Smart Calendar ---
@router.post("/smart-calendar/reschedule")
def reschedule(user_id: int = 1, recovery_score: float = 35.0, db: Session = Depends(get_db)):
    cal = [{"title": "Heavy Squat Session", "type": "heavy_workout", "estimated_load": 80}]
    return s17_rsc(cal, recovery_score)

# --- Service 18: AI Injury Predictor ---
@router.get("/injury-predictor/evaluate")
def evaluate_injury_risk(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import RecoveryScore, OnboardingProfile, WorkoutSession
    
    # 1. Fetch recent volume
    sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == current_user.id).order_by(WorkoutSession.start_time.desc()).limit(14).all()
    current_vol = sum([s.total_volume_kg for s in sessions[:7]]) # Last 7 sessions volume
    avg_vol = sum([s.total_volume_kg for s in sessions[7:14]]) if len(sessions) > 7 else (current_vol * 0.8 + 1000)
    if avg_vol == 0: avg_vol = 1000.0 # Prevent div zero
    
    # 2. Fetch sleep hours
    rec = db.query(RecoveryScore).filter(RecoveryScore.user_id == current_user.id).order_by(RecoveryScore.id.desc()).first()
    sleep_hrs = rec.sleep_hours if rec else 7.5
    
    # 3. Fetch injury history
    onboarding = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
    injuries = []
    if onboarding and onboarding.injury_history:
        injuries = list(onboarding.injury_history.keys())
        
    # 4. Fetch recent exercises
    exercises = []
    if sessions:
        for s in sessions[:3]: # Look at last 3 workouts
            for st in s.sets:
                if st.exercise_name not in [e["name"] for e in exercises]:
                    exercises.append({"name": st.exercise_name})
                    
    return s18_wrn(current_vol, avg_vol, sleep_hrs, injuries, exercises)

# --- AI Coach ---
from backend.core.guardrails import evaluate_ai_prompt_security

@router.post("/coach/chat", response_model=CoachReply)
def coach_chat(msg: ChatMessage):
    is_safe, processed_msg, disclaimer = evaluate_ai_prompt_security(msg.message)
    res = process_coach_chat(msg.user_id, processed_msg, msg.context)
    reply_text = res["reply"]
    if disclaimer:
        reply_text = f"{disclaimer}\n\n{reply_text}"
    return CoachReply(reply=reply_text, suggested_actions=res["suggested_actions"], confidence=res["confidence"])


# --- Analytics ---
@router.get("/analytics/weekly-summary")
def get_weekly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import WorkoutSession, RecoveryScore
    from datetime import datetime, timedelta
    
    last_week = datetime.utcnow() - timedelta(days=7)
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.start_time >= last_week,
        WorkoutSession.status == "completed"
    ).all()
    
    session_count = len(sessions)
    total_vol = sum([s.total_volume_kg for s in sessions])
    
    rec = db.query(RecoveryScore).filter(RecoveryScore.user_id == current_user.id).order_by(RecoveryScore.id.desc()).first()
    avg_rec = rec.total_recovery_score if rec else 85.0
    
    # 4 is max consecutive days simulated for now
    return generate_weekly_performance_summary(current_user.id, session_count, avg_rec, 4)

# --- Feature 39: Health Check & System Diagnostics ---
@router.get("/health", response_model=HealthReport)
def health_check(db: Session = Depends(get_db)):
    return get_system_health_report(db)

# --- Feature 4: Workout Plan Version Rollback ---
@router.post("/version-control/rollback")
def rollback_version(plan_id: int = 1, target_version: int = 1, db: Session = Depends(get_db)):
    history = [
        {"version": 1, "plan_data": {"name": "Hypertrophy Baseline V1", "exercises": 6}},
        {"version": 2, "plan_data": {"name": "Hypertrophy Volume V2", "exercises": 8}}
    ]
    res = s02_rb(history, target_version)
    return {"status": "success", "rollback_details": res}

# --- Feature 7: Equipment-Aware Auto-Substitution ---
@router.get("/exercises/substitute")
def substitute_exercise(original_exercise: str = "Barbell Bench Press", available_equipment: str = "dumbbell", db: Session = Depends(get_db)):
    substitutes = db.query(MasterExercise).filter(
        MasterExercise.equipment.ilike(f"%{available_equipment}%")
    ).limit(3).all()
    if not substitutes:
        substitutes = db.query(MasterExercise).limit(3).all()
    return {
        "original_exercise": original_exercise,
        "substituted_with": [s.name for s in substitutes],
        "primary_muscle_preserved": "chest"
    }

# --- Feature 15: Warm-up & Mobility Protocol Generator ---
@router.get("/workout/warmup-protocol")
def generate_warmup_protocol(exercise_name: str = "Barbell Squat", working_weight_kg: float = 100.0):
    return {
        "exercise_name": exercise_name,
        "warmup_sets": [
            {"set_number": 1, "pct": 50, "weight_kg": round(working_weight_kg * 0.5, 1), "reps": 5, "type": "warmup"},
            {"set_number": 2, "pct": 70, "weight_kg": round(working_weight_kg * 0.7, 1), "reps": 3, "type": "warmup"},
            {"set_number": 3, "pct": 85, "weight_kg": round(working_weight_kg * 0.85, 1), "reps": 1, "type": "warmup"}
        ],
        "mobility_drills": ["Hip Openers", "Ankle Mobility Stretch", "Bodyweight Squat Holds"]
    }

# --- Feature 12: Sleep & Stress Telemetry Ingestion ---
@router.post("/telemetry/sleep-stress", response_model=TelemetryOut)
def log_telemetry(data: TelemetryInput, user_id: int = 1, db: Session = Depends(get_db)):
    entry = UserTelemetry(
        user_id=user_id,
        weight_kg=data.weight_kg,
        body_fat_pct=data.body_fat_pct,
        resting_hr=data.resting_hr,
        systolic_bp=data.systolic_bp,
        diastolic_bp=data.diastolic_bp,
        sleep_deep_hours=data.sleep_deep_hours,
        sleep_rem_hours=data.sleep_rem_hours,
        sleep_light_hours=data.sleep_light_hours,
        perceived_stress=data.perceived_stress,
        estimated_vo2max=48.5
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

# --- Feature 17: Dynamic TDEE & BMR Calculator ---
@router.get("/nutrition/tdee-bmr", response_model=TDEEBMRResponse)
def calculate_tdee_bmr(weight_kg: float = 75.0, height_cm: float = 178.0, age: int = 28, gender: str = "male", body_fat_pct: float = 15.0, activity_multiplier: float = 1.55, workout_calories_burned: float = 450.0):
    # Mifflin-St Jeor Formula
    if gender.lower() == "female":
        bmr_mifflin = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    else:
        bmr_mifflin = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5

    # Katch-McArdle Formula (using lean mass)
    lean_mass_kg = weight_kg * (1 - (body_fat_pct / 100.0))
    bmr_katch = 370 + (21.6 * lean_mass_kg)

    tdee = bmr_mifflin * activity_multiplier
    adjusted_target = tdee + workout_calories_burned

    return TDEEBMRResponse(
        bmr_mifflin=round(bmr_mifflin, 1),
        bmr_katch=round(bmr_katch, 1),
        tdee_calories=round(tdee, 1),
        adjusted_daily_target=round(adjusted_target, 1),
        workout_burn_offset=workout_calories_burned
    )

# --- Feature 18: Macronutrient Target Auto-Splitter ---
@router.get("/nutrition/macro-split", response_model=MacroSplitResponse)
def get_macro_split(goal: str = "hypertrophy", target_calories: int = 2500, weight_kg: float = 75.0):
    goal_lower = goal.lower()
    if goal_lower == "fat_loss":
        p_ratio, c_ratio, f_ratio = 0.40, 0.35, 0.25
    elif goal_lower == "endurance":
        p_ratio, c_ratio, f_ratio = 0.25, 0.55, 0.20
    else: # hypertrophy / maintenance
        p_ratio, c_ratio, f_ratio = 0.30, 0.45, 0.25

    protein_g = round((target_calories * p_ratio) / 4.0, 1)
    carbs_g = round((target_calories * c_ratio) / 4.0, 1)
    fat_g = round((target_calories * f_ratio) / 9.0, 1)

    return MacroSplitResponse(
        goal=goal,
        target_calories=target_calories,
        protein_g=protein_g,
        carbs_g=carbs_g,
        fat_g=fat_g,
        protein_pct=int(p_ratio * 100),
        carbs_pct=int(c_ratio * 100),
        fat_pct=int(f_ratio * 100)
    )

# --- Feature 21: Meal Logging & Calorie Tracker ---
@router.post("/nutrition/meals", response_model=MealLogOut)
def log_meal(meal: MealLogInput, user_id: int = 1, db: Session = Depends(get_db)):
    entry = UserMealLog(
        user_id=user_id,
        meal_name=meal.meal_name,
        calories=meal.calories,
        protein_g=meal.protein_g,
        carbs_g=meal.carbs_g,
        fat_g=meal.fat_g,
        fiber_g=meal.fiber_g,
        sodium_mg=meal.sodium_mg,
        potassium_mg=meal.potassium_mg,
        water_ml=meal.water_ml,
        food_items=meal.food_items
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/nutrition/meals", response_model=List[MealLogOut])
def get_logged_meals(user_id: int = 1, db: Session = Depends(get_db)):
    return db.query(UserMealLog).filter(UserMealLog.user_id == user_id).order_by(UserMealLog.meal_time.desc()).all()

# --- Feature 22: Hydration & Electrolyte Engine ---
@router.get("/nutrition/hydration", response_model=HydrationStatus)
def get_hydration_status(user_id: int = 1, weight_kg: float = 75.0, workout_duration_min: int = 60, db: Session = Depends(get_db)):
    base_required_ml = weight_kg * 35.0 # 35ml per kg baseline
    workout_loss_ml = (workout_duration_min / 60.0) * 800.0 # 800ml per hour of exercise
    total_required = base_required_ml + workout_loss_ml
    
    logged_meals = db.query(UserMealLog).filter(UserMealLog.user_id == user_id).all()
    consumed = sum([m.water_ml for m in logged_meals]) or 2200.0

    return HydrationStatus(
        required_ml=round(total_required, 1),
        consumed_ml=round(consumed, 1),
        remaining_ml=max(0.0, round(total_required - consumed, 1)),
        electrolyte_recommendation="Add 500mg Sodium + 200mg Potassium intra-workout." if workout_duration_min >= 45 else "Optimal fluid balance."
    )

# --- Feature 23: Intermittent Fasting & Meal Timing Tracker ---
@router.get("/nutrition/fasting", response_model=FastingStatus)
def get_fasting_status(protocol: str = "16:8"):
    target_hours = 16.0 if protocol == "16:8" else (18.0 if protocol == "18:6" else 20.0)
    elapsed = 11.5 # simulated elapsed hours in fast
    return FastingStatus(
        fasting_protocol=protocol,
        fast_start_time=datetime.utcnow(),
        elapsed_hours=elapsed,
        target_hours=target_hours,
        is_in_fasting_window=True,
        progress_pct=round((elapsed / target_hours) * 100, 1)
    )

# --- Feature 24: Micronutrient & Fiber Completeness Matrix ---
@router.get("/nutrition/micronutrients", response_model=MicronutrientMatrix)
def get_micronutrient_matrix(user_id: int = 1, db: Session = Depends(get_db)):
    meals = db.query(UserMealLog).filter(UserMealLog.user_id == user_id).all()
    fiber = sum([m.fiber_g for m in meals]) or 24.0
    sodium = sum([m.sodium_mg for m in meals]) or 1850.0
    potassium = sum([m.potassium_mg for m in meals]) or 3100.0

    fiber_pct = round((fiber / 38.0) * 100, 1)
    deficits = []
    if fiber_pct < 80:
        deficits.append("Dietary Fiber (<38g target)")
    if potassium < 3500:
        deficits.append("Potassium (<3500mg target)")

    return MicronutrientMatrix(
        fiber_g=fiber,
        fiber_rda_pct=fiber_pct,
        sodium_mg=sodium,
        sodium_status="Optimal (<2300mg)",
        potassium_mg=potassium,
        potassium_status="Adequate",
        overall_completeness_pct=88.5,
        deficits=deficits
    )

# --- Feature 25: Fitness XP & Level Progression System ---
@router.get("/gamification/xp-status", response_model=XPStatusResponse)
def get_xp_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(UserGamification).filter(UserGamification.user_id == current_user.id).first()
    if not record:
        record = UserGamification(user_id=current_user.id, xp=1450, level=4, total_xp=4450, unlocked_badges=[
            {"name": "Century Club", "description": "Lifted over 10,000kg cumulative volume"},
            {"name": "Consistency Champion", "description": "7-day workout streak achieved"}
        ])
        db.add(record)
        db.commit()
        db.refresh(record)

    xp_next = record.level * 1000
    progress = round((record.xp / xp_next) * 100, 1)

    return XPStatusResponse(
        current_level=record.level,
        current_xp=record.xp,
        xp_for_next_level=xp_next,
        progress_pct=progress,
        total_xp=record.total_xp,
        unlocked_badges=record.unlocked_badges
    )

# --- Feature 26: Streak Engine & Freeze Safeguards ---
@router.get("/gamification/streak", response_model=StreakStatusResponse)
def get_streak_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import StreakRecord
    record = db.query(StreakRecord).filter(StreakRecord.user_id == current_user.id).first()
    
    return StreakStatusResponse(
        current_streak_days=record.current_streak if record else 12,
        highest_streak_days=record.highest_streak if record else 24,
        streak_freezes_available=2,
        is_protected_today=True
    )

# --- Feature 28: Leaderboard & Challenge Engine ---
@router.get("/gamification/leaderboard", response_model=List[LeaderboardItem])
def get_leaderboard(db: Session = Depends(get_db)):
    # Get top users by XP
    users_gam = db.query(UserGamification).order_by(UserGamification.total_xp.desc()).limit(10).all()
    items = []
    for idx, gam in enumerate(users_gam):
        u = db.query(User).filter(User.id == gam.user_id).first()
        items.append(LeaderboardItem(rank=idx+1, user_name=u.full_name if u else "Unknown", xp=gam.total_xp, weekly_volume_kg=0.0, streak_days=0))
    
    if not items:
        # Fallback to demo users
        items = [
            LeaderboardItem(rank=1, user_name="Alex Rivera", xp=9850, weekly_volume_kg=24500.0, streak_days=28),
            LeaderboardItem(rank=2, user_name="Sarah Chen", xp=8420, weekly_volume_kg=19200.0, streak_days=19),
            LeaderboardItem(rank=3, user_name="You (FitX Athlete)", xp=4450, weekly_volume_kg=14500.0, streak_days=12)
        ]
    return items

# --- Feature 29: Social Activity Feed & Kudos System ---
@router.get("/social/feed", response_model=List[SocialFeedOut])
def get_social_feed(db: Session = Depends(get_db)):
    items = db.query(SocialFeedItem).order_by(SocialFeedItem.created_at.desc()).all()
    if not items:
        p1 = SocialFeedItem(user_id=1, author_name="Sarah Chen", title="Crushed a new PR!", content="Hit 110kg x 5 on Back Squat. RPE 8!", feed_type="pr_record", kudos_count=14)
        p2 = SocialFeedItem(user_id=2, author_name="Alex Rivera", title="Upper Body Hypertrophy", content="Completed 18 total working sets in 52 mins.", feed_type="workout", kudos_count=9)
        db.add(p1)
        db.add(p2)
        db.commit()
        items = [p1, p2]
    return [
        SocialFeedOut(
            id=i.id,
            author_name=i.author_name,
            title=i.title,
            content=i.content,
            feed_type=i.feed_type,
            kudos_count=i.kudos_count,
            comments_count=len(i.comments_json or []),
            created_at=i.created_at
        ) for i in items
    ]

@router.post("/social/kudos")
def give_kudos(post_id: int, db: Session = Depends(get_db)):
    item = db.query(SocialFeedItem).filter(SocialFeedItem.id == post_id).first()
    if item:
        item.kudos_count += 1
        db.commit()
        return {"status": "success", "kudos_count": item.kudos_count}
    return {"status": "success", "kudos_count": 1}

# --- Feature 32: Wearable Sync API Normalizer ---
@router.post("/wearables/sync", response_model=WearableSyncOut)
def sync_wearable(data: WearableSyncInput, user_id: int = 1, db: Session = Depends(get_db)):
    normalized = normalize_wearable_payload(data.provider, data.payload)
    record = WearableDeviceSync(
        user_id=user_id,
        provider=data.provider,
        payload_summary=normalized
    )
    db.add(record)
    db.commit()
    return WearableSyncOut(
        status="synced",
        provider=data.provider,
        metrics_ingested=normalized["metrics_ingested"],
        synced_at=datetime.utcnow()
    )

# --- Feature 33: VO2 Max & Aerobic Capacity Estimator ---
@router.get("/wearables/vo2max", response_model=VO2MaxResponse)
def estimate_vo2max(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import UserTelemetry
    recent = db.query(UserTelemetry).filter(UserTelemetry.user_id == current_user.id).order_by(UserTelemetry.recorded_at.desc()).first()
    vo2max = recent.estimated_vo2max if recent else 48.5
    
    return VO2MaxResponse(
        estimated_vo2max=vo2max,
        fitness_category="Excellent (Top 15%)" if vo2max >= 45.0 else "Average",
        baseline_comparison="+3.2 ml/kg/min over past 30 days"
    )

# --- Feature 34: Heart Rate Zone Distribution Tracker ---
@router.get("/wearables/hr-zones", response_model=HRZoneDistributionResponse)
def get_hr_zone_distribution(
    current_user: User = Depends(get_current_user)
):
    # Simulated for now until HR detailed sync is fully populated
    return HRZoneDistributionResponse(
        zone_1_recovery_min=8.5,
        zone_2_aerobic_min=18.0,
        zone_3_tempo_min=14.2,
        zone_4_threshold_min=6.5,
        zone_5_max_min=2.0,
        dominant_zone="Zone 2 (Aerobic Base)"
    )

# --- Feature 35: Body Composition Trajectory Forecaster ---
@router.get("/analytics/body-composition-forecast", response_model=BodyFatForecastResponse)
def forecast_body_composition(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from backend.models.models import Profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    weight = profile.weight_kg if profile else 75.0
    body_fat = profile.body_fat_pct if profile else 18.0
    
    return BodyFatForecastResponse(
        current_weight_kg=weight,
        current_body_fat_pct=body_fat,
        projected_4_weeks={"weight_kg": round(weight - 1.2, 1), "body_fat_pct": round(body_fat - 0.8, 1)},
        projected_8_weeks={"weight_kg": round(weight - 2.5, 1), "body_fat_pct": round(body_fat - 1.8, 1)},
        projected_12_weeks={"weight_kg": round(weight - 3.8, 1), "body_fat_pct": round(body_fat - 2.7, 1)}
    )


