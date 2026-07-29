import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.models.models import TemporalEvent, EventRecurrenceRule, TemporalEventAudit
from backend.schemas.temporal_event_system import (
    TemporalEventCreate,
    TemporalEventUpdate,
    TemporalEventTransition,
    TimelineQueryFilter,
    UpdateScope,
    EventStatus,
    EventSource
)
from backend.services.temporal_event_system.engine.state_machine import StateMachineEngine
from backend.services.temporal_event_system.engine.recurrence import RecurrenceEngine
from backend.services.temporal_event_system.engine.timeline import TimelineQueryEngine
from backend.services.temporal_event_system.engine.audit import AuditEngine
from backend.services.temporal_event_system.engine.analytics_hooks import AnalyticsEngine

class TemporalEventService:
    """
    Unified Temporal Event System Service Facade
    Main entry point for creating, updating, transitioning, querying timeline,
    auditing, and synchronizing temporal events across FitX.
    """

    @classmethod
    def create_event(
        cls,
        db: Session,
        user_id: int,
        data: TemporalEventCreate
    ) -> TemporalEvent:
        duration = data.duration_minutes
        if not duration and data.planned_start_at and data.planned_end_at:
            duration = int((data.planned_end_at - data.planned_start_at).total_seconds() / 60.0)
        if not duration:
            duration = 30 # Default 30 mins

        planned_end = data.planned_end_at or (data.planned_start_at + timedelta(minutes=duration))

        event = TemporalEvent(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=data.title,
            description=data.description,
            category=data.category,
            event_type=data.event_type,
            status=data.status.value,
            priority=data.priority.value,
            source=data.source.value,
            source_id=data.source_id,
            planned_start_at=data.planned_start_at,
            planned_end_at=planned_end,
            actual_start_at=data.actual_start_at,
            actual_end_at=data.actual_end_at,
            is_all_day=data.is_all_day,
            duration_minutes=duration,
            timezone_name=data.timezone_name,
            timezone_offset_minutes=data.timezone_offset_minutes,
            metadata_payload=data.metadata_payload,
            tags=data.tags,
            version=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(event)
        db.flush()

        # Handle embedded Recurrence Rule
        if data.recurrence_rule:
            rule = EventRecurrenceRule(
                id=str(uuid.uuid4()),
                event_id=event.id,
                frequency=data.recurrence_rule.frequency.value,
                interval=data.recurrence_rule.interval,
                by_weekday=data.recurrence_rule.by_weekday,
                by_monthday=data.recurrence_rule.by_monthday,
                until_date=data.recurrence_rule.until_date,
                count=data.recurrence_rule.count,
                rrule_string=data.recurrence_rule.rrule_string,
                exception_dates=data.recurrence_rule.exception_dates,
                status="ACTIVE"
            )
            db.add(rule)
            db.flush()

        # Record Initial Audit Trail
        AuditEngine.record_audit(
            db=db,
            event_id=event.id,
            user_id=user_id,
            actor_type=data.source.value,
            actor_id=data.source_id or "user",
            action="CREATED",
            new_status=event.status,
            diff_payload={"title": event.title, "category": event.category}
        )

        db.commit()
        db.refresh(event)
        return event

    @classmethod
    def get_event(cls, db: Session, event_id: str, user_id: int) -> TemporalEvent:
        event = db.query(TemporalEvent).filter(
            TemporalEvent.id == event_id,
            TemporalEvent.user_id == user_id,
            TemporalEvent.is_deleted == False
        ).first()

        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Temporal event '{event_id}' not found."
            )
        return event

    @classmethod
    def update_event(
        cls,
        db: Session,
        event_id: str,
        user_id: int,
        data: TemporalEventUpdate
    ) -> TemporalEvent:
        # Handle virtual event update
        if event_id.startswith("virtual:"):
            parts = event_id.split(":")
            if len(parts) >= 3:
                master_id = parts[1]
                target_date_str = parts[2]
                master_event = cls.get_event(db, master_id, user_id)

                override_dict = data.model_dump(exclude_unset=True)
                materialized = RecurrenceEngine.materialize_single_instance(
                    db=db,
                    master_event=master_event,
                    target_date_str=target_date_str,
                    override_data=override_dict
                )
                AuditEngine.record_audit(
                    db=db,
                    event_id=materialized.id,
                    user_id=user_id,
                    actor_type="USER",
                    action="MATERIALIZED_VIRTUAL",
                    new_status=materialized.status,
                    diff_payload=override_dict
                )
                db.commit()
                db.refresh(materialized)
                return materialized

        event = cls.get_event(db, event_id, user_id)

        old_state = {
            "title": event.title,
            "planned_start_at": event.planned_start_at.isoformat() if event.planned_start_at else None,
            "priority": event.priority,
            "status": event.status
        }

        update_dict = data.model_dump(exclude_unset=True)
        scope = update_dict.pop("scope", UpdateScope.THIS_OCCURRENCE)
        update_dict.pop("target_date", None)

        rescheduled = False

        for field, val in update_dict.items():
            if val is not None and hasattr(event, field):
                if field == "planned_start_at":
                    rescheduled = True
                if field in ("priority", "status") and hasattr(val, "value"):
                    setattr(event, field, val.value)
                else:
                    setattr(event, field, val)

        event.version += 1
        event.updated_at = datetime.utcnow()

        new_state = {
            "title": event.title,
            "planned_start_at": event.planned_start_at.isoformat() if event.planned_start_at else None,
            "priority": event.priority,
            "status": event.status
        }

        diff = AuditEngine.compute_diff(old_state, new_state)

        AuditEngine.record_audit(
            db=db,
            event_id=event.id,
            user_id=user_id,
            actor_type="USER",
            action="RESCHEDULED" if rescheduled else "METADATA_MUTATED",
            previous_status=old_state["status"],
            new_status=new_state["status"],
            diff_payload=diff
        )

        db.commit()
        db.refresh(event)
        return event

    @classmethod
    def transition_event_status(
        cls,
        db: Session,
        event_id: str,
        user_id: int,
        transition: TemporalEventTransition
    ) -> TemporalEvent:
        # Handle virtual event transition (materialize on demand)
        if event_id.startswith("virtual:"):
            parts = event_id.split(":")
            if len(parts) >= 3:
                master_id = parts[1]
                target_date_str = parts[2]
                master_event = cls.get_event(db, master_id, user_id)
                event = RecurrenceEngine.materialize_single_instance(
                    db=db,
                    master_event=master_event,
                    target_date_str=target_date_str,
                    override_data={}
                )
            else:
                raise HTTPException(status_code=400, detail="Invalid virtual event ID format.")
        else:
            event = cls.get_event(db, event_id, user_id)

        prev_status, new_status, state_diff = StateMachineEngine.apply_transition(event, transition)

        AuditEngine.record_audit(
            db=db,
            event_id=event.id,
            user_id=user_id,
            actor_type=transition.actor_type.value,
            actor_id=transition.actor_id or "user",
            action="STATUS_CHANGED",
            previous_status=prev_status,
            new_status=new_status,
            diff_payload=state_diff
        )

        db.commit()
        db.refresh(event)
        return event

    @classmethod
    def delete_event(cls, db: Session, event_id: str, user_id: int) -> bool:
        if event_id.startswith("virtual:"):
            parts = event_id.split(":")
            if len(parts) >= 3:
                master_id = parts[1]
                target_date_str = parts[2]
                master_event = cls.get_event(db, master_id, user_id)
                if master_event.recurrence_rule:
                    exceptions = list(master_event.recurrence_rule.exception_dates or [])
                    if target_date_str not in exceptions:
                        exceptions.append(target_date_str)
                        master_event.recurrence_rule.exception_dates = exceptions
                        db.commit()
                return True

        event = cls.get_event(db, event_id, user_id)
        event.is_deleted = True
        event.deleted_at = datetime.utcnow()
        event.version += 1

        AuditEngine.record_audit(
            db=db,
            event_id=event.id,
            user_id=user_id,
            actor_type="USER",
            action="SOFT_DELETED",
            previous_status=event.status,
            new_status="DELETED",
            diff_payload={"deleted_at": event.deleted_at.isoformat()}
        )

        db.commit()
        return True

    @classmethod
    def get_timeline(
        cls,
        db: Session,
        user_id: int,
        filters: TimelineQueryFilter
    ) -> Dict[str, Any]:
        return TimelineQueryEngine.query_timeline(db, user_id, filters)

    @classmethod
    def get_analytics_summary(
        cls,
        db: Session,
        user_id: int,
        lookback_days: int = 30
    ) -> Dict[str, Any]:
        return AnalyticsEngine.compute_user_analytics(db, user_id, lookback_days)

    @classmethod
    def get_audit_history(
        cls,
        db: Session,
        event_id: str,
        user_id: int
    ) -> List[TemporalEventAudit]:
        # Verify event ownership
        cls.get_event(db, event_id, user_id)
        return db.query(TemporalEventAudit).filter(
            TemporalEventAudit.event_id == event_id,
            TemporalEventAudit.user_id == user_id
        ).order_by(TemporalEventAudit.timestamp.desc()).all()

    @classmethod
    def get_sync_updates(
        cls,
        db: Session,
        user_id: int,
        last_sync_at: datetime
    ) -> Dict[str, Any]:
        updated_events = db.query(TemporalEvent).filter(
            TemporalEvent.user_id == user_id,
            TemporalEvent.updated_at >= last_sync_at
        ).all()

        return {
            "last_sync_at": datetime.utcnow(),
            "total_count": len(updated_events),
            "events": updated_events
        }
