import uuid
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

class RawAnalyticsEvent(Base):
    """
    Append-only event store for all user actions.
    This acts as the source of truth for the Analytics Engine.
    """
    __tablename__ = "raw_analytics_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    event_category = Column(String(64), nullable=False, index=True) # workout, nutrition, recovery, body, mood, sleep
    event_type = Column(String(64), nullable=False, index=True) # workout_completed, meal_logged, weight_updated, etc.
    
    # Context IDs to link back to the source records
    source_id = Column(String(128), nullable=True) 
    
    # The actual raw data payload
    payload = Column(JSON, nullable=False)
    
    # For idempotency / exactly-once processing
    processed = Column(Boolean, default=False, index=True)
    processed_at = Column(DateTime, nullable=True)

class DailyAggregate(Base):
    """
    Materialized view of daily metrics.
    Recalculated by the Analytics Engine based on RawAnalyticsEvent.
    """
    __tablename__ = "daily_aggregates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    
    # Workout & Training
    workout_consistency_pct = Column(Float, default=0.0)
    training_adherence_pct = Column(Float, default=0.0)
    daily_volume_kg = Column(Float, default=0.0)
    workout_duration_min = Column(Integer, default=0)
    calories_burned = Column(Float, default=0.0)
    skipped_exercises = Column(Integer, default=0)
    completed_exercises = Column(Integer, default=0)
    
    # Nutrition
    nutrition_adherence_pct = Column(Float, default=0.0)
    calories_consumed = Column(Integer, default=0)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    fat_g = Column(Float, default=0.0)
    hydration_ml = Column(Integer, default=0)
    
    # Recovery & Body
    recovery_score = Column(Float, default=0.0) # 0-100
    sleep_hours = Column(Float, default=0.0)
    readiness_score = Column(Float, default=0.0) # 0-100
    mood_score = Column(Float, default=0.0) # 1-10
    stress_score = Column(Float, default=0.0) # 1-10
    fatigue_index = Column(Float, default=0.0)
    body_weight_kg = Column(Float, nullable=True)
    
    # Derived / AI metrics
    ai_confidence = Column(Float, default=0.0)
    overtraining_risk = Column(Float, default=0.0) # 0-100
    plateau_risk = Column(Float, default=0.0) # 0-100
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WeeklyAggregate(Base):
    __tablename__ = "weekly_aggregates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    week_number = Column(Integer, nullable=False, index=True) # 1-52
    
    # Averages and Totals
    avg_workout_consistency_pct = Column(Float, default=0.0)
    total_volume_kg = Column(Float, default=0.0)
    avg_recovery_score = Column(Float, default=0.0)
    muscle_group_frequency = Column(JSON, default=dict) # e.g. {"chest": 2, "back": 2}
    exercise_variety_score = Column(Float, default=0.0)
    avg_sleep_hours = Column(Float, default=0.0)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MonthlyAggregate(Base):
    __tablename__ = "monthly_aggregates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    month = Column(Integer, nullable=False, index=True) # 1-12
    
    avg_workout_consistency_pct = Column(Float, default=0.0)
    total_volume_kg = Column(Float, default=0.0)
    avg_recovery_score = Column(Float, default=0.0)
    estimated_muscle_growth_index = Column(Float, default=0.0)
    estimated_fat_loss_progress = Column(Float, default=0.0)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MetricExplanation(Base):
    """
    Stores explainability payload for a given metric/date.
    e.g. why is consistency 92%?
    """
    __tablename__ = "metric_explanations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    metric_name = Column(String(64), nullable=False, index=True) # e.g. "workout_consistency"
    date_context = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    
    explanation_text = Column(Text, nullable=False)
    formula_components = Column(JSON, default=dict) # e.g. {"completed": 26, "skipped": 2, "timeframe": "last 30 days"}
    trend_direction = Column(String(16), default="neutral") # up, down, neutral
    trend_value = Column(Float, default=0.0) # e.g. +8.0
    confidence_pct = Column(Float, default=100.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
