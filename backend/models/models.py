from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    onboarding = relationship("OnboardingProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    workout_sessions = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    recovery_scores = relationship("RecoveryScore", back_populates="user", cascade="all, delete-orphan")
    memories = relationship("MemoryTimelineItem", back_populates="user", cascade="all, delete-orphan")
    streaks = relationship("StreakRecord", back_populates="user", uselist=False, cascade="all, delete-orphan")
    fatigue_logs = relationship("FatigueLog", back_populates="user", cascade="all, delete-orphan")
    personal_records = relationship("PersonalRecord", back_populates="user", cascade="all, delete-orphan")
    rag_memories = relationship("RAGVectorMemory", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    height_cm = Column(Float, default=175.0)
    weight_kg = Column(Float, default=70.0)
    body_fat_pct = Column(Float, default=18.0)
    fitness_goal = Column(String, default="hypertrophy") # hypertrophy, strength, endurance, fat_loss
    fitness_level = Column(String, default="intermediate") # beginner, intermediate, advanced
    dietary_preference = Column(String, default="anything") # veg, non-veg, vegan, keto
    region = Column(String, default="North America")
    daily_meal_budget = Column(Float, default=25.0)
    active_injuries = Column(JSON, default=list) # e.g. ["shoulder", "knee"]
    available_equipment = Column(JSON, default=list) # e.g. ["dumbbells", "barbell", "bodyweight"]

    user = relationship("User", back_populates="profile")

class OnboardingProfile(Base):
    __tablename__ = "onboarding_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    age = Column(Integer, default=25)
    gender = Column(String, default="unspecified")
    height_cm = Column(Float, default=175.0)
    weight_kg = Column(Float, default=70.0)
    body_fat_pct = Column(Float, default=18.0)
    experience_level = Column(String, default="intermediate") # beginner, intermediate, advanced
    primary_goal = Column(String, default="build_muscle") # build_muscle, lose_fat, gain_strength, endurance, athletic_performance
    
    preferred_split = Column(String, default="ppl") # ppl, upper_lower, arnold, full_body, bro_split, custom
    training_frequency_days = Column(Integer, default=4) # 1-7 days
    session_duration_min = Column(Integer, default=45) # 15, 30, 45, 60, 90, 120
    gym_availability = Column(String, default="commercial_gym") # home_gym, commercial_gym, bodyweight_only
    available_equipment = Column(JSON, default=list) # dumbbells, barbell, power_rack, smith_machine, cables, bands, kettlebells, machines, cardio, mobility
    
    injury_history = Column(JSON, default=dict) # detailed dict: { shoulder: { rotator_cuff: true, pain: 3, limitations: "no overhead" } }
    exercises_to_avoid = Column(JSON, default=list)
    movement_restrictions = Column(JSON, default=list)
    
    occupation = Column(String, default="desk_job") # desk_job, student, construction, nurse, active
    travel_frequency = Column(String, default="rarely") # rarely, monthly, weekly
    sleep_avg_hours = Column(Float, default=7.5)
    stress_level = Column(String, default="moderate") # low, moderate, high
    water_intake_liters = Column(Float, default=2.5)
    medical_conditions = Column(JSON, default=list)
    connected_wearables = Column(JSON, default=list) # apple_watch, garmin, whoop, fitbit, samsung, google_fit
    
    is_completed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="onboarding")

class MasterExercise(Base):
    __tablename__ = "master_exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False, index=True) # chest, back, shoulders, biceps, triceps, forearms, core, glutes, quads, hamstrings, calves, neck, cardio, mobility, olympic, powerlifting, rehab
    primary_muscle = Column(String, nullable=False, index=True)
    secondary_muscles = Column(JSON, default=list)
    movement_pattern = Column(String, nullable=False) # push, pull, squat, hinge, lunge, carry, rotation, isolation
    equipment = Column(String, nullable=False, index=True) # barbell, dumbbell, cable, machine, bodyweight, band, kettlebell, smith_machine
    difficulty = Column(String, default="intermediate") # beginner, intermediate, advanced
    skill_level = Column(String, default="general")
    video_url = Column(String, default="")
    animation_path = Column(String, default="")
    instructions = Column(JSON, default=list)
    common_mistakes = Column(JSON, default=list)
    safety_tips = Column(JSON, default=list)
    alternatives = Column(JSON, default=list)
    progressions = Column(JSON, default=list)
    regressions = Column(JSON, default=list)
    warmup_suggestions = Column(JSON, default=list)
    estimated_calories_per_min = Column(Float, default=6.5)
    typical_rpe = Column(Float, default=8.0)
    typical_rest_sec = Column(Integer, default=90)
    tempo = Column(String, default="2-0-1-0")
    tut_sec = Column(Integer, default=30)
    rom_notes = Column(String, default="Full extension to peak contraction")
    grip_variations = Column(JSON, default=list)

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)
    name = Column(String, nullable=False)
    goal = Column(String, nullable=False)
    status = Column(String, default="active") # active, archived
    workout_data = Column(JSON, nullable=False) # Structured plan JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="workout_plans")
    versions = relationship("WorkoutVersionHistory", back_populates="plan", cascade="all, delete-orphan")

