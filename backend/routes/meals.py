from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.models import User, FoodItem
from backend.schemas.meals import (
    DailyNutritionDashboardOut, LoggedMealCreate, LoggedMealStatusUpdate, LoggedMealOut, LoggedMealUpdate,
    FoodItemCreate, FoodItemSchema, FoodSearchOut, FavoriteTogglePayload, HydrationLogCreate, HydrationLogOut, HydrationGoalUpdate,
    SupplementCreate, SupplementOut, MealComboCreate, MealComboOut, ReminderRuleOut,
    CopyPlanRequest, DailyTotalsOut
)

from backend.services.meals.food_seed import seed_food_items_if_empty
from backend.services.meals.macro_calculator import compute_and_save_daily_summary
from backend.schemas.meal_events import (
    MealEventCreate, MealEventUpdate, CopyRangeRequest, DayTimelineSummary
)
from backend.services.meals.meal_engine import (
    get_user_meals_by_date, add_meal_item, toggle_meal_status, remove_meal_item, copy_plan_to_date,
    create_meal_event, update_meal_event_series, copy_range_plans, get_timeline_indicators,
    search_food_library, toggle_favorite_food, record_recent_food, update_meal_item
)
from backend.services.meals.hydration_engine import (
    get_hydration_logs, add_hydration_log, remove_hydration_log, update_daily_water_target
)
from backend.services.meals.supplement_engine import (
    get_supplement_logs, add_supplement_log, toggle_supplement_status, remove_supplement_log
)
from backend.services.meals.recipe_engine import (
    get_user_meal_combos, create_meal_combo
)
from backend.services.meals.reminder_engine import (
    get_user_reminders, toggle_reminder_rule
)
from backend.services.realtime.socket import ws_manager

router = APIRouter(prefix="/meals", tags=["Meals & Nutrition TES Module"])


