from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.models import User
from backend.schemas.temporal_event_system import (
    TemporalEventCreate,
    TemporalEventUpdate,
    TemporalEventTransition,
    TemporalEventResponse,
    TemporalEventAuditResponse,
    TimelineQueryFilter,
    TimelineSliceResponse,
    AnalyticsSummaryResponse,
    EventStatus,
    EventPriority
)
from backend.services.temporal_event_system.service import TemporalEventService


router = APIRouter(prefix="/temporal-events", tags=["Temporal Event System (TES)"])


@router.post("", response_model=TemporalEventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: TemporalEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new Temporal Event (single or recurring master).
    """
    event = TemporalEventService.create_event(db, current_user.id, payload)
    return event


@router.get("/timeline", response_model=TimelineSliceResponse)
def get_timeline(
    start_date: Optional[datetime] = Query(None, description="Start date window (ISO-8601)"),
    end_date: Optional[datetime] = Query(None, description="End date window (ISO-8601)"),
    categories: Optional[List[str]] = Query(None),
    event_types: Optional[List[str]] = Query(None),
    statuses: Optional[List[EventStatus]] = Query(None),
    priorities: Optional[List[EventPriority]] = Query(None),
    include_virtual: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch chronological timeline slice with virtual RRULE expansion and materialized deduplication.
    """
    now = datetime.utcnow()
    s_dt = start_date or (now - timedelta(days=7))
    e_dt = end_date or (now + timedelta(days=14))

    filters = TimelineQueryFilter(
        start_date=s_dt,
        end_date=e_dt,
        categories=categories,
        event_types=event_types,
        statuses=statuses,
        priorities=priorities,
        include_virtual=include_virtual,
        page=page,
        page_size=page_size
    )

    timeline_data = TemporalEventService.get_timeline(db, current_user.id, filters)
    return timeline_data


@router.get("/analytics/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    lookback_days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Extract AI predictive features, adherence ratio, consistency score, and risk metrics.
    """
    summary = TemporalEventService.get_analytics_summary(db, current_user.id, lookback_days)
    return summary


@router.get("/sync", response_model=Dict[str, Any])
def sync_events(
    last_sync_at: datetime = Query(..., description="Last client sync timestamp"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Incremental offline sync endpoint for mobile applications.
    """
    return TemporalEventService.get_sync_updates(db, current_user.id, last_sync_at)


@router.get("/{event_id}", response_model=TemporalEventResponse)
def get_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch details of a single temporal event by ID.
    """
    event = TemporalEventService.get_event(db, event_id, current_user.id)
    return event


@router.patch("/{event_id}", response_model=TemporalEventResponse)
def update_event(
    event_id: str,
    payload: TemporalEventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update temporal event metadata or reschedule planned execution window.
    """
    event = TemporalEventService.update_event(db, event_id, current_user.id, payload)
    return event


@router.post("/{event_id}/transition", response_model=TemporalEventResponse)
def transition_event_status(
    event_id: str,
    transition: TemporalEventTransition,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Execute state machine transition (DRAFT, SCHEDULED, ACTIVE, COMPLETED, SKIPPED, MISSED, etc.)
    """
    event = TemporalEventService.transition_event_status(db, event_id, current_user.id, transition)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_200_OK)
def delete_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft-delete a temporal event.
    """
    success = TemporalEventService.delete_event(db, event_id, current_user.id)
    return {"status": "success", "message": f"Event '{event_id}' deleted successfully."}


@router.get("/{event_id}/history", response_model=List[TemporalEventAuditResponse])
def get_event_history(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch immutable audit history logs for an event.
    """
    audits = TemporalEventService.get_audit_history(db, event_id, current_user.id)
    return audits
