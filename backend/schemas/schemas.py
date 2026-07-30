from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth & User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProfileSchema(BaseModel):
    height_cm: float = 175.0
    weight_kg: float = 70.0
    body_fat_pct: float = 18.0
    fitness_goal: str = "hypertrophy"
    fitness_level: str = "intermediate"
    dietary_preference: str = "anything"
    region: str = "North America"
    daily_meal_budget: float = 25.0
    active_injuries: List[str] = []
    available_equipment: List[str] = ["dumbbells", "barbell", "bodyweight"]

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    profile: Optional[ProfileSchema] = None

    class Config:
        from_attributes = True

# Signal Input for Adaptive Planning Engine (Service 01)
class SignalInput(BaseModel):
    sleep_hours: float = 7.5
    calories_consumed: int = 2200
    missed_workouts: int = 0
    available_equipment: List[str] = ["dumbbells", "barbell"]
    active_injuries: List[str] = []
    schedule_minutes: int = 45

# Recovery Score Schemas (Service 07)
class RecoveryInput(BaseModel):
    sleep_hours: float = 7.5
    hydration_liters: float = 2.5
    workout_load: float = 65.0
    resting_heart_rate: int = 62
    stress_score: float = 30.0
    soreness_score: float = 20.0

class RecoveryResult(BaseModel):
    total_score: float
    status: str # Optimal, Moderate, Deload Needed, Critical Rest
    recommendation: str
    exercise_modifications: List[Dict[str, Any]]

# Progressive Overload Engine Schemas (Service 10)
class OverloadInput(BaseModel):
    exercise_name: str
    current_weight: float
    current_reps: int
    current_sets: int
    rpe: float # Rate of Perceived Exertion (1-10)
    fatigue_level: float = 30.0

class OverloadRecommendation(BaseModel):
    exercise_name: str
    target_weight: float
    target_reps: int
    target_sets: int
    recommended_rest_sec: int
    tempo: str # e.g. "3-1-1-0"
    is_deload_week: bool
    explanation: str

# Workout Version Control Schemas (Service 02)
class VersionCompareRequest(BaseModel):
    v1: int
    v2: int

# Memory Timeline Schemas (Service 05)
class MemoryCreate(BaseModel):
    category: str # injury, preference, habit, milestone
    content: str
    confidence: float = 0.95
    source: str = "user_feedback"

class MemoryOut(BaseModel):
    id: int
    category: str
    content: str
    confidence: float
    is_active: bool
    timestamp: datetime

    class Config:
        from_attributes = True

# Scenario Planner Schemas (Service 13)
class ScenarioRequest(BaseModel):
    scenario_type: str # travel, low_equipment, busy_day
    available_time_min: int = 20
    location: str = "hotel_room"

# Meal Planner Budget Schemas (Service 14)
class MealPlanRequest(BaseModel):
    daily_budget: float = 25.0
    region: str = "North America"
    dietary_preference: str = "anything" # veg, non-veg, keto, vegan
    cooking_skill: str = "intermediate"
    target_calories: int = 2200

# Streak Protection Schemas (Service 16)
class MicroWorkoutRequest(BaseModel):
    available_minutes: int = 15
    fatigue_level: float = 40.0

# AI Coach Schemas
class ChatMessage(BaseModel):
    user_id: int
    message: str
    context: Optional[Dict[str, Any]] = None

class CoachReply(BaseModel):
    reply: str
    suggested_actions: List[Dict[str, Any]]
    confidence: float = 0.98

# Fatigue Map Schemas (Service 11)
class FatigueData(BaseModel):
    shoulders: float = 15.0
    chest: float = 25.0
    back: float = 10.0
    legs: float = 40.0
    core: float = 10.0
    arms: float = 20.0

