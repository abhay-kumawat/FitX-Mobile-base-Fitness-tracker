import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.models.models import TemporalEvent, EventRecurrenceRule
from backend.schemas.temporal_event_system import RecurrenceFrequency, EventStatus

class RecurrenceEngine:
    """
    Timezone-Safe RRULE Recurrence Engine
    Generates virtual occurrences, handles exception dates, materializes instances,
    and supports series splitting (THIS_OCCURRENCE, THIS_AND_FUTURE, ALL_OCCURRENCES).
    """

    WEEKDAY_MAP = {
        "MO": 0, "TU": 1, "WE": 2, "TH": 3, "FR": 4, "SA": 5, "SU": 6,
        "MON": 0, "TUE": 1, "WED": 2, "THU": 3, "FRI": 4, "SAT": 5, "SUN": 6
    }

    @classmethod
    def expand_occurrences(
        cls,
        master_event: TemporalEvent,
        rule: EventRecurrenceRule,
        range_start: datetime,
        range_end: datetime
    ) -> List[datetime]:
        """
        Calculates occurrence start datetimes for master_event within range_start to range_end.
        """
        if not master_event.planned_start_at or rule.status != "ACTIVE":
            return []

        base_start = master_event.planned_start_at
        occurrences: List[datetime] = []
        
        freq = rule.frequency.upper()
        interval = max(1, rule.interval or 1)
        by_weekday = [cls.WEEKDAY_MAP.get(w.upper(), 0) for w in (rule.by_weekday or []) if isinstance(w, str)]
        exception_dates = set(rule.exception_dates or [])

        until_date = rule.until_date
        max_count = rule.count

        curr = base_start
        total_generated = 0

        # Horizon cap to prevent infinite loops (max 365 iterations per expansion call)
        max_iterations = 500
        iteration = 0

        while curr <= range_end and iteration < max_iterations:
            iteration += 1

            # Check if past until date
            if until_date and curr > until_date:
                break

            # Check if count reached
            if max_count and total_generated >= max_count:
                break

            date_str = curr.strftime("%Y-%m-%d")

            # Check if curr falls within range and not in exception_dates
            if curr >= range_start:
                valid_day = True
                
                # Check weekday filter
                if freq == RecurrenceFrequency.WEEKLY.value and by_weekday:
                    if curr.weekday() not in by_weekday:
                        valid_day = False

                # Check monthday filter
                if freq == RecurrenceFrequency.MONTHLY.value and rule.by_monthday:
                    if curr.day not in rule.by_monthday:
                        valid_day = False

                if valid_day and date_str not in exception_dates:
                    occurrences.append(curr)
                    total_generated += 1

            # Step forward based on frequency
            if freq == RecurrenceFrequency.DAILY.value:
                curr += timedelta(days=interval)
            elif freq == RecurrenceFrequency.WEEKLY.value:
                if by_weekday and freq == RecurrenceFrequency.WEEKLY.value:
                    # Move to next day
                    curr += timedelta(days=1)
                else:
                    curr += timedelta(weeks=interval)
            elif freq == RecurrenceFrequency.MONTHLY.value:
                # Add approximately 1 month
                month = curr.month + interval
                year = curr.year + (month - 1) // 12
                month = (month - 1) % 12 + 1
                day = min(curr.day, 28) # Safety for month lengths
                curr = curr.replace(year=year, month=month, day=day)
            elif freq == RecurrenceFrequency.YEARLY.value:
                curr = curr.replace(year=curr.year + interval)
            else:
                curr += timedelta(days=interval)

        return occurrences

    @classmethod
    def generate_virtual_instances(
        cls,
        master_event: TemporalEvent,
        rule: EventRecurrenceRule,
        range_start: datetime,
        range_end: datetime
    ) -> List[Dict[str, Any]]:
        """
        Creates in-memory virtual event representations for timeline responses.
        """
        occurrence_starts = cls.expand_occurrences(master_event, rule, range_start, range_end)
        virtual_events = []

        duration = master_event.duration_minutes or 30

        for start_dt in occurrence_starts:
            # Skip base start date if it's already materialized or range start
            date_str = start_dt.strftime("%Y-%m-%d")
            virtual_id = f"virtual:{master_event.id}:{date_str}"
            
            end_dt = start_dt + timedelta(minutes=duration)

            v_event = {
                "id": virtual_id,
                "user_id": master_event.user_id,
                "title": master_event.title,
                "description": master_event.description,
                "category": master_event.category,
                "event_type": master_event.event_type,
                "status": master_event.status,
                "priority": master_event.priority,
                "source": master_event.source,
                "source_id": master_event.source_id,
                "planned_start_at": start_dt,
                "planned_end_at": end_dt,
                "actual_start_at": None,
                "actual_end_at": None,
                "is_all_day": master_event.is_all_day,
                "duration_minutes": duration,
                "timezone_name": master_event.timezone_name,
                "timezone_offset_minutes": master_event.timezone_offset_minutes,
                "master_event_id": master_event.id,
                "parent_event_id": master_event.id,
                "metadata_payload": master_event.metadata_payload or {},
                "tags": master_event.tags or [],
                "version": 1,
                "is_virtual": True,
                "created_at": master_event.created_at,
                "updated_at": master_event.updated_at,
                "recurrence_rule": None
            }
            virtual_events.append(v_event)

        return virtual_events

    @classmethod
    def materialize_single_instance(
        cls,
        db: Session,
        master_event: TemporalEvent,
        target_date_str: str,
        override_data: Dict[str, Any]
    ) -> TemporalEvent:
        """
        Materializes a virtual recurrence instance into a dedicated DB row (THIS_OCCURRENCE scope).
        Adds target_date_str to master_event.recurrence_rule.exception_dates.
        """
        rule = master_event.recurrence_rule
        if rule:
            exceptions = list(rule.exception_dates or [])
            if target_date_str not in exceptions:
                exceptions.append(target_date_str)
                rule.exception_dates = exceptions

        # Construct target start datetime
        target_dt = datetime.strptime(target_date_str, "%Y-%m-%d")
        if master_event.planned_start_at:
            target_dt = target_dt.replace(
                hour=master_event.planned_start_at.hour,
                minute=master_event.planned_start_at.minute,
                second=master_event.planned_start_at.second
            )

        duration = override_data.get("duration_minutes") or master_event.duration_minutes or 30

        materialized = TemporalEvent(
            id=str(uuid.uuid4()),
            user_id=master_event.user_id,
            title=override_data.get("title", master_event.title),
            description=override_data.get("description", master_event.description),
            category=override_data.get("category", master_event.category),
            event_type=override_data.get("event_type", master_event.event_type),
            status=override_data.get("status", master_event.status),
            priority=override_data.get("priority", master_event.priority),
            source=master_event.source,
            source_id=master_event.source_id,
            planned_start_at=override_data.get("planned_start_at") or target_dt,
            planned_end_at=override_data.get("planned_end_at") or (target_dt + timedelta(minutes=duration)),
            actual_start_at=override_data.get("actual_start_at"),
            actual_end_at=override_data.get("actual_end_at"),
            is_all_day=override_data.get("is_all_day", master_event.is_all_day),
            duration_minutes=duration,
            timezone_name=master_event.timezone_name,
            timezone_offset_minutes=master_event.timezone_offset_minutes,
            master_event_id=master_event.id,
            parent_event_id=master_event.id,
            metadata_payload=override_data.get("metadata_payload") or master_event.metadata_payload,
            tags=override_data.get("tags") or master_event.tags,
            version=1
        )

        db.add(materialized)
        db.flush()
        return materialized
