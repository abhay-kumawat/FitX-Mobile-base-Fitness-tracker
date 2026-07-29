import uuid
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.models.models import ReminderRule, TemporalEvent
from backend.schemas.temporal_event_system import (
    TemporalEventCreate, EventStatus, EventPriority, EventSource
)
from backend.services.temporal_event_system.service import TemporalEventService

DEFAULT_REMINDERS = [
    {"id": "n1", "title": "Breakfast & Morning Water Target", "time_str": "08:00 AM", "enabled": True, "reminder_type": "meal"},
    {"id": "n2", "title": "Mid-day Hydration Checkpoint (1.5L)", "time_str": "12:30 PM", "enabled": True, "reminder_type": "water"},
    {"id": "n3", "title": "Pre-Workout Supplement & Protein Snack", "time_str": "04:30 PM", "enabled": True, "reminder_type": "supplement"},
    {"id": "n4", "title": "Dinner & Night Hydration Wrap-up", "time_str": "08:00 PM", "enabled": False, "reminder_type": "meal"}
]

def seed_default_reminders_if_empty(db: Session, user_id: int):
    count = db.query(ReminderRule).filter(ReminderRule.user_id == user_id).count()
    if count > 0:
        return

    for r in DEFAULT_REMINDERS:
        rule = ReminderRule(
            id=r["id"],
            user_id=user_id,
            title=r["title"],
            time_str=r["time_str"],
            enabled=r["enabled"],
            reminder_type=r["reminder_type"]
        )
        db.add(rule)
    db.commit()

def get_user_reminders(db: Session, user_id: int) -> List[ReminderRule]:
    seed_default_reminders_if_empty(db, user_id)
    return db.query(ReminderRule).filter(ReminderRule.user_id == user_id).all()

def toggle_reminder_rule(db: Session, user_id: int, reminder_id: str) -> ReminderRule:
    rule = db.query(ReminderRule).filter(
        ReminderRule.id == reminder_id,
        ReminderRule.user_id == user_id
    ).first()

    if not rule:
        raise HTTPException(status_code=404, detail=f"Reminder rule '{reminder_id}' not found.")

    rule.enabled = not rule.enabled
    db.commit()
    db.refresh(rule)
    return rule