# Expanded Onboarding Schemas
class OnboardingInput(BaseModel):
    age: int = 25
    gender: str = "unspecified"
    height_cm: float = 175.0
    weight_kg: float = 70.0
    body_fat_pct: float = 18.0
    experience_level: str = "intermediate" # beginner, intermediate, advanced
    primary_goal: str = "build_muscle"
    preferred_split: str = "ppl"
    training_frequency_days: int = 4
    session_duration_min: int = 45
    gym_availability: str = "commercial_gym"
    available_equipment: List[str] = ["dumbbells", "barbell", "bodyweight"]
    injury_history: Dict[str, Any] = {}
    exercises_to_avoid: List[str] = []
    movement_restrictions: List[str] = []
    occupation: str = "desk_job"
    travel_frequency: str = "rarely"
    sleep_avg_hours: float = 7.5
    stress_level: str = "moderate"
    water_intake_liters: float = 2.5
    medical_conditions: List[str] = []
    connected_wearables: List[str] = ["apple_watch"]
    confidence_score: float = 0.95
    data_source: str = "USER_CONFIRMED"

class OnboardingOut(OnboardingInput):
    id: int
    user_id: int
    is_completed: bool = True
    created_at: datetime
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True

class MicroPromptOut(BaseModel):
    prompt_id: str
    category: str
    question: str
    options: List[Dict[str, str]]
    confidence_impact: float = 0.05


# Master Exercise Schemas
class MasterExerciseOut(BaseModel):
    id: int
    name: str
    aliases: List[str] = []
    category: str
    primary_muscle: str
    secondary_muscles: List[str] = []
    movement_pattern: str
    equipment: str
    difficulty: str
    skill_level: str
    exercise_type: str
    video_url: str = ""
    animation_path: str = ""
    instructions: List[str] = []
    common_mistakes: List[str] = []
    safety_tips: List[str] = []
    breathing_technique: str
    alternatives: List[str] = []
    progressions: List[str] = []
    regressions: List[str] = []
    warmup_suggestions: List[str] = []
    estimated_calories_per_min: float
    typical_rpe: float
    typical_rest_sec: int
    tempo: str
    tut_sec: int
    rom_notes: str = ""
    grip_variations: List[str] = []
    average_duration_sec: int
    recommended_sets: int
    recommended_reps: str
    references: List[str] = []
    joint_stress: List[Dict[str, str]] = []

    class Config:
        from_attributes = True

# Knowledge Layer Schemas
class MuscleAtlasOut(BaseModel):
    id: str
    name: str
    group: str
    function: str
    recovery_time_hours_avg: float
    description: str
    image_url: str

    class Config:
        from_attributes = True

class JointAtlasOut(BaseModel):
    id: str
    name: str
    type: str
    description: str

    class Config:
        from_attributes = True

class InjuryKnowledgeNodeOut(BaseModel):
    id: str
    name: str
    affected_region: str
    conflicting_movements: List[str]
    safe_alternatives: List[str]
    description: str
    recovery_guidelines: str

    class Config:
        from_attributes = True

class UserInjuryProfileOut(BaseModel):
    id: str
    user_id: int
    injury_node_id: str
    status: str
    pain_level: int
    reported_at: datetime
    notes: str

    class Config:
        from_attributes = True

# Workout Execution Schemas
class LogSetInput(BaseModel):
    session_id: int
    exercise_name: str
    set_number: int
    set_type: str = "working" # warmup, working, pr_attempt, failure, dropset, superset, giant_set, paused, negative
    weight_kg: float
    reps: int
    rpe: float = 8.0
    rir: int = 2
    tempo: str = "2-0-1-0"
    rest_seconds: int = 90
    pain_level: int = 0
    form_rating: int = 5
    notes: str = ""

class WorkoutSetOut(BaseModel):
    id: int
    session_id: int
    exercise_name: str
    set_number: int
    set_type: str
    weight_kg: float
    reps: int
    rpe: float
    rir: int
    tempo: str
    rest_seconds: int
    is_completed: bool
    is_pr: bool
    pain_level: int
    form_rating: int
    notes: str

    class Config:
        from_attributes = True

