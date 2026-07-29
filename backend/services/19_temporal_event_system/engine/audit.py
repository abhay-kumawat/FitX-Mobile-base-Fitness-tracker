import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.models.models import TemporalEventAudit

class AuditEngine:
    """
    Immutable Audit Logging & Diff Tracking Engine
    Records historical state transitions, reschedule events, metadata mutations,
    and series splitting actions for retrospective AI analysis.
    """

    @classmethod
    def record_audit(
        cls,
        db: Session,
        event_id: str,
        user_id: int,
        actor_type: str,
        action: str,
        actor_id: Optional[str] = None,
        previous_status: Optional[str] = None,
        new_status: Optional[str] = None,
        diff_payload: Optional[Dict[str, Any]] = None
    ) -> TemporalEventAudit:
        audit_record = TemporalEventAudit(
            id=str(uuid.uuid4()),
            event_id=event_id,
            user_id=user_id,
            actor_type=actor_type,
            actor_id=actor_id or "system",
            action=action,
            previous_status=previous_status,
            new_status=new_status,
            diff_payload=diff_payload or {},
            timestamp=datetime.utcnow()
        )
        db.add(audit_record)
        db.flush()
        return audit_record

    @classmethod
    def compute_diff(cls, old_data: Dict[str, Any], new_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes dictionary delta between old and new state dictionaries.
        """
        diff: Dict[str, Any] = {}
        for key, new_val in new_data.items():
            if key not in old_data:
                diff[key] = {"old": None, "new": new_val}
            elif old_data[key] != new_val:
                diff[key] = {"old": old_data[key], "new": new_val}
        return diff