class WorkoutVersionHistory(Base):
    __tablename__ = "workout_version_history"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=False)
    version = Column(Integer, nullable=False)
    change_summary = Column(String, nullable=False)
    rationale = Column(Text, nullable=False)
    diff_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    plan = relationship("WorkoutPlan", back_populates="versions")

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, default="in_progress") # in_progress, completed, discarded
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    total_volume_kg = Column(Float, default=0.0)
    total_sets_completed = Column(Integer, default=0)
    calories_burned = Column(Float, default=0.0)
    avg_heart_rate = Column(Integer, default=125)
    notes = Column(Text, default="")
    ai_guidance_logs = Column(JSON, default=list)

    user = relationship("User", back_populates="workout_sessions")
    sets = relationship("WorkoutSet", back_populates="session", cascade="all, delete-orphan")

class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    exercise_name = Column(String, nullable=False)
    set_number = Column(Integer, nullable=False)
    set_type = Column(String, default="working") # warmup, working, pr_attempt, failure, dropset, superset, giant_set, paused, negative
    weight_kg = Column(Float, default=0.0)
    reps = Column(Integer, default=0)
    rpe = Column(Float, default=8.0) # Rate of perceived exertion 1-10
    rir = Column(Integer, default=2) # Reps in reserve
    tempo = Column(String, default="2-0-1-0")
    rest_seconds = Column(Integer, default=90)
    is_completed = Column(Boolean, default=True)
    is_pr = Column(Boolean, default=False)
    pain_level = Column(Integer, default=0) # 0-10
    form_rating = Column(Integer, default=5) # 1-5
    notes = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("WorkoutSession", back_populates="sets")

class RecoveryScore(Base):
    __tablename__ = "recovery_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String, nullable=False) # YYYY-MM-DD
    sleep_hours = Column(Float, default=7.5)
    hydration_liters = Column(Float, default=2.5)
    workout_load = Column(Float, default=50.0) # 0-100 scale
    resting_heart_rate = Column(Integer, default=62)
    stress_score = Column(Float, default=30.0) # 0-100
    soreness_score = Column(Float, default=20.0) # 0-100
    total_recovery_score = Column(Float, nullable=False) # 0-100 calculated
    recommendation = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recovery_scores")