class WorkoutSessionStartInput(BaseModel):
    name: str = "Adaptive Hypertrophy Push Session"
    target_muscles: List[str] = ["chest", "shoulders", "triceps"]

class WorkoutSessionOut(BaseModel):
    id: int
    user_id: int
    temporal_event_id: Optional[str] = None
    name: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: int = 0
    total_volume_kg: float = 0.0
    total_sets_completed: int = 0
    calories_burned: float = 0.0
    avg_heart_rate: int = 125
    notes: str = ""
    ai_guidance_logs: List[Dict[str, Any]] = []
    sets: List[WorkoutSetOut] = []

    class Config:
        from_attributes = True

# Muscle Readiness Schemas
class MuscleReadinessItem(BaseModel):
    muscle_name: str
    readiness_pct: float
    last_worked_date: str
    soreness_rating: int
    full_recovery_hours: float
    status: str # Fully Recovered, Recovering, Needs Rest

class MuscleReadinessDashboardOut(BaseModel):
    overall_readiness_score: float
    recovered_muscles: List[str]
    recovering_muscles: List[str]
    muscle_scores: List[MuscleReadinessItem]
    ai_recovery_recommendations: List[str]

# Personal Records & Analytics Schemas
class PersonalRecordOut(BaseModel):
    id: int
    exercise_name: str
    record_type: str
    value: float
    unit: str
    achieved_at: datetime
    notes: str = ""

    class Config:
        from_attributes = True

class AnalyticsDashboardOut(BaseModel):
    total_workouts_completed: int
    total_volume_kg: float
    avg_session_duration_min: float
    consistency_score: float
    strength_growth_pct: float
    acwr_ratio: float # Acute to Chronic Workload Ratio
    injury_risk_level: str # Low, Optimal, High
    muscle_volume_distribution: Dict[str, float]
    recent_prs: List[PersonalRecordOut]

# RAG & AI Vector Memory Schemas
class RAGQueryInput(BaseModel):
    query: str
    user_id: int = 1

class RAGQueryResponse(BaseModel):
    answer: str
    retrieved_context: List[Dict[str, Any]]
    confidence: float
    suggested_actions: List[Dict[str, Any]] = []

# Domain 2 & 5: Telemetry & Vitals Schemas
class TelemetryInput(BaseModel):
    weight_kg: Optional[float] = None
    body_fat_pct: Optional[float] = None
    resting_hr: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    sleep_deep_hours: float = 2.0
    sleep_rem_hours: float = 1.8
    sleep_light_hours: float = 3.7
    perceived_stress: float = 30.0

class TelemetryOut(TelemetryInput):
    id: int
    user_id: int
    recorded_at: datetime
    estimated_vo2max: float

    class Config:
        from_attributes = True

# Domain 3: Nutrition Engine Schemas
class TDEEBMRResponse(BaseModel):
    bmr_mifflin: float
    bmr_katch: float
    tdee_calories: float
    adjusted_daily_target: float
    workout_burn_offset: float

class MacroSplitResponse(BaseModel):
    goal: str
    target_calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    protein_pct: int
    carbs_pct: int
    fat_pct: int

class MealLogInput(BaseModel):
    meal_name: str
    calories: int
    protein_g: float = 0.0
    carbs_g: float = 0.0
    fat_g: float = 0.0
    fiber_g: float = 0.0
    sodium_mg: float = 0.0
    potassium_mg: float = 0.0
    water_ml: float = 0.0
    food_items: List[Dict[str, Any]] = []

class MealLogOut(MealLogInput):
    id: int
    user_id: int
    meal_time: datetime

    class Config:
        from_attributes = True

class HydrationStatus(BaseModel):
    required_ml: float
    consumed_ml: float
    remaining_ml: float
    electrolyte_recommendation: str

class FastingStatus(BaseModel):
    fasting_protocol: str # 16:8, 18:6, 20:4
    fast_start_time: datetime
    elapsed_hours: float
    target_hours: float
    is_in_fasting_window: bool
    progress_pct: float

