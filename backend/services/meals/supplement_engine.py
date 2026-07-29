import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.models.models import DailySupplementLog, TemporalEvent
from backend.schemas.meals import SupplementCreate
from backend.schemas.temporal_event_system import (
    TemporalEventCreate, EventStatus, EventPriority, EventSource
)
from backend.services.temporal_event_system.service import TemporalEventService
from backend.services.meals.macro_calculator import compute_and_save_daily_summary

def get_supplement_logs(db: Session, user_id: int, date_str: str) -> List[DailySupplementLog]:
    return db.query(DailySupplementLog).filter(
        DailySupplementLog.user_id == user_id,
        DailySupplementLog.date == date_str
    ).order_by(DailySupplementLog.created_at.asc()).all()

def add_supplement_log(db: Session, user_id: int, data: SupplementCreate) -> DailySupplementLog:
    supp_id = f"supp_{int(datetime.utcnow().timestamp() * 1000)}_{uuid.uuid4().hex[:4]}"

    # Mirror to TES
    planned_start = datetime.utcnow()
    tes_data = TemporalEventCreate(
        title=f"Supplement: {data.name} ({data.dosage})",
        description=f"Timing: {data.timing} | Dosage: {data.dosage}",
        category="supplement",
        event_type="supplement_dose",
        status=EventStatus.SCHEDULED,
        priority=EventPriority.MEDIUM,
        source=EventSource.USER,
        planned_start_at=planned_start,
        duration_minutes=5,
        metadata_payload={
            "supplement_id": supp_id,
            "dosage": data.dosage,
            "timing": data.timing
        },
        tags=["supplement", data.name.lower()]
    )
    tes_event = TemporalEventService.create_event(db, user_id, tes_data)

    supp = DailySupplementLog(
        id=supp_id,
        user_id=user_id,
        date=data.date_str,
        name=data.name,
        dosage=data.dosage,
        timing=data.timing,
        scheduled_time=data.scheduled_time,
        status="pending",
        badge_emoji=data.badge_emoji,
        temporal_event_id=tes_event.id
    )
    db.add(supp)
    db.commit()
    db.refresh(supp)

    compute_and_save_daily_summary(db, user_id, data.date_str)
    return supp

def toggle_supplement_status(db: Session, user_id: int, date_str: str, supp_id: str) -> DailySupplementLog:
    supp = db.query(DailySupplementLog).filter(
        DailySupplementLog.id == supp_id,
        DailySupplementLog.user_id == user_id
    ).first()

    if not supp:
        raise HTTPException(status_code=404, detail=f"Supplement log '{supp_id}' not found.")

    target_status = "pending" if supp.status == "completed" else "completed"
    supp.status = target_status
    if target_status == "completed":
        supp.completed_at = datetime.utcnow().strftime("%I:%M %p")
    else:
        supp.completed_at = None

    if supp.temporal_event_id:
        te = db.query(TemporalEvent).filter(TemporalEvent.id == supp.temporal_event_id).first()
        if te:
            te.status = EventStatus.COMPLETED.value if target_status == "completed" else EventStatus.SCHEDULED.value

    db.commit()
    db.refresh(supp)

    compute_and_save_daily_summary(db, user_id, date_str)
    return supp

def remove_supplement_log(db: Session, user_id: int, date_str: str, supp_id: str):
    supp = db.query(DailySupplementLog).filter(
        DailySupplementLog.id == supp_id,
        DailySupplementLog.user_id == user_id
    ).first()

    if not supp:
        raise HTTPException(status_code=404, detail=f"Supplement log '{supp_id}' not found.")

    if supp.temporal_event_id:
        te = db.query(TemporalEvent).filter(TemporalEvent.id == supp.temporal_event_id).first()
        if te:
            db.delete(te)

    db.delete(supp)
    db.commit()

    compute_and_save_daily_summary(db, user_id, date_str)
    return True
