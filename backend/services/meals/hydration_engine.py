import uuid
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.models.models import DailyHydrationLog, DailyNutritionSummary, TemporalEvent
from backend.schemas.meals import HydrationLogCreate
from backend.schemas.temporal_event_system import (
    TemporalEventCreate, EventStatus, EventPriority, EventSource
)
from backend.services.temporal_event_system.service import TemporalEventService
from backend.services.meals.macro_calculator import compute_and_save_daily_summary

def get_hydration_logs(db: Session, user_id: int, date_str: str) -> List[DailyHydrationLog]:
    return db.query(DailyHydrationLog).filter(
        DailyHydrationLog.user_id == user_id,
        DailyHydrationLog.date == date_str
    ).order_by(DailyHydrationLog.created_at.asc()).all()

def add_hydration_log(db: Session, user_id: int, data: HydrationLogCreate) -> DailyHydrationLog:
    hyd_id = f"hyd_{int(datetime.utcnow().timestamp() * 1000)}_{uuid.uuid4().hex[:4]}"
    timestamp_str = datetime.utcnow().strftime("%I:%M %p")

    # Mirror to TES
    tes_data = TemporalEventCreate(
        title=f"Hydration: {data.volume_ml}ml {data.liquid_type}",
        description=f"Fluid intake: {data.liquid_type} ({data.volume_ml} ml)",
        category="hydration",
        event_type="water_log",
        status=EventStatus.COMPLETED,
        priority=EventPriority.LOW,
        source=EventSource.USER,
        planned_start_at=datetime.utcnow(),
        actual_start_at=datetime.utcnow(),
        actual_end_at=datetime.utcnow(),
        duration_minutes=5,
        metadata_payload={
            "hydration_id": hyd_id,
            "liquid_type": data.liquid_type,
            "volume_ml": data.volume_ml
        },
        tags=["hydration", data.liquid_type.lower()]
    )
    tes_event = TemporalEventService.create_event(db, user_id, tes_data)

    hyd_log = DailyHydrationLog(
        id=hyd_id,
        user_id=user_id,
        date=data.date_str,
        liquid_type=data.liquid_type,
        volume_ml=data.volume_ml,
        emoji=data.emoji,
        timestamp=timestamp_str,
        temporal_event_id=tes_event.id
    )
    db.add(hyd_log)
    db.commit()
    db.refresh(hyd_log)

    compute_and_save_daily_summary(db, user_id, data.date_str)
    return hyd_log

def remove_hydration_log(db: Session, user_id: int, date_str: str, hyd_id: str):
    hyd = db.query(DailyHydrationLog).filter(
        DailyHydrationLog.id == hyd_id,
        DailyHydrationLog.user_id == user_id
    ).first()

    if not hyd:
        raise HTTPException(status_code=404, detail=f"Hydration log '{hyd_id}' not found.")

    if hyd.temporal_event_id:
        te = db.query(TemporalEvent).filter(TemporalEvent.id == hyd.temporal_event_id).first()
        if te:
            db.delete(te)

    db.delete(hyd)
    db.commit()

    compute_and_save_daily_summary(db, user_id, date_str)
    return True

def update_daily_water_target(db: Session, user_id: int, date_str: str, target_water_ml: int):
    summary = db.query(DailyNutritionSummary).filter(
        DailyNutritionSummary.user_id == user_id,
        DailyNutritionSummary.date == date_str
    ).first()

    if summary:
        summary.target_water_ml = target_water_ml
        db.commit()
    else:
        compute_and_save_daily_summary(db, user_id, date_str)
        summary = db.query(DailyNutritionSummary).filter(
            DailyNutritionSummary.user_id == user_id,
            DailyNutritionSummary.date == date_str
        ).first()
        if summary:
            summary.target_water_ml = target_water_ml
            db.commit()
    return target_water_ml