class MuscleReadiness(Base):
    __tablename__ = "muscle_readiness"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    muscle_name = Column(String, nullable=False) # chest, back, shoulders, biceps, triceps, forearms, core, glutes, quads, hamstrings, calves, neck, lower_back
    readiness_pct = Column(Float, default=100.0) # 0 to 100%
    last_worked_date = Column(String, default="")
    accumulated_fatigue = Column(Float, default=0.0)
    soreness_rating = Column(Integer, default=1) # 1 to 10
    full_recovery_hours = Column(Float, default=0.0)
    breakdown_json = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PersonalRecord(Base):
    __tablename__ = "personal_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_name = Column(String, nullable=False)
    record_type = Column(String, nullable=False) # heaviest_lift, max_reps, max_volume, estimated_1rm, fastest_run, longest_plank
    value = Column(Float, nullable=False)
    unit = Column(String, default="kg")
    achieved_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, default="")

    user = relationship("User", back_populates="personal_records")

class MemoryTimelineItem(Base):
    __tablename__ = "memory_timeline"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    category = Column(String, nullable=False) # injury, habit, preference, milestone
    content = Column(Text, nullable=False)
    confidence = Column(Float, default=0.95)
    is_active = Column(Boolean, default=True)
    source = Column(String, default="user_feedback")

    user = relationship("User", back_populates="memories")

class RAGVectorMemory(Base):
    __tablename__ = "rag_vector_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    memory_type = Column(String, nullable=False) # workout_history, pr, injury, recovery, preference, feedback
    text_content = Column(Text, nullable=False)
    embedding = Column(JSON, default=list) # Float list representation
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="rag_memories")

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    habit_name = Column(String, nullable=False)
    adherence_rate = Column(Float, default=100.0) # percentage 0-100
    auto_adjusted = Column(Boolean, default=False)
    confidence_score = Column(Float, default=0.9)

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String, nullable=False) # YYYY-MM-DD
    diet_type = Column(String, nullable=False)
    recipes = Column(JSON, nullable=False)
    total_cost = Column(Float, nullable=False)
    total_calories = Column(Integer, nullable=False)
    macros = Column(JSON, nullable=False) # {protein: X, carbs: Y, fat: Z}

class GroceryList(Base):
    __tablename__ = "grocery_lists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_label = Column(String, nullable=False)
    items = Column(JSON, nullable=False)
    estimated_total_cost = Column(Float, nullable=False)
    reused_ingredients_pct = Column(Float, default=0.0)

class StreakRecord(Base):
    __tablename__ = "streak_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    highest_streak = Column(Integer, default=0)
    last_activity_date = Column(String, default="")
    protected_days = Column(Integer, default=0)

    user = relationship("User", back_populates="streaks")

class FatigueLog(Base):
    __tablename__ = "fatigue_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body_part = Column(String, nullable=False) # shoulders, chest, back, legs, core, arms
    fatigue_level = Column(Float, nullable=False) # 0 to 100
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="fatigue_logs")

class UserTelemetry(Base):
    __tablename__ = "user_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    weight_kg = Column(Float, nullable=True)
    body_fat_pct = Column(Float, nullable=True)
    resting_hr = Column(Integer, nullable=True)
    systolic_bp = Column(Integer, nullable=True)
    diastolic_bp = Column(Integer, nullable=True)
    sleep_deep_hours = Column(Float, default=2.0)
    sleep_rem_hours = Column(Float, default=1.8)
    sleep_light_hours = Column(Float, default=3.7)
    perceived_stress = Column(Float, default=30.0) # 0-100
    estimated_vo2max = Column(Float, default=45.0)

class UserMealLog(Base):
    __tablename__ = "user_meal_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meal_name = Column(String, nullable=False) # Breakfast, Lunch, Dinner, Snack
    meal_time = Column(DateTime, default=datetime.utcnow)
    calories = Column(Integer, default=0)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    fat_g = Column(Float, default=0.0)
    fiber_g = Column(Float, default=0.0)
    sodium_mg = Column(Float, default=0.0)
    potassium_mg = Column(Float, default=0.0)
    water_ml = Column(Float, default=0.0)
    food_items = Column(JSON, default=list)

