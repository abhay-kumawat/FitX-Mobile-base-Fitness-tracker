from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Growth Tree (RPG Visualization) ---
class GrowthTreeStats(BaseModel):
    level: int
    strength_level: int
    endurance_level: int
    mobility_level: int
    nutrition_level: int
    recovery_level: int
    consistency_level: int
    mental_resilience_level: int
    discipline_level: int
    cardiovascular_health_level: int

class GrowthTreeResponse(BaseModel):
    stats: GrowthTreeStats
    message: str

# --- Body Measurement Tracking ---
class BodyMeasurementCreate(BaseModel):
    date: str
    weight_kg: Optional[float] = None
    body_fat_pct: Optional[float] = None
    lean_mass_kg: Optional[float] = None
    waist_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    shoulders_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    forearms_cm: Optional[float] = None
    neck_cm: Optional[float] = None
    thighs_cm: Optional[float] = None
    calves_cm: Optional[float] = None
    hips_cm: Optional[float] = None

class BodyMeasurementResponse(BodyMeasurementCreate):
    id: str
    user_id: int
    bmi: Optional[float] = None
    estimated_muscle_mass_kg: Optional[float] = None
    created_at: datetime

# --- Psychological Tracking ---
class PsychologicalLogCreate(BaseModel):
    date: str
    motivation: Optional[float] = None
    confidence: Optional[float] = None
    stress: Optional[float] = None
    mood: Optional[float] = None
    energy: Optional[float] = None
    workout_enjoyment: Optional[float] = None
    perceived_recovery: Optional[float] = None
    exercise_difficulty: Optional[float] = None
    training_anxiety: Optional[float] = None
    burnout_risk: Optional[float] = None
    consistency_mindset: Optional[float] = None
    notes: Optional[str] = None

class PsychologicalLogResponse(PsychologicalLogCreate):
    id: str
    user_id: int
    created_at: datetime

# --- Growth Lab Analytics Dashboard ---
class TrendData(BaseModel):
    date: str
    value: float

class AnalyticsDashboardResponse(BaseModel):
    workout_completion_pct: float
    workout_consistency_score: float
    exercise_frequency: Dict[str, int]
    volume_growth_trend: List[TrendData]
    recovery_trend: List[TrendData]
    energy_trend: List[TrendData]
    mood_trend: List[TrendData]
    plateau_risk: float
    overtraining_risk: float
    ai_confidence_score: float
    training_age_months: int

# --- Growth Timeline ---
class TimelineEvent(BaseModel):
    id: str
    date: str
    time: str
    type: str # workout, meal, measurement, psychological, ai_recommendation, achievement
    title: str
    description: str
    icon: str
    details: Dict[str, Any]

class TimelineResponse(BaseModel):
    events: List[TimelineEvent]

# --- AI Coach Intelligence ---
class AICoachRecommendationRequest(BaseModel):
    context: str # e.g. "Adjust based on soreness", "Generate next week's plan", "What should I change?"
    additional_notes: Optional[str] = None

class AICoachRecommendationResponse(BaseModel):
    recommendation_id: int
    message: str
    suggestion_data: Dict[str, Any]
    confidence_score: float
    evidence_sources: List[str] # Explanations based on RAG and data
    created_at: datetime
