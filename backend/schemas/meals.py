from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class FoodItemSchema(BaseModel):
    id: str
    name: str
    category: str
    serving_size: str = "100g"
    serving_weight_g: float = 100.0
    calories: int = 0
    protein_g: float = 0.0
    carbs_g: float = 0.0
    net_carbs_g: float = 0.0
    fat_g: float = 0.0
    sat_fat_g: float = 0.0
    unsat_fat_g: float = 0.0
    fiber_g: float = 0.0
    sugar_g: float = 0.0
    sodium_mg: float = 0.0
    potassium_mg: float = 0.0
    calcium_mg: float = 0.0
    iron_mg: float = 0.0
    vitamin_a_iu: float = 0.0
    vitamin_c_mg: float = 0.0
    vitamin_d_iu: float = 0.0
    vitamin_b_complex_mg: float = 0.0
    magnesium_mg: float = 0.0
    zinc_mg: float = 0.0
    phosphorus_mg: float = 0.0
    water_g: float = 0.0
    cholesterol_mg: float = 0.0
    brand: str = "Generic"
    search_keywords: List[str] = []
    aliases: List[str] = []
    regional_names: str = ""
    badge_emoji: str = "🥗"
    verified: bool = True
    is_custom: bool = False
    is_favorite: Optional[bool] = False
    is_recent: Optional[bool] = False

class FoodSearchOut(BaseModel):
    total_count: int
    page: int
    limit: int
    items: List[FoodItemSchema]

class FavoriteTogglePayload(BaseModel):
    food_id: str

class FoodItemCreate(BaseModel):
    name: str
    category: str
    serving_size: str = "100g"
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0.0
    sodium_mg: float = 0.0
    potassium_mg: float = 0.0
    micronutrients: Optional[Dict[str, Any]] = None
    badge_emoji: str = "🥗"

class LoggedMealCreate(BaseModel):
    food_id: Optional[str] = None
    name: str
    meal_category: str # Breakfast, Lunch, Dinner, Snacks
    serving_multiplier: float = 1.0
    calories: int
    protein: float
    carbs: float
    fat: float
    fiber: float = 0.0
    sodium_mg: float = 0.0
    potassium_mg: float = 0.0
    badge_emoji: str = "🍽️"
    scheduled_time: Optional[str] = "12:00"
    date_str: str # YYYY-MM-DD

class LoggedMealUpdate(BaseModel):
    serving_multiplier: Optional[float] = None
    status: Optional[str] = None # pending, completed, skipped
    meal_category: Optional[str] = None
    scheduled_time: Optional[str] = None

class LoggedMealStatusUpdate(BaseModel):
    status: str # pending, completed, skipped

class LoggedMealOut(BaseModel):
    id: str
    food_id: Optional[str] = None
    name: str
    meal_category: str
    serving_multiplier: float
    calories: int
    protein: float
    carbs: float
    fat: float
    fiber: float
    sodium_mg: float
    potassium_mg: float
    badge_emoji: str
    status: str
    scheduled_time: Optional[str] = None
    completed_at: Optional[str] = None
    date_str: str
    temporal_event_id: Optional[str] = None

class HydrationLogCreate(BaseModel):
    date_str: str # YYYY-MM-DD
    liquid_type: str # Water, Electrolytes, Protein Shake, Tea & Coffee, Fresh Juice
    volume_ml: int = 250
    emoji: str = "💧"

class HydrationLogOut(BaseModel):
    id: str
    liquid_type: str
    volume_ml: int
    emoji: str
    timestamp: str
    date_str: str
    temporal_event_id: Optional[str] = None

class HydrationGoalUpdate(BaseModel):
    target_water_ml: int

class SupplementCreate(BaseModel):
    date_str: str # YYYY-MM-DD
    name: str
    dosage: str = "1 serving"
    timing: str = "Morning" # Morning, With Meals, Pre-Workout, Post-Workout, Bedtime
    scheduled_time: str = "08:00"
    badge_emoji: str = "💊"

class SupplementOut(BaseModel):
    id: str
    name: str
    dosage: str
    timing: str
    scheduled_time: str
    status: str
    completed_at: Optional[str] = None
    badge_emoji: str
    date_str: str
    temporal_event_id: Optional[str] = None

class MealComboCreate(BaseModel):
    name: str
    items: List[Dict[str, Any]]
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    badge_emoji: str = "🍱"

class MealComboOut(BaseModel):
    id: str
    name: str
    items: List[Dict[str, Any]]
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    badge_emoji: str

class ReminderRuleCreate(BaseModel):
    title: str
    time_str: str
    reminder_type: str = "meal" # meal, water, supplement
    enabled: bool = True

class ReminderRuleOut(BaseModel):
    id: str
    title: str
    time_str: str
    reminder_type: str
    enabled: bool
    temporal_event_id: Optional[str] = None

class DailyTotalsOut(BaseModel):
    calories: int
    protein: float
    carbs: float
    net_carbs: float = 0.0
    fat: float
    sat_fat: float = 0.0
    unsat_fat: float = 0.0
    fiber: float
    sugar: float = 0.0
    sodium_mg: float = 0.0
    potassium_mg: float = 0.0
    cholesterol_mg: float = 0.0
    target_calories: int
    target_protein: float
    target_carbs: float
    target_fat: float
    target_fiber: float
    water_ml: int
    target_water_ml: int
    completed_meals: int
    total_meals: int
    completed_supplements: int
    total_supplements: int
    streak_days: int
    hypertrophy_match_pct: float = 0.0
    fat_loss_match_pct: float = 0.0
    maintenance_match_pct: float = 0.0
    nutrition_score: float = 85.0

class DailyNutritionDashboardOut(BaseModel):
    date_str: str
    meals: List[LoggedMealOut]
    hydration: List[HydrationLogOut]
    supplements: List[SupplementOut]
    combos: List[MealComboOut]
    notifications: List[ReminderRuleOut]
    totals: DailyTotalsOut

class CopyPlanRequest(BaseModel):
    from_date_str: str
    to_date_str: str
