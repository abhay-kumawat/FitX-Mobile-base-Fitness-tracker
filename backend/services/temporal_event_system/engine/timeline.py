from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from backend.models.models import TemporalEvent, EventRecurrenceRule
from backend.schemas.temporal_event_system import TimelineQueryFilter, EventStatus
from backend.services.temporal_event_system.engine.recurrence import RecurrenceEngine

class TimelineQueryEngine:
    """
    Timeline Query Engine
    Assembles chronological timeline views by merging database materialized events
    with virtually expanded recurring instances.
    """

    @classmethod
    def query_timeline(
        cls,
        db: Session,
        user_id: int,
        filters: TimelineQueryFilter
    ) -> Dict[str, Any]:
        start_dt = filters.start_date
        end_dt = filters.end_date

        # 1. Fetch Materialized Events from DB
        query = db.query(TemporalEvent).filter(
            TemporalEvent.user_id == user_id,
            TemporalEvent.is_deleted == False,
            or_(
                and_(
                    TemporalEvent.planned_start_at >= start_dt,
                    TemporalEvent.planned_start_at <= end_dt
                ),
                and_(
                    TemporalEvent.actual_start_at >= start_dt,
                    TemporalEvent.actual_start_at <= end_dt
                )
            )
        )

        if filters.categories:
            query = query.filter(TemporalEvent.category.in_(filters.categories))
        if filters.event_types:
            query = query.filter(TemporalEvent.event_type.in_(filters.event_types))
        if filters.statuses:
            status_vals = [s.value if hasattr(s, "value") else s for s in filters.statuses]
            query = query.filter(TemporalEvent.status.in_(status_vals))
        if filters.priorities:
            prio_vals = [p.value if hasattr(p, "value") else p for p in filters.priorities]
            query = query.filter(TemporalEvent.priority.in_(prio_vals))

        materialized_events = query.order_by(TemporalEvent.planned_start_at.asc()).all()

        events_list: List[Dict[str, Any]] = []
        materialized_keys = set() # Set of (master_event_id, date_str) to avoid duplicate virtuals

        for m_ev in materialized_events:
            rec_rule = None
            if m_ev.recurrence_rule:
                rec_rule = {
                    "id": m_ev.recurrence_rule.id,
                    "event_id": m_ev.recurrence_rule.event_id,
                    "frequency": m_ev.recurrence_rule.frequency,
                    "interval": m_ev.recurrence_rule.interval,
                    "by_weekday": m_ev.recurrence_rule.by_weekday or [],
                    "by_monthday": m_ev.recurrence_rule.by_monthday or [],
                    "until_date": m_ev.recurrence_rule.until_date,
                    "count": m_ev.recurrence_rule.count,
                    "rrule_string": m_ev.recurrence_rule.rrule_string,
                    "exception_dates": m_ev.recurrence_rule.exception_dates or [],
                    "status": m_ev.recurrence_rule.status,
                    "created_at": m_ev.recurrence_rule.created_at,
                    "updated_at": m_ev.recurrence_rule.updated_at
                }

            ev_dict = {
                "id": m_ev.id,
                "user_id": m_ev.user_id,
                "title": m_ev.title,
                "description": m_ev.description,
                "category": m_ev.category,
                "event_type": m_ev.event_type,
                "status": m_ev.status,
                "priority": m_ev.priority,
                "source": m_ev.source,
                "source_id": m_ev.source_id,
                "planned_start_at": m_ev.planned_start_at,
                "planned_end_at": m_ev.planned_end_at,
                "actual_start_at": m_ev.actual_start_at,
                "actual_end_at": m_ev.actual_end_at,
                "is_all_day": m_ev.is_all_day,
                "duration_minutes": m_ev.duration_minutes,
                "timezone_name": m_ev.timezone_name,
                "timezone_offset_minutes": m_ev.timezone_offset_minutes,
                "master_event_id": m_ev.master_event_id,
                "parent_event_id": m_ev.parent_event_id,
                "metadata_payload": m_ev.metadata_payload or {},
                "tags": m_ev.tags or [],
                "version": m_ev.version,
                "is_virtual": False,
                "created_at": m_ev.created_at,
                "updated_at": m_ev.updated_at,
                "recurrence_rule": rec_rule
            }
            events_list.append(ev_dict)

            if m_ev.master_event_id and m_ev.planned_start_at:
                date_str = m_ev.planned_start_at.strftime("%Y-%m-%d")
                materialized_keys.add((m_ev.master_event_id, date_str))

        virtual_count = 0

        # 2. Virtual RRULE Expansion (if enabled)
        if filters.include_virtual:
            master_events_query = db.query(TemporalEvent).join(
                EventRecurrenceRule, TemporalEvent.id == EventRecurrenceRule.event_id
            ).filter(
                TemporalEvent.user_id == user_id,
                TemporalEvent.is_deleted == False,
                EventRecurrenceRule.status == "ACTIVE"
            )

            if filters.categories:
                master_events_query = master_events_query.filter(TemporalEvent.category.in_(filters.categories))

            master_events = master_events_query.all()

            for master in master_events:
                if not master.recurrence_rule:
                    continue
                v_instances = RecurrenceEngine.generate_virtual_instances(
                    master_event=master,
                    rule=master.recurrence_rule,
                    range_start=start_dt,
                    range_end=end_dt
                )
                for v_inst in v_instances:
                    start_p = v_inst.get("planned_start_at")
                    if start_p:
                        date_str = start_p.strftime("%Y-%m-%d")
                        # Deduplicate if already materialized in DB
                        if (master.id, date_str) in materialized_keys:
                            continue

                    # Filter virtual instances by status/priority if requested
                    if filters.statuses:
                        status_str_vals = [s.value if hasattr(s, "value") else s for s in filters.statuses]
                        if v_inst["status"] not in status_str_vals:
                            continue

                    events_list.append(v_inst)
                    virtual_count += 1

        # 3. Sort Chronologically
        events_list.sort(key=lambda x: x.get("planned_start_at") or datetime.min)

        # 4. Compute Status Breakdown
        status_breakdown: Dict[str, int] = {}
        for ev in events_list:
            st = ev["status"]
            status_breakdown[st] = status_breakdown.get(st, 0) + 1

        return {
            "start_date": start_dt,
            "end_date": end_dt,
            "total_events": len(events_list),
            "materialized_count": len(events_list) - virtual_count,
            "virtual_count": virtual_count,
            "status_breakdown": status_breakdown,
            "events": events_list
        }
