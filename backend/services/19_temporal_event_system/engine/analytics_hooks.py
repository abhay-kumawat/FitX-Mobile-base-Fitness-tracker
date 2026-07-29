from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session

from backend.models.models import TemporalEvent
from backend.schemas.temporal_event_system import EventStatus

class AnalyticsEngine:
    """
    Analytics & Prediction Engine Hooks
    Exposes computational feature extractors for AI models, streak tracking,
    adherence velocity, fatigue/overtraining risk metrics, and goal compliance.
    """

    @classmethod
    def compute_user_analytics(
        cls,
        db: Session,
        user_id: int,
        lookback_days: int = 30
    ) -> Dict[str, Any]:
        now = datetime.utcnow()
        start_cutoff = now - timedelta(days=lookback_days)

        events = db.query(TemporalEvent).filter(
            TemporalEvent.user_id == user_id,
            TemporalEvent.is_deleted == False,
            TemporalEvent.planned_start_at >= start_cutoff
        ).all()

        total_scheduled = 0
        total_completed = 0
        total_missed = 0
        total_skipped = 0

        category_counts: Dict[str, int] = {}

        for ev in events:
            st = ev.status
            cat = ev.category
            category_counts[cat] = category_counts.get(cat, 0) + 1

            if st == EventStatus.COMPLETED.value:
                total_completed += 1
            elif st == EventStatus.MISSED.value:
                total_missed += 1
            elif st == EventStatus.SKIPPED.value:
                total_skipped += 1
            elif st in (EventStatus.SCHEDULED.value, EventStatus.PENDING.value, EventStatus.ACTIVE.value):
                total_scheduled += 1

        total_actionable = total_completed + total_missed + total_skipped
        adherence_ratio = (total_completed / total_actionable) if total_actionable > 0 else 1.0

        # Compute Streak Days
        current_streak = cls._calculate_current_streak(db, user_id)

        # Compute Overtraining Risk Score (0.0 to 100.0)
        overtraining_risk = cls._compute_overtraining_risk(events)

        # Compute Goal Risk Index (0.0 to 100.0)
        goal_risk = cls._compute_goal_risk(events)

        consistency_score = round(min(100.0, (adherence_ratio * 70.0) + (min(current_streak, 14) * 2.14)), 2)

        return {
            "user_id": user_id,
            "total_scheduled": total_scheduled,
            "total_completed": total_completed,
            "total_missed": total_missed,
            "total_skipped": total_skipped,
            "adherence_ratio": round(adherence_ratio, 4),
            "consistency_score": consistency_score,
            "current_streak_days": current_streak,
            "overtraining_risk_score": round(overtraining_risk, 2),
            "goal_risk_index": round(goal_risk, 2),
            "category_distribution": category_counts
        }

    @classmethod
    def _calculate_current_streak(cls, db: Session, user_id: int) -> int:
        now = datetime.utcnow()
        streak = 0
        curr_day = now.date()

        while True:
            day_start = datetime.combine(curr_day, datetime.min.time())
            day_end = datetime.combine(curr_day, datetime.max.time())

            completed_count = db.query(TemporalEvent).filter(
                TemporalEvent.user_id == user_id,
                TemporalEvent.is_deleted == False,
                TemporalEvent.status == EventStatus.COMPLETED.value,
                TemporalEvent.actual_end_at >= day_start,
                TemporalEvent.actual_end_at <= day_end
            ).count()

            if completed_count > 0:
                streak += 1
                curr_day -= timedelta(days=1)
            else:
                # If today hasn't ended yet and no completions yet today, check yesterday
                if curr_day == now.date():
                    curr_day -= timedelta(days=1)
                    continue
                break

            if streak > 365:
                break # Safety limit

        return streak

    @classmethod
    def _compute_overtraining_risk(cls, events: list) -> float:
        workout_events = [e for e in events if e.category == "workout"]
        if not workout_events:
            return 0.0

        total_actual_minutes = sum([e.duration_minutes or 0 for e in workout_events if e.status == EventStatus.COMPLETED.value])
        total_planned_minutes = sum([e.duration_minutes or 45 for e in workout_events])

        if total_planned_minutes == 0:
            return 0.0

        ratio = total_actual_minutes / total_planned_minutes
        if ratio > 1.5:
            return min(100.0, (ratio - 1.0) * 100.0)
        return max(0.0, (ratio - 1.0) * 50.0)

    @classmethod
    def _compute_goal_risk(cls, events: list) -> float:
        goal_events = [e for e in events if e.category in ("goal", "achievement", "milestone")]
        if not goal_events:
            return 10.0 # Low baseline

        missed = len([e for e in goal_events if e.status == EventStatus.MISSED.value])
        return round((missed / len(goal_events)) * 100.0, 2)