class MicronutrientMatrix(BaseModel):
    fiber_g: float
    fiber_rda_pct: float
    sodium_mg: float
    sodium_status: str
    potassium_mg: float
    potassium_status: str
    overall_completeness_pct: float
    deficits: List[str]

# Domain 4: Gamification & Community Schemas
class XPStatusResponse(BaseModel):
    current_level: int
    current_xp: int
    xp_for_next_level: int
    progress_pct: float
    total_xp: int
    unlocked_badges: List[Dict[str, Any]]

class StreakStatusResponse(BaseModel):
    current_streak_days: int
    highest_streak_days: int
    streak_freezes_available: int
    is_protected_today: bool

class LeaderboardItem(BaseModel):
    rank: int
    user_name: str
    xp: int
    weekly_volume_kg: float
    streak_days: int

class SocialPostCreate(BaseModel):
    title: str
    content: str
    feed_type: str = "workout"

class SocialFeedOut(BaseModel):
    id: int
    author_name: str
    title: str
    content: str
    feed_type: str
    kudos_count: int
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# Domain 5: Wearables & Metrics Schemas
class WearableSyncInput(BaseModel):
    provider: str # apple_health, google_fit, garmin, fitbit
    payload: Dict[str, Any]

class WearableSyncOut(BaseModel):
    status: str
    provider: str
    metrics_ingested: List[str]
    synced_at: datetime

class VO2MaxResponse(BaseModel):
    estimated_vo2max: float
    fitness_category: str
    baseline_comparison: str

class HRZoneDistributionResponse(BaseModel):
    zone_1_recovery_min: float
    zone_2_aerobic_min: float
    zone_3_tempo_min: float
    zone_4_threshold_min: float
    zone_5_max_min: float
    dominant_zone: str

class BodyFatForecastResponse(BaseModel):
    current_weight_kg: float
    current_body_fat_pct: float
    projected_4_weeks: Dict[str, float]
    projected_8_weeks: Dict[str, float]
    projected_12_weeks: Dict[str, float]

# Domain 6: System Infrastructure & Health Schemas
class HealthReport(BaseModel):
    status: str
    database_connected: bool
    version: str
    microservices_count: int = 20
    models_loaded_count: int = 17
    services_status: Dict[str, str] = {}
    system_timestamp: datetime = Field(default_factory=datetime.utcnow)


# Milestone 3: FitX Timeline Engine & Fitness Time Machine Schemas
class DailyContainerOut(BaseModel):
    date: str
    workout_session: Optional[Dict[str, Any]] = None
    nutrition_summary: Dict[str, Any]
    recovery_telemetry: Dict[str, Any]
    biometrics: Dict[str, Any]
    journal_notes: List[str] = []
    ai_rationales: List[str] = []

class TimeMachineQueryInput(BaseModel):
    window_a_start: str
    window_a_end: str
    window_b_start: str
    window_b_end: str

class TimeMachineResponse(BaseModel):
    window_a_summary: Dict[str, Any]
    window_b_summary: Dict[str, Any]
    comparative_insights: List[str]
    strength_delta_pct: float
    adherence_delta_pct: float
    ai_recommendation: str

# Milestone 4: Intelligent Workout Engine Schemas
class PlateCalculatorOut(BaseModel):
    target_weight_kg: float
    barbell_weight_kg: float = 20.0
    weight_per_side_kg: float
    plates_per_side: Dict[str, int]
    is_exact_match: bool = True

class WarmupSetItem(BaseModel):
    set_number: int
    weight_kg: float
    reps: int
    pct_working_weight: float

class WarmupProtocolOut(BaseModel):
    exercise_name: str
    working_weight_kg: float
    warmup_sets: List[WarmupSetItem]

# Milestone 5: Human Performance Engine (HPE) Schemas
class HPEReadinessOut(BaseModel):
    overall_readiness_score: float
    recovery_score: float
    cns_fatigue_score: float
    performance_capacity_pct: float
    injury_risk_score: float
    muscle_readiness_map: Dict[str, float]
    signals_processed_count: int = 28

