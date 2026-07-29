from datetime import datetime
from typing import Dict, Set, Optional, Tuple, Any
from sqlalchemy.orm import Session

from backend.models.models import TemporalEvent
from backend.schemas.temporal_event_system import EventStatus, TemporalEventTransition

class StateMachineEngine:
    """
    Event Lifecycle State Machine Engine
    Controls valid state transitions, state callbacks, timestamp updates,
    and transition validations for Temporal Events.
    """

    # Comprehensive State Transition Matrix
    VALID_TRANSITIONS: Dict[str, Set[str]] = {
        EventStatus.DRAFT.value: {
            EventStatus.SCHEDULED.value,
            EventStatus.CANCELLED.value,
        },
        EventStatus.SCHEDULED.value: {
            EventStatus.PENDING.value,
            EventStatus.ACTIVE.value,
            EventStatus.COMPLETED.value,
            EventStatus.SKIPPED.value,
            EventStatus.CANCELLED.value,
            EventStatus.MISSED.value,
            EventStatus.EXPIRED.value,
            EventStatus.ARCHIVED.value,
        },
        EventStatus.PENDING.value: {
            EventStatus.ACTIVE.value,
            EventStatus.COMPLETED.value,
            EventStatus.MISSED.value,
            EventStatus.SKIPPED.value,
            EventStatus.CANCELLED.value,
            EventStatus.EXPIRED.value,
        },
        EventStatus.ACTIVE.value: {
            EventStatus.COMPLETED.value,
            EventStatus.SKIPPED.value,
            EventStatus.CANCELLED.value,
        },
        EventStatus.MISSED.value: {
            EventStatus.COMPLETED.value, # Late completion
            EventStatus.SKIPPED.value,
            EventStatus.ARCHIVED.value,
        },
        EventStatus.SKIPPED.value: {
            EventStatus.SCHEDULED.value, # Unskip/re-plan
            EventStatus.ARCHIVED.value,
        },
        EventStatus.CANCELLED.value: {
            EventStatus.DRAFT.value,
            EventStatus.SCHEDULED.value,
            EventStatus.ARCHIVED.value,
        },
        EventStatus.EXPIRED.value: {
            EventStatus.SCHEDULED.value,
            EventStatus.ARCHIVED.value,
        },
        EventStatus.COMPLETED.value: {
            EventStatus.ARCHIVED.value,
        },
        EventStatus.ARCHIVED.value: set() # Terminal state
    }

    @classmethod
    def can_transition(cls, current_status: str, target_status: str) -> bool:
        if current_status == target_status:
            return True
        allowed = cls.VALID_TRANSITIONS.get(current_status, set())
        return target_status in allowed

    @classmethod
    def validate_transition(cls, current_status: str, target_status: str) -> None:
        if not cls.can_transition(current_status, target_status):
            raise ValueError(
                f"Invalid state transition from '{current_status}' to '{target_status}'. "
                f"Allowed transitions from '{current_status}': {list(cls.VALID_TRANSITIONS.get(current_status, []))}"
            )

    @classmethod
    def apply_transition(
        cls,
        event: TemporalEvent,
        transition: TemporalEventTransition
    ) -> Tuple[str, str, Dict[str, Any]]:
        """
        Applies state transition to TemporalEvent in memory, updating timestamps
        and state metadata. Returns (previous_status, new_status, state_diff).
        """
        previous_status = event.status
        target_status = transition.target_status.value

        cls.validate_transition(previous_status, target_status)

        now = datetime.utcnow()
        state_diff: Dict[str, Any] = {
            "previous_status": previous_status,
            "new_status": target_status,
            "reason": transition.reason,
            "timestamp": now.isoformat()
        }

        # Handle specific state side-effects
        if target_status == EventStatus.ACTIVE.value:
            start_time = transition.actual_start_at or now
            event.actual_start_at = start_time
            state_diff["actual_start_at"] = start_time.isoformat()

        elif target_status == EventStatus.COMPLETED.value:
            end_time = transition.actual_end_at or now
            event.actual_end_at = end_time
            state_diff["actual_end_at"] = end_time.isoformat()
            
            if not event.actual_start_at:
                # Default start time if not previously set
                event.actual_start_at = event.planned_start_at or end_time
                state_diff["actual_start_at"] = event.actual_start_at.isoformat()
                
            if event.actual_start_at and event.actual_end_at:
                delta = (event.actual_end_at - event.actual_start_at).total_seconds() / 60.0
                event.duration_minutes = max(1, int(delta))
                state_diff["duration_minutes"] = event.duration_minutes

        # Update event model fields
        event.status = target_status
        event.version += 1
        event.updated_at = now

        if transition.additional_metadata:
            if not event.metadata_payload:
                event.metadata_payload = {}
            event.metadata_payload.update(transition.additional_metadata)
            state_diff["added_metadata"] = transition.additional_metadata

        return previous_status, target_status, state_diff
