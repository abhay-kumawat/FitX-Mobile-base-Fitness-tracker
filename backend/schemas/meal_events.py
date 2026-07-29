from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class AutoCopyFlags(BaseModel):
    copy_nutrition: bool = True
    copy_ingredients: bool = True
    copy_recipe: bool = True
    copy_supplements: bool = True

class RecurrenceConfig(BaseModel):
    frequency: str = "NEVER" # NEVER, DAILY, WEEKDAYS, WEEKENDS, CUSTOM_WEEKDAYS, MONTHLY, EVERY_X_DAYS
    interval: int = 1
    by_weekday: List[str] = Field(default_factory=list) # e.g. ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
    end_condition: str = "NEVER" # NEVER, ON_DATE, AFTER_OCCURRENCES
    until_date: Optional[str] = None # ISO Date "YYYY-MM-DD"
    count: Optional[int] = None

class MealEventCreate(BaseModel):
    name: str
    meal_category: str = "Breakfast" # Breakfast, Lunch, Dinner, Snacks
    scheduled_date: str # YYYY-MM-DD
    scheduled_time: str = "08:00" # HH:MM
    food_id: Optional[str] = None
    calories: int = 0
    protein: float = 0.0
    carbs: float = 0.0
    fat: float = 0.0
    fiber: float = 0.0
    sodium_mg: float = 0.0
    potassium_mg: float = 0.0
    badge_emoji: str = "🥗"
    notes: Optional[str] = None
    
    # Recurrence & Reminders
    recurrence: RecurrenceConfig = Field(default_factory=RecurrenceConfig)
    reminder_offset_minutes: Optional[int] = 15 # e.g. 15, 30, 0, or None
    priority: str = "MEDIUM" # LOW, MEDIUM, HIGH, URGENT
    
    # Auto Copy Options
    auto_copy_flags: AutoCopyFlags = Field(default_factory=AutoCopyFlags)
    
    # Linked Items
    linked_recipe_id: Optional[str] = None
    linked_supplements: List[str] = Field(default_factory=list) # List of supplement names or IDs
    hydration_reminder: bool = False
    future_ai_metadata: Dict[str, Any] = Field(default_factory=dict)

class MealEventUpdate(BaseModel):
    scope: str = "THIS_OCCURRENCE" # THIS_OCCURRENCE or ENTIRE_SERIES
    target_date_str: Optional[str] = None
    
    name: Optional[str] = None
    meal_category: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    notes: Optional[str] = None
    recurrence: Optional[RecurrenceConfig] = None
    reminder_offset_minutes: Optional[int] = None
    priority: Optional[str] = None
    auto_copy_flags: Optional[AutoCopyFlags] = None
    linked_recipe_id: Optional[str] = None
    linked_supplements: Optional[List[str]] = None
    status: Optional[str] = None # pending, completed, skipped

class MealEventResponse(BaseModel):
    id: str
    master_event_id: Optional[str] = None
    name: str
    meal_category: str
    scheduled_date: str
    scheduled_time: str
    status: str
    badge_emoji: str
    calories: int
    protein: float
    carbs: float
    fat: float
    notes: Optional[str] = None
    recurrence: RecurrenceConfig
    reminder_offset_minutes: Optional[int] = None
    auto_copy_flags: AutoCopyFlags
    linked_recipe_id: Optional[str] = None
    linked_supplements: List[str] = Field(default_factory=list)
    temporal_event_id: str

class CopyRangeRequest(BaseModel):
    from_start_date: str # YYYY-MM-DD
    from_end_date: str   # YYYY-MM-DD
    to_start_date: str   # YYYY-MM-DD

class DayTimelineSummary(BaseModel):
    date: str
    is_today: bool
    total_meals: int
    completed_meals: int
    missed_meals: int
    has_reminders: bool
    has_recurring: bool
    compliance_pct: float