class HPEBurnoutForecastOut(BaseModel):
    acwr_ratio: float
    burnout_probability_pct: float
    overtraining_risk_level: str
    weeks_to_potential_plateau: int
    recommended_action: str

class HPEExplainableAIRationaleOut(BaseModel):
    recommendation: str
    evidence_used: List[str]
    signals_considered: int = 28
    confidence_score: float
    expected_outcome: str
    alternative_actions: List[str]

# Milestone 6: Digital Twin Intelligence Engine (DTIE) Schemas
class DigitalTwinAvatarOut(BaseModel):
    user_id: int
    twin_model_version: str = "v6.0-live"
    overall_confidence_score: float
    data_points_ingested: int
    identity_layer: Dict[str, Any]
    fitness_layer: Dict[str, Any]
    recovery_layer: Dict[str, Any]
    nutrition_layer: Dict[str, Any]
    personality_layer: Dict[str, Any]

class WhatIfSimInput(BaseModel):
    training_days_per_week: Optional[int] = None
    target_sleep_hours: Optional[float] = None
    daily_protein_grams: Optional[float] = None
    split_type: Optional[str] = None

class WhatIfSimResponse(BaseModel):
    scenario_description: str
    predicted_readiness_delta_pct: float
    projected_1rm_bench_kg: float
    projected_12_week_muscle_gain_kg: float
    soreness_duration_hours: int
    ai_recommendation: str

class PersonalBaselinesOut(BaseModel):
    typical_sleep_hours: float
    baseline_hrv_ms: float
    baseline_rhr_bpm: float
    typical_hydration_liters: float
    typical_protein_grams: float
    avg_workout_duration_mins: int
    weekly_adherence_pct: float
    strength_progression_rate_kg_per_month: float

# Milestone 7: Knowledge Intelligence Engine (KIE) Schemas
class KIEGraphNodeOut(BaseModel):
    id: str
    title: str

    description: str
    evidence_level: str # LEVEL_I to LEVEL_V
    confidence_score: float
    version: str = "v2.1.0"
    applicable_population: List[str]
    contraindications: List[str]
    tags: List[str]

class KIEQueryInput(BaseModel):
    query: str
    domain_filter: Optional[str] = None

class KIEReasoningResponse(BaseModel):
    user_observation: str
    evidence_knowledge_nodes: List[str]
    ai_reasoning: str
    predicted_outcome: str
    hypotheses: List[str]
    confidence_score: float = 0.95

class KIETaxonomyOut(BaseModel):
    domains_count: int = 22
    categories: List[str]
    active_knowledge_nodes: int = 142

# Milestone 8: Product Intelligence & Continuous Evolution Engine (PICE) Schemas
class ProductHealthOut(BaseModel):
    dau: int
    wau: int
    mau: int
    day_30_retention_pct: float
    avg_session_duration_mins: float
    workout_completion_rate_pct: float
    ai_recommendation_acceptance_rate_pct: float
    highest_dropoff_screen: str

class FeatureQualityScorecardOut(BaseModel):
    feature_id: str
    feature_name: str
    monthly_active_users: int
    task_success_rate_pct: float
    user_effort_score: int # 1 to 5
    avg_completion_time_sec: float
    user_value_rating: int # 1 to 10
    business_value_rating: int # 1 to 10

class AIEvalInput(BaseModel):
    recommendation_id: str
    action_taken: str # ACCEPTED, MODIFIED, IGNORED, REJECTED
    user_feedback_note: Optional[str] = None

class UserFeedbackInput(BaseModel):
    category: str # BUG, FEATURE_REQUEST, UX_FRICTION, GENERAL
    rating_stars: int = 5
    comment: str
    context_screen: Optional[str] = None

# Phase 11 Wave 1: Enterprise Security Schemas
class TokenPairOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenInput(BaseModel):
    refresh_token: str