class UserGamification(Base):
    __tablename__ = "user_gamification"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    streak_freezes_available = Column(Integer, default=2)
    unlocked_badges = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SocialFeedItem(Base):
    __tablename__ = "social_feed_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    feed_type = Column(String, default="workout") # workout, pr_record, streak_milestone
    kudos_count = Column(Integer, default=0)
    comments_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class WearableDeviceSync(Base):
    __tablename__ = "wearable_device_syncs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False) # apple_health, google_fit, garmin, fitbit
    last_synced_at = Column(DateTime, default=datetime.utcnow)
    payload_summary = Column(JSON, default=dict)


# =====================================================================
# TEMPORAL EVENT SYSTEM (TES) - CORE ORM MODELS
# =====================================================================
import uuid

class TemporalEvent(Base):
    __tablename__ = "temporal_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), nullable=False, index=True) # workout, nutrition, recovery, hydration, measurement, sleep, coaching, achievement, challenge, goal, habit, reminder, custom
    event_type = Column(String(64), nullable=False, index=True) # session, meal, weigh_in, body_metric, habit_check, rest_day, coaching_checkpoint, custom
    
    status = Column(String(32), nullable=False, default="SCHEDULED", index=True) # DRAFT, SCHEDULED, PENDING, ACTIVE, COMPLETED, MISSED, SKIPPED, CANCELLED, EXPIRED, ARCHIVED
    priority = Column(String(16), default="MEDIUM", index=True) # LOW, MEDIUM, HIGH, URGENT, CRITICAL
    source = Column(String(32), default="USER", index=True) # USER, AI_COACH, SYSTEM_AUTOMATION, DEVICE_WEARABLE, INTEGRATION
    source_id = Column(String(255), nullable=True)
    
    planned_start_at = Column(DateTime, nullable=True, index=True)
    planned_end_at = Column(DateTime, nullable=True)
    actual_start_at = Column(DateTime, nullable=True)
    actual_end_at = Column(DateTime, nullable=True)
    
    is_all_day = Column(Boolean, default=False)
    duration_minutes = Column(Integer, nullable=True)
    
    timezone_name = Column(String(64), default="UTC")
    timezone_offset_minutes = Column(Integer, default=0)
    
    master_event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=True, index=True)
    parent_event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=True, index=True)
    
    metadata_payload = Column(JSON, default=dict)
    tags = Column(JSON, default=list)
    version = Column(Integer, default=1)
    is_deleted = Column(Boolean, default=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User", backref="temporal_events")
    recurrence_rule = relationship("EventRecurrenceRule", back_populates="event", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("TemporalEventAudit", back_populates="event", cascade="all, delete-orphan")

class EventRecurrenceRule(Base):
    __tablename__ = "event_recurrence_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=False, unique=True, index=True)
    
    frequency = Column(String(32), nullable=False) # DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM
    interval = Column(Integer, default=1)
    by_weekday = Column(JSON, default=list) # e.g. ["MO", "WE", "FR"]
    by_monthday = Column(JSON, default=list) # e.g. [1, 15]
    until_date = Column(DateTime, nullable=True)
    count = Column(Integer, nullable=True)
    rrule_string = Column(String(255), nullable=True)
    exception_dates = Column(JSON, default=list) # List of ISO date strings "YYYY-MM-DD"
    status = Column(String(32), default="ACTIVE") # ACTIVE, PAUSED, COMPLETED, TERMINATED
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("TemporalEvent", back_populates="recurrence_rule")

class EventDependency(Base):
    __tablename__ = "event_dependencies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    prerequisite_event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=False, index=True)
    dependent_event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=False, index=True)
    dependency_type = Column(String(32), default="REQUIRES_COMPLETION") # REQUIRES_COMPLETION, REQUIRES_START, BLOCKS
    is_blocking = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TemporalEventAudit(Base):
    __tablename__ = "temporal_event_audits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    actor_type = Column(String(32), nullable=False) # USER, AI_COACH, SYSTEM_AUTOMATION, DEVICE_WEARABLE, INTEGRATION
    actor_id = Column(String(128), nullable=True)
    action = Column(String(64), nullable=False) # CREATED, STATUS_CHANGED, RESCHEDULED, METADATA_MUTATED, RECURRENCE_PAUSED, SPLIT_SERIES, SOFT_DELETED
    
    previous_status = Column(String(32), nullable=True)
    new_status = Column(String(32), nullable=True)
    diff_payload = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    event = relationship("TemporalEvent", back_populates="audit_logs")


# =====================================================================
# NUTRITION, HYDRATION, SUPPLEMENT & RECIPE MODULE MODELS (TES INTEGRATED)
# =====================================================================

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True) # Breakfast, Lunch, Dinner, Snacks, Proteins, Carbs & Grains, Vegetables & Greens, Healthy Fats & Nuts, Dairy & Alternatives, Supplements & Meds
    serving_size = Column(String(128), default="100g")
    serving_weight_g = Column(Float, default=100.0)
    calories = Column(Integer, default=0)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    net_carbs_g = Column(Float, default=0.0)
    fat_g = Column(Float, default=0.0)
    sat_fat_g = Column(Float, default=0.0)
    unsat_fat_g = Column(Float, default=0.0)
    fiber_g = Column(Float, default=0.0)
    sugar_g = Column(Float, default=0.0)
    sodium_mg = Column(Float, default=0.0)
    potassium_mg = Column(Float, default=0.0)
    calcium_mg = Column(Float, default=0.0)
    iron_mg = Column(Float, default=0.0)
    vitamin_a_iu = Column(Float, default=0.0)
    vitamin_c_mg = Column(Float, default=0.0)
    vitamin_d_iu = Column(Float, default=0.0)
    vitamin_b_complex_mg = Column(Float, default=0.0)
    magnesium_mg = Column(Float, default=0.0)
    zinc_mg = Column(Float, default=0.0)
    phosphorus_mg = Column(Float, default=0.0)
    water_g = Column(Float, default=0.0)
    cholesterol_mg = Column(Float, default=0.0)
    brand = Column(String(128), default="Generic")
    search_keywords = Column(JSON, default=list) # e.g. ["roti", "chapati", "fulka"]
    aliases = Column(JSON, default=list) # e.g. ["Wheat Roti"]
    regional_names = Column(String(255), default="") # e.g. "Roti (Hindi), Chapati (Marathi)"
    future_ai_metadata = Column(JSON, default=dict)
    micronutrients = Column(JSON, default=dict)
    badge_emoji = Column(String(16), default="🥗")
    verified = Column(Boolean, default=True)
    is_custom = Column(Boolean, default=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FavoriteFood(Base):
    __tablename__ = "favorite_foods"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    food_id = Column(String(64), ForeignKey("food_items.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class RecentFood(Base):
    __tablename__ = "recent_foods"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    food_id = Column(String(64), ForeignKey("food_items.id"), nullable=False, index=True)
    last_used_at = Column(DateTime, default=datetime.utcnow, index=True)
    frequency_count = Column(Integer, default=1)

class RecipeItem(Base):
    __tablename__ = "recipe_items"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    serving_size = Column(String(64), default="1 serving")
    prep_time_min = Column(Integer, default=15)
    total_calories = Column(Integer, default=0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fat = Column(Float, default=0.0)
    total_fiber = Column(Float, default=0.0)
    badge_emoji = Column(String(16), default="🍲")
    instructions = Column(JSON, default=list) # List of instruction strings
    ingredients = Column(JSON, default=list) # [{ food_id, name, quantity_g, calories, protein, carbs, fat }]
    created_at = Column(DateTime, default=datetime.utcnow)

class MealComboModel(Base):
    __tablename__ = "meal_combos"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    items = Column(JSON, default=list) # [{ foodId, quantity }]
    total_calories = Column(Integer, default=0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fat = Column(Float, default=0.0)
    badge_emoji = Column(String(16), default="🍱")
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyNutritionLog(Base):
    __tablename__ = "daily_nutrition_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    meal_category = Column(String(64), nullable=False, index=True) # Breakfast, Lunch, Dinner, Snacks
    food_id = Column(String(64), nullable=True)
    name = Column(String(255), nullable=False)
    serving_multiplier = Column(Float, default=1.0)
    calories = Column(Integer, default=0)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)
    fiber = Column(Float, default=0.0)
    sodium_mg = Column(Float, default=0.0)
    potassium_mg = Column(Float, default=0.0)
    badge_emoji = Column(String(16), default="🍽️")
    status = Column(String(32), default="pending", index=True) # pending, completed, skipped
    scheduled_time = Column(String(16), nullable=True) # e.g. "08:30"
    completed_at = Column(String(32), nullable=True) # ISO string or formatted timestamp
    temporal_event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    auto_copy_flags = Column(JSON, default=dict)
    linked_recipe_id = Column(String(64), nullable=True)
    linked_supplements = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyHydrationLog(Base):
    __tablename__ = "daily_hydration_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    liquid_type = Column(String(64), nullable=False) # Water, Electrolytes, Protein Shake, Tea & Coffee, Fresh Juice
    volume_ml = Column(Integer, nullable=False, default=250)
    emoji = Column(String(16), default="💧")
    timestamp = Column(String(32), nullable=False) # ISO or formatted time
    temporal_event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailySupplementLog(Base):
    __tablename__ = "daily_supplement_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    name = Column(String(255), nullable=False)
    dosage = Column(String(64), nullable=False, default="1 serving") # e.g. "5g", "1 pill"
    timing = Column(String(64), nullable=False, default="Morning") # Morning, With Meals, Pre-Workout, Post-Workout, Bedtime
    scheduled_time = Column(String(16), default="08:00")
    status = Column(String(32), default="pending", index=True) # pending, completed, skipped
    completed_at = Column(String(32), nullable=True)
    badge_emoji = Column(String(16), default="💊")
    temporal_event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyNutritionSummary(Base):
    __tablename__ = "daily_nutrition_summaries"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    total_calories = Column(Integer, default=0)
    target_calories = Column(Integer, default=2200)
    total_protein = Column(Float, default=0.0)
    target_protein = Column(Float, default=150.0)
    total_carbs = Column(Float, default=0.0)
    target_carbs = Column(Float, default=220.0)
    total_net_carbs = Column(Float, default=0.0)
    total_fat = Column(Float, default=0.0)
    target_fat = Column(Float, default=70.0)
    total_sat_fat = Column(Float, default=0.0)
    total_unsat_fat = Column(Float, default=0.0)
    total_fiber = Column(Float, default=0.0)
    target_fiber = Column(Float, default=30.0)
    total_sugar = Column(Float, default=0.0)
    total_sodium_mg = Column(Float, default=0.0)
    total_potassium_mg = Column(Float, default=0.0)
    total_cholesterol_mg = Column(Float, default=0.0)
    total_water_ml = Column(Integer, default=0)
    target_water_ml = Column(Integer, default=3500)
    completed_meals = Column(Integer, default=0)
    total_meals = Column(Integer, default=0)
    completed_supplements = Column(Integer, default=0)
    total_supplements = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    hypertrophy_match_pct = Column(Float, default=0.0)
    fat_loss_match_pct = Column(Float, default=0.0)
    maintenance_match_pct = Column(Float, default=0.0)
    nutrition_score = Column(Float, default=85.0)
    deficiency_alerts = Column(JSON, default=list) # Future AI readiness
    time_compliance_pct = Column(Float, default=100.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ReminderRule(Base):
    __tablename__ = "reminder_rules"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    time_str = Column(String(16), nullable=False) # e.g. "08:00"
    enabled = Column(Boolean, default=True)
    reminder_type = Column(String(32), nullable=False, default="meal") # meal, water, supplement
    temporal_event_id = Column(String(36), ForeignKey("temporal_events.id"), nullable=True, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)