async def notify_realtime_update(user_id: int, date_str: str, action: str):
    """
    Helper function to broadcast realtime WebSocket updates for live client sync.
    """
    try:
        await ws_manager.broadcast({
            "type": "MEAL_UPDATE",
            "user_id": user_id,
            "date": date_str,
            "action": action,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception:
        pass


@router.get("/dashboard", response_model=DailyNutritionDashboardOut)
def get_daily_nutrition_dashboard(
    date: str = Query(..., description="Target date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the complete dynamic nutrition, hydration, supplement, combo, and reminder payload for a date.
    """
    seed_food_items_if_empty(db)
    
    meals = get_user_meals_by_date(db, current_user.id, date)
    hydration = get_hydration_logs(db, current_user.id, date)
    supplements = get_supplement_logs(db, current_user.id, date)
    combos = get_user_meal_combos(db, current_user.id)
    notifications = get_user_reminders(db, current_user.id)
    summary = compute_and_save_daily_summary(db, current_user.id, date)

    totals_out = DailyTotalsOut(
        calories=summary.total_calories,
        protein=summary.total_protein,
        carbs=summary.total_carbs,
        net_carbs=getattr(summary, "total_net_carbs", 0.0),
        fat=summary.total_fat,
        sat_fat=getattr(summary, "total_sat_fat", 0.0),
        unsat_fat=getattr(summary, "total_unsat_fat", 0.0),
        fiber=summary.total_fiber,
        sugar=getattr(summary, "total_sugar", 0.0),
        sodium_mg=getattr(summary, "total_sodium_mg", 0.0),
        potassium_mg=getattr(summary, "total_potassium_mg", 0.0),
        cholesterol_mg=getattr(summary, "total_cholesterol_mg", 0.0),
        target_calories=summary.target_calories,
        target_protein=summary.target_protein,
        target_carbs=summary.target_carbs,
        target_fat=summary.target_fat,
        target_fiber=summary.target_fiber,
        water_ml=summary.total_water_ml,
        target_water_ml=summary.target_water_ml,
        completed_meals=summary.completed_meals,
        total_meals=summary.total_meals,
        completed_supplements=summary.completed_supplements,
        total_supplements=summary.total_supplements,
        streak_days=summary.streak_days,
        hypertrophy_match_pct=getattr(summary, "hypertrophy_match_pct", 0.0),
        fat_loss_match_pct=getattr(summary, "fat_loss_match_pct", 0.0),
        maintenance_match_pct=getattr(summary, "maintenance_match_pct", 0.0),
        nutrition_score=getattr(summary, "nutrition_score", 85.0)
    )

    meals_out = [
        LoggedMealOut(
            id=m.id,
            food_id=m.food_id,
            name=m.name,
            meal_category=m.meal_category,
            serving_multiplier=m.serving_multiplier,
            calories=m.calories,
            protein=m.protein,
            carbs=m.carbs,
            fat=m.fat,
            fiber=m.fiber,
            sodium_mg=m.sodium_mg,
            potassium_mg=m.potassium_mg,
            badge_emoji=m.badge_emoji,
            status=m.status,
            scheduled_time=m.scheduled_time,
            completed_at=m.completed_at,
            date_str=m.date,
            temporal_event_id=m.temporal_event_id
        ) for m in meals
    ]

    hydration_out = [
        HydrationLogOut(
            id=h.id,
            liquid_type=h.liquid_type,
            volume_ml=h.volume_ml,
            emoji=h.emoji,
            timestamp=h.timestamp,
            date_str=h.date,
            temporal_event_id=h.temporal_event_id
        ) for h in hydration
    ]

    supplements_out = [
        SupplementOut(
            id=s.id,
            name=s.name,
            dosage=s.dosage,
            timing=s.timing,
            scheduled_time=s.scheduled_time,
            status=s.status,
            completed_at=s.completed_at,
            badge_emoji=s.badge_emoji,
            date_str=s.date,
            temporal_event_id=s.temporal_event_id
        ) for s in supplements
    ]

    combos_out = [
        MealComboOut(
            id=c.id,
            name=c.name,
            items=c.items,
            total_calories=c.total_calories,
            total_protein=c.total_protein,
            total_carbs=c.total_carbs,
            total_fat=c.total_fat,
            badge_emoji=c.badge_emoji
        ) for c in combos
    ]

    reminders_out = [
        ReminderRuleOut(
            id=r.id,
            title=r.title,
            time_str=r.time_str,
            reminder_type=r.reminder_type,
            enabled=r.enabled,
            temporal_event_id=r.temporal_event_id
        ) for r in notifications
    ]

    return DailyNutritionDashboardOut(
        date_str=date,
        meals=meals_out,
        hydration=hydration_out,
        supplements=supplements_out,
        combos=combos_out,
        notifications=reminders_out,
        totals=totals_out
    )


@router.get("/foods/search", response_model=FoodSearchOut)
def search_foods(
    query: Optional[str] = Query(None, description="Search term across names, keywords, and aliases"),
    category: Optional[str] = Query(None, description="Food category filter"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    only_favorites: bool = Query(False),
    only_recents: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fast searchable food library endpoint querying over 1,000+ verified foods.
    """
    res = search_food_library(
        db=db,
        user_id=current_user.id,
        query=query,
        category=category,
        page=page,
        limit=limit,
        only_favorites=only_favorites,
        only_recents=only_recents
    )
    return FoodSearchOut(**res)


@router.post("/foods/favorite")
def toggle_favorite(
    payload: FavoriteTogglePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggles a food item in user's favorites list.
    """
    is_fav = toggle_favorite_food(db, current_user.id, payload.food_id)
    return {"food_id": payload.food_id, "is_favorite": is_fav}


@router.post("/items", response_model=LoggedMealOut)
async def create_logged_meal(
    payload: LoggedMealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = add_meal_item(db, current_user.id, payload)
    if payload.food_id:
        record_recent_food(db, current_user.id, payload.food_id)
    await notify_realtime_update(current_user.id, payload.date_str, "ADD_MEAL")

    return LoggedMealOut(
        id=meal.id,
        food_id=meal.food_id,
        name=meal.name,
        meal_category=meal.meal_category,
        serving_multiplier=meal.serving_multiplier,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        fat=meal.fat,
        fiber=meal.fiber,
        sodium_mg=meal.sodium_mg,
        potassium_mg=meal.potassium_mg,
        badge_emoji=meal.badge_emoji,
        status=meal.status,
        scheduled_time=meal.scheduled_time,
        completed_at=meal.completed_at,
        date_str=meal.date,
        temporal_event_id=meal.temporal_event_id
    )


@router.put("/items/{meal_id}", response_model=LoggedMealOut)
async def update_logged_meal_item(
    meal_id: str,
    payload: LoggedMealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = update_meal_item(
        db,
        current_user.id,
        meal_id,
        serving_multiplier=payload.serving_multiplier,
        status=payload.status,
        meal_category=payload.meal_category,
        scheduled_time=payload.scheduled_time
    )
    await notify_realtime_update(current_user.id, meal.date, "UPDATE_MEAL")

    return LoggedMealOut(
        id=meal.id,
        food_id=meal.food_id,
        name=meal.name,
        meal_category=meal.meal_category,
        serving_multiplier=meal.serving_multiplier,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        fat=meal.fat,
        fiber=meal.fiber,
        sodium_mg=meal.sodium_mg,
        potassium_mg=meal.potassium_mg,
        badge_emoji=meal.badge_emoji,
        status=meal.status,
        scheduled_time=meal.scheduled_time,
        completed_at=meal.completed_at,
        date_str=meal.date,
        temporal_event_id=meal.temporal_event_id
    )


@router.patch("/items/{meal_id}/status", response_model=LoggedMealOut)
async def update_meal_status(
    meal_id: str,
    date: str = Query(...),
    payload: Optional[LoggedMealStatusUpdate] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_status = payload.status if payload else None
    meal = toggle_meal_status(db, current_user.id, date, meal_id, new_status)
    await notify_realtime_update(current_user.id, date, "TOGGLE_MEAL_STATUS")

    return LoggedMealOut(
        id=meal.id,
        food_id=meal.food_id,
        name=meal.name,
        meal_category=meal.meal_category,
        serving_multiplier=meal.serving_multiplier,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        fat=meal.fat,
        fiber=meal.fiber,
        sodium_mg=meal.sodium_mg,
        potassium_mg=meal.potassium_mg,
        badge_emoji=meal.badge_emoji,
        status=meal.status,
        scheduled_time=meal.scheduled_time,
        completed_at=meal.completed_at,
        date_str=meal.date,
        temporal_event_id=meal.temporal_event_id
    )


@router.delete("/items/{meal_id}")
async def delete_logged_meal(
    meal_id: str,
    date: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    remove_meal_item(db, current_user.id, date, meal_id)
    await notify_realtime_update(current_user.id, date, "REMOVE_MEAL")
    return {"status": "success", "message": f"Meal '{meal_id}' deleted."}


@router.post("/copy-plan")
async def copy_meal_plan(
    payload: CopyPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = copy_plan_to_date(db, current_user.id, payload.from_date_str, payload.to_date_str)
    if not success:
        raise HTTPException(status_code=400, detail="No source meals found to copy.")
    
    await notify_realtime_update(current_user.id, payload.to_date_str, "COPY_PLAN")
    return {"status": "success", "message": f"Copied plan from {payload.from_date_str} to {payload.to_date_str}."}


@router.get("/foods/search", response_model=List[FoodItemSchema])
def search_food_library(
    query: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    seed_food_items_if_empty(db)
    q = db.query(FoodItem)
    if category and category != "All":
        q = q.filter(FoodItem.category.ilike(f"%{category}%"))
    if query:
        q = q.filter(FoodItem.name.ilike(f"%{query}%"))
    
    items = q.limit(50).all()
    return [
        FoodItemSchema(
            id=item.id,
            name=item.name,
            category=item.category,
            serving_size=item.serving_size,
            calories=item.calories,
            protein_g=item.protein_g,
            carbs_g=item.carbs_g,
            fat_g=item.fat_g,
            fiber_g=item.fiber_g,
            sodium_mg=item.sodium_mg,
            potassium_mg=item.potassium_mg,
            micronutrients=item.micronutrients or {},
            badge_emoji=item.badge_emoji,
            verified=item.verified,
            is_custom=item.is_custom
        ) for item in items
    ]


@router.post("/foods/custom", response_model=FoodItemSchema)
def add_custom_food(
    payload: FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    custom_id = f"custom_{int(datetime.utcnow().timestamp() * 1000)}"
    item = FoodItem(
        id=custom_id,
        name=payload.name,
        category=payload.category,
        serving_size=payload.serving_size,
        calories=payload.calories,
        protein_g=payload.protein_g,
        carbs_g=payload.carbs_g,
        fat_g=payload.fat_g,
        fiber_g=payload.fiber_g,
        sodium_mg=payload.sodium_mg,
        potassium_mg=payload.potassium_mg,
        micronutrients=payload.micronutrients or {},
        badge_emoji=payload.badge_emoji,
        verified=False,
        is_custom=True,
        created_by_user_id=current_user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return FoodItemSchema(
        id=item.id,
        name=item.name,
        category=item.category,
        serving_size=item.serving_size,
        calories=item.calories,
        protein_g=item.protein_g,
        carbs_g=item.carbs_g,
        fat_g=item.fat_g,
        fiber_g=item.fiber_g,
        sodium_mg=item.sodium_mg,
        potassium_mg=item.potassium_mg,
        micronutrients=item.micronutrients or {},
        badge_emoji=item.badge_emoji,
        verified=item.verified,
        is_custom=item.is_custom
    )


@router.post("/hydration", response_model=HydrationLogOut)
async def log_hydration(
    payload: HydrationLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hyd = add_hydration_log(db, current_user.id, payload)
    await notify_realtime_update(current_user.id, payload.date_str, "ADD_HYDRATION")

    return HydrationLogOut(
        id=hyd.id,
        liquid_type=hyd.liquid_type,
        volume_ml=hyd.volume_ml,
        emoji=hyd.emoji,
        timestamp=hyd.timestamp,
        date_str=hyd.date,
        temporal_event_id=hyd.temporal_event_id
    )


@router.delete("/hydration/{hyd_id}")
async def delete_hydration(
    hyd_id: str,
    date: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    remove_hydration_log(db, current_user.id, date, hyd_id)
    await notify_realtime_update(current_user.id, date, "REMOVE_HYDRATION")
    return {"status": "success", "message": f"Hydration '{hyd_id}' removed."}


@router.put("/hydration/target")
async def update_water_target(
    payload: HydrationGoalUpdate,
    date: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target = update_daily_water_target(db, current_user.id, date, payload.target_water_ml)
    await notify_realtime_update(current_user.id, date, "UPDATE_WATER_TARGET")
    return {"status": "success", "target_water_ml": target}


@router.post("/supplements", response_model=SupplementOut)
async def log_supplement(
    payload: SupplementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    supp = add_supplement_log(db, current_user.id, payload)
    await notify_realtime_update(current_user.id, payload.date_str, "ADD_SUPPLEMENT")

    return SupplementOut(
        id=supp.id,
        name=supp.name,
        dosage=supp.dosage,
        timing=supp.timing,
        scheduled_time=supp.scheduled_time,
        status=supp.status,
        completed_at=supp.completed_at,
        badge_emoji=supp.badge_emoji,
        date_str=supp.date,
        temporal_event_id=supp.temporal_event_id
    )


@router.patch("/supplements/{supp_id}/status", response_model=SupplementOut)
async def update_supplement_status(
    supp_id: str,
    date: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    supp = toggle_supplement_status(db, current_user.id, date, supp_id)
    await notify_realtime_update(current_user.id, date, "TOGGLE_SUPPLEMENT_STATUS")

    return SupplementOut(
        id=supp.id,
        name=supp.name,
        dosage=supp.dosage,
        timing=supp.timing,
        scheduled_time=supp.scheduled_time,
        status=supp.status,
        completed_at=supp.completed_at,
        badge_emoji=supp.badge_emoji,
        date_str=supp.date,
        temporal_event_id=supp.temporal_event_id
    )


@router.delete("/supplements/{supp_id}")
async def delete_supplement(
    supp_id: str,
    date: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    remove_supplement_log(db, current_user.id, date, supp_id)
    await notify_realtime_update(current_user.id, date, "REMOVE_SUPPLEMENT")
    return {"status": "success", "message": f"Supplement '{supp_id}' removed."}


@router.get("/recipes", response_model=List[MealComboOut])
def list_meal_combos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    combos = get_user_meal_combos(db, current_user.id)
    return [
        MealComboOut(
            id=c.id,
            name=c.name,
            items=c.items,
            total_calories=c.total_calories,
            total_protein=c.total_protein,
            total_carbs=c.total_carbs,
            total_fat=c.total_fat,
            badge_emoji=c.badge_emoji
        ) for c in combos
    ]


@router.post("/recipes", response_model=MealComboOut)
def save_meal_combo(
    payload: MealComboCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    combo = create_meal_combo(db, current_user.id, payload)
    return MealComboOut(
        id=combo.id,
        name=combo.name,
        items=combo.items,
        total_calories=combo.total_calories,
        total_protein=combo.total_protein,
        total_carbs=combo.total_carbs,
        total_fat=combo.total_fat,
        badge_emoji=combo.badge_emoji
    )


@router.get("/reminders", response_model=List[ReminderRuleOut])
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rules = get_user_reminders(db, current_user.id)
    return [
        ReminderRuleOut(
            id=r.id,
            title=r.title,
            time_str=r.time_str,
            reminder_type=r.reminder_type,
            enabled=r.enabled,
            temporal_event_id=r.temporal_event_id
        ) for r in rules
    ]


@router.patch("/reminders/{reminder_id}", response_model=ReminderRuleOut)
def toggle_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = toggle_reminder_rule(db, current_user.id, reminder_id)
    return ReminderRuleOut(
        id=rule.id,
        title=rule.title,
        time_str=rule.time_str,
        reminder_type=rule.reminder_type,
        enabled=rule.enabled,
        temporal_event_id=rule.temporal_event_id
    )


# =====================================================================
# EVENT SCHEDULING PLATFORM ENDPOINTS (TES INTEGRATED)
# =====================================================================

@router.post("/events", response_model=LoggedMealOut)
async def schedule_meal_event(
    payload: MealEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = create_meal_event(db, current_user.id, payload)
    await notify_realtime_update(current_user.id, payload.scheduled_date, "SCHEDULE_MEAL_EVENT")

    return LoggedMealOut(
        id=meal.id,
        food_id=meal.food_id,
        name=meal.name,
        meal_category=meal.meal_category,
        serving_multiplier=meal.serving_multiplier,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        fat=meal.fat,
        fiber=meal.fiber,
        sodium_mg=meal.sodium_mg,
        potassium_mg=meal.potassium_mg,
        badge_emoji=meal.badge_emoji,
        status=meal.status,
        scheduled_time=meal.scheduled_time,
        completed_at=meal.completed_at,
        date_str=meal.date,
        temporal_event_id=meal.temporal_event_id
    )


@router.put("/events/{event_id}", response_model=LoggedMealOut)
async def update_scheduled_meal_event(
    event_id: str,
    payload: MealEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = update_meal_event_series(db, current_user.id, event_id, payload)
    await notify_realtime_update(current_user.id, meal.date, "UPDATE_MEAL_EVENT")

    return LoggedMealOut(
        id=meal.id,
        food_id=meal.food_id,
        name=meal.name,
        meal_category=meal.meal_category,
        serving_multiplier=meal.serving_multiplier,
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        fat=meal.fat,
        fiber=meal.fiber,
        sodium_mg=meal.sodium_mg,
        potassium_mg=meal.potassium_mg,
        badge_emoji=meal.badge_emoji,
        status=meal.status,
        scheduled_time=meal.scheduled_time,
        completed_at=meal.completed_at,
        date_str=meal.date,
        temporal_event_id=meal.temporal_event_id
    )


@router.post("/copy-range")
async def copy_date_range(
    payload: CopyRangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = copy_range_plans(db, current_user.id, payload.from_start_date, payload.from_end_date, payload.to_start_date)
    await notify_realtime_update(current_user.id, payload.to_start_date, "COPY_RANGE")
    return {"status": "success", "message": "Date range plans copied successfully."}


@router.get("/timeline-indicators", response_model=List[DayTimelineSummary])
def list_timeline_indicators(
    start_date: str = Query(..., description="Start date YYYY-MM-DD"),
    end_date: str = Query(..., description="End date YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    indicators = get_timeline_indicators(db, current_user.id, start_date, end_date)
    return indicators

