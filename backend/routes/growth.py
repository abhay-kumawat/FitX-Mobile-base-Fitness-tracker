from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from backend.core.database import get_db
from backend.services.analytics.growth_service import GrowthService
from backend.services.analytics.muscle_growth_engine import calculate_muscle_metrics, get_ai_muscle_recommendation
from backend.schemas.growth import (
    GrowthTreeResponse, AnalyticsDashboardResponse, TimelineResponse,
    BodyMeasurementCreate, BodyMeasurementResponse,
    PsychologicalLogCreate, PsychologicalLogResponse
)
from backend.models.models import BodyMeasurementLog, PsychologicalLog
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/growth", tags=["Growth Intelligence"])

@router.get("/tree", response_model=GrowthTreeResponse)
def get_growth_tree(user_id: int, db: Session = Depends(get_db)):
    service = GrowthService(db)
    return service.get_growth_tree(user_id)

@router.get("/analytics", response_model=AnalyticsDashboardResponse)
def get_analytics_dashboard(user_id: int, db: Session = Depends(get_db)):
    service = GrowthService(db)
    return service.get_analytics_dashboard(user_id)

@router.get("/muscle-analytics")
def get_muscle_analytics(user_id: int = 1, db: Session = Depends(get_db)):
    metrics = calculate_muscle_metrics(db, user_id)
    # Add AI recommendations
    for m, data in metrics.items():
        data["ai_recommendation"] = get_ai_muscle_recommendation(m, data)
    return metrics

@router.get("/timeline", response_model=TimelineResponse)
def get_timeline(user_id: int, date: Optional[str] = Query(None, description="YYYY-MM-DD filter"), db: Session = Depends(get_db)):
    service = GrowthService(db)
    return service.get_timeline(user_id, date)

@router.post("/measurements", response_model=BodyMeasurementResponse)
def create_body_measurement(user_id: int, data: BodyMeasurementCreate, db: Session = Depends(get_db)):
    new_log = BodyMeasurementLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        date=data.date,
        weight_kg=data.weight_kg,
        body_fat_pct=data.body_fat_pct,
        lean_mass_kg=data.lean_mass_kg,
        waist_cm=data.waist_cm,
        chest_cm=data.chest_cm,
        shoulders_cm=data.shoulders_cm,
        arms_cm=data.arms_cm,
        forearms_cm=data.forearms_cm,
        neck_cm=data.neck_cm,
        thighs_cm=data.thighs_cm,
        calves_cm=data.calves_cm,
        hips_cm=data.hips_cm
    )
    # Basic BMI calc
    if new_log.weight_kg:
        # We need height, assuming 1.75m for now as fallback
        new_log.bmi = new_log.weight_kg / (1.75 ** 2)
        
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.post("/psychological", response_model=PsychologicalLogResponse)
def create_psychological_log(user_id: int, data: PsychologicalLogCreate, db: Session = Depends(get_db)):
    new_log = PsychologicalLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        date=data.date,
        motivation=data.motivation,
        confidence=data.confidence,
        stress=data.stress,
        mood=data.mood,
        energy=data.energy,
        workout_enjoyment=data.workout_enjoyment,
        perceived_recovery=data.perceived_recovery,
        exercise_difficulty=data.exercise_difficulty,
        training_anxiety=data.training_anxiety,
        burnout_risk=data.burnout_risk,
        consistency_mindset=data.consistency_mindset,
        notes=data.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
