from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class EventStatus(str, Enum):
    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    MISSED = "MISSED"
    SKIPPED = "SKIPPED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    ARCHIVED = "ARCHIVED"

class EventPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"
    CRITICAL = "CRITICAL"

class EventSource(str, Enum):
    USER = "USER"
    AI_COACH = "AI_COACH"
    SYSTEM_AUTOMATION = "SYSTEM_AUTOMATION"
    DEVICE_WEARABLE = "DEVICE_WEARABLE"
    INTEGRATION = "INTEGRATION"

class RecurrenceFrequency(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"
    CUSTOM = "CUSTOM"

class RecurrenceStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    TERMINATED = "TERMINATED"

class UpdateScope(str, Enum):
    THIS_OCCURRENCE = "THIS_OCCURRENCE"
    THIS_AND_FUTURE = "THIS_AND_FUTURE"
    ALL_OCCURRENCES = "ALL_OCCURRENCES"


# ----------------------------------------------------------------------
# Recurrence Rule Schemas
# ----------------------------------------------------------------------
class EventRecurrenceRuleCreate(BaseModel):
    frequency: RecurrenceFrequency
    interval: int = Field(default=1, ge=1)
    by_weekday: List[str] = Field(default_factory=list) # e.g. ["MO", "WE", "FR"]
    by_monthday: List[int] = Field(default_factory=list) # e.g. [1, 15]
    until_date: Optional[datetime] = None
    count: Optional[int] = None
    rrule_string: Optional[str] = None
    exception_dates: List[str] = Field(default_factory=list) # ISO date strings "YYYY-MM-DD"

class EventRecurrenceRuleResponse(EventRecurrenceRuleCreate):
    id: str
    event_id: str
    status: RecurrenceStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ----------------------------------------------------------------------
# Temporal Event Base & Mutators
# ----------------------------------------------------------------------
class TemporalEventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., example="workout")
    event_type: str = Field(..., example="session")
    
    status: EventStatus = EventStatus.SCHEDULED
    priority: EventPriority = EventPriority.MEDIUM
    source: EventSource = EventSource.USER
    source_id: Optional[str] = None
    
    planned_start_at: datetime
    planned_end_at: Optional[datetime] = None
    actual_start_at: Optional[datetime] = None
    actual_end_at: Optional[datetime] = None
    
    is_all_day: bool = False
    duration_minutes: Optional[int] = None
    
    timezone_name: str = "UTC"
    timezone_offset_minutes: int = 0
    
    metadata_payload: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    
    recurrence_rule: Optional[EventRecurrenceRuleCreate] = None


class TemporalEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    event_type: Optional[str] = None
    
    priority: Optional[EventPriority] = None
    planned_start_at: Optional[datetime] = None
    planned_end_at: Optional[datetime] = None
    actual_start_at: Optional[datetime] = None
    actual_end_at: Optional[datetime] = None
    
    is_all_day: Optional[bool] = None
    duration_minutes: Optional[int] = None
    
    metadata_payload: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    
    scope: UpdateScope = UpdateScope.THIS_OCCURRENCE
    target_date: Optional[str] = None # "YYYY-MM-DD" target for virtual instance edit


class TemporalEventTransition(BaseModel):
    target_status: EventStatus
    reason: Optional[str] = None
    actual_start_at: Optional[datetime] = None
    actual_end_at: Optional[datetime] = None
    actor_type: EventSource = EventSource.USER
    actor_id: Optional[str] = None
    additional_metadata: Optional[Dict[str, Any]] = None


# ----------------------------------------------------------------------
# Audit & History Schemas
# ----------------------------------------------------------------------
class TemporalEventAuditResponse(BaseModel):
    id: str
    event_id: str
    user_id: int
    actor_type: str
    actor_id: Optional[str]
    action: str
    previous_status: Optional[str]
    new_status: Optional[str]
    diff_payload: Dict[str, Any]
    timestamp: datetime

    class Config:
        from_attributes = True


# ----------------------------------------------------------------------
# Output Response Schema
# ----------------------------------------------------------------------
class TemporalEventResponse(BaseModel):
    id: str
    user_id: int
    title: str
    description: Optional[str]
    category: str
    event_type: str
    
    status: EventStatus
    priority: EventPriority
    source: EventSource
    source_id: Optional[str]
    
    planned_start_at: Optional[datetime]
    planned_end_at: Optional[datetime]
    actual_start_at: Optional[datetime]
    actual_end_at: Optional[datetime]
    
    is_all_day: bool
    duration_minutes: Optional[int]
    
    timezone_name: str
    timezone_offset_minutes: int
    
    master_event_id: Optional[str]
    parent_event_id: Optional[str]
    
    metadata_payload: Dict[str, Any]
    tags: List[str]
    version: int
    is_virtual: bool = False
    
    created_at: datetime
    updated_at: datetime
    
    recurrence_rule: Optional[EventRecurrenceRuleResponse] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------------------------
# Timeline & Analytics Query Schemas
# ----------------------------------------------------------------------
class TimelineQueryFilter(BaseModel):
    start_date: datetime
    end_date: datetime
    categories: Optional[List[str]] = None
    event_types: Optional[List[str]] = None
    statuses: Optional[List[EventStatus]] = None
    priorities: Optional[List[EventPriority]] = None
    tags: Optional[List[str]] = None
    include_virtual: bool = True
    page: int = 1
    page_size: int = 100

class TimelineSliceResponse(BaseModel):
    start_date: datetime
    end_date: datetime
    total_events: int
    materialized_count: int
    virtual_count: int
    status_breakdown: Dict[str, int]
    events: List[TemporalEventResponse]

class AnalyticsSummaryResponse(BaseModel):
    user_id: int
    total_scheduled: int
    total_completed: int
    total_missed: int
    total_skipped: int
    adherence_ratio: float
    consistency_score: float
    current_streak_days: int
    overtraining_risk_score: float
    goal_risk_index: float
    category_distribution: Dict[str, int]
