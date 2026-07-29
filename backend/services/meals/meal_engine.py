import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.models.models import (
    DailyNutritionLog, DailyHydrationLog, DailySupplementLog,
    StreakRecord, TemporalEvent, FoodItem, FavoriteFood, RecentFood
)
from backend.schemas.meals import LoggedMealCreate, LoggedMealStatusUpdate
from backend.schemas.temporal_event_system import (
    TemporalEventCreate, EventStatus, EventPriority, EventSource
)
from backend.services.temporal_event_system.service import TemporalEventService
from backend.services.meals.macro_calculator import compute_and_save_daily_summary

def _format_datetime(date_str: str, time_str: Optional[str] = "12:00") -> datetime:
    try:
        if not time_str or len(time_str.split(":")) < 2:
            time_str = "12:00"
        return datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except Exception:
        return datetime.utcnow()

def seed_default_user_day_if_empty(db: Session, user_id: int, date_str: str):
    """
    Seeds initial meal plan for today if the user has no meals logged yet.
    """
    existing_count = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.user_id == user_id,
        DailyNutritionLog.date == date_str
    ).count()

    if existing_count > 0:
        return

    default_seed = [
        {
            "food_id": "c1",
            "name": "Gold Protein Oats & Banana",
            "meal_category": "Breakfast",
            "serving_multiplier": 1.5,
            "calories": 520,
            "protein": 38.0,
            "carbs": 64.0,
            "fiber": 8.0,
            "fat": 12.0,
            "sodium_mg": 140.0,
            "potassium_mg": 520.0,
            "badge_emoji": "🌅",
            "status": "completed",
            "scheduled_time": "08:00",
            "completed_at": "08:15 AM",
        },
        {
            "food_id": "p1",
            "name": "Seared Chicken Breast & Quinoa Bowl",
            "meal_category": "Lunch",
            "serving_multiplier": 2.0,
            "calories": 680,
            "protein": 55.0,
            "carbs": 58.0,
            "fiber": 10.0,
            "fat": 16.0,
            "sodium_mg": 280.0,
            "potassium_mg": 710.0,
            "badge_emoji": "🥗",
            "status": "pending",
            "scheduled_time": "13:00",
        },
        {
            "food_id": "p5",
            "name": "Lean Beef Stir-Fry & Jasmine Rice",
            "meal_category": "Dinner",
            "serving_multiplier": 1.8,
            "calories": 720,
            "protein": 58.0,
            "carbs": 62.0,
            "fiber": 6.0,
            "fat": 20.0,
            "sodium_mg": 350.0,
            "potassium_mg": 680.0,
            "badge_emoji": "🍲",
            "status": "pending",
            "scheduled_time": "19:30",
        },
        {
            "food_id": "d1",
            "name": "Greek Yogurt & Honey Crunch",
            "meal_category": "Snacks",
            "serving_multiplier": 1.5,
            "calories": 280,
            "protein": 24.0,
            "carbs": 28.0,
            "fiber": 4.0,
            "fat": 4.0,
            "sodium_mg": 90.0,
            "potassium_mg": 360.0,
            "badge_emoji": "🍎",
            "status": "pending",
            "scheduled_time": "16:30",
        },
    ]

    for item in default_seed:
        meal_id = f"meal_{int(datetime.utcnow().timestamp() * 1000)}_{uuid.uuid4().hex[:4]}"
        
        # Mirror to Temporal Event System (TES)
        planned_start = _format_datetime(date_str, item["scheduled_time"])
        status_enum = EventStatus.COMPLETED if item["status"] == "completed" else EventStatus.SCHEDULED

        tes_data = TemporalEventCreate(
            title=f"Meal: {item['name']}",
            description=f"Meal Category: {item['meal_category']} | Calories: {item['calories']} kcal | Protein: {item['protein']}g",
            category="nutrition",
            event_type="meal",
            status=status_enum,
            priority=EventPriority.MEDIUM,
            source=EventSource.USER,
            planned_start_at=planned_start,
            duration_minutes=30,
            metadata_payload={
                "meal_id": meal_id,
                "meal_category": item["meal_category"],
                "calories": item["calories"],
                "protein": item["protein"],
                "carbs": item["carbs"],
                "fat": item["fat"]
            },
            tags=["nutrition", "meal", item["meal_category"].lower()]
        )
        tes_event = TemporalEventService.create_event(db, user_id, tes_data)

        meal = DailyNutritionLog(
            id=meal_id,
            user_id=user_id,
            date=date_str,
            meal_category=item["meal_category"],
            food_id=item.get("food_id"),
            name=item["name"],
            serving_multiplier=item["serving_multiplier"],
            calories=item["calories"],
            protein=item["protein"],
            carbs=item["carbs"],
            fat=item["fat"],
            fiber=item["fiber"],
            sodium_mg=item["sodium_mg"],
            potassium_mg=item["potassium_mg"],
            badge_emoji=item["badge_emoji"],
            status=item["status"],
            scheduled_time=item["scheduled_time"],
            completed_at=item.get("completed_at"),
            temporal_event_id=tes_event.id
        )
        db.add(meal)

    # Seed default hydration & supplements if empty as well
    if db.query(DailyHydrationLog).filter(DailyHydrationLog.user_id == user_id, DailyHydrationLog.date == date_str).count() == 0:
        db.add(DailyHydrationLog(
            id=f"hyd_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            date=date_str,
            liquid_type="Water",
            volume_ml=500,
            emoji="💧",
            timestamp="08:00 AM"
        ))
        db.add(DailyHydrationLog(
            id=f"hyd_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            date=date_str,
            liquid_type="Electrolytes",
            volume_ml=750,
            emoji="⚡",
            timestamp="11:30 AM"
        ))

    if db.query(DailySupplementLog).filter(DailySupplementLog.user_id == user_id, DailySupplementLog.date == date_str).count() == 0:
        db.add(DailySupplementLog(
            id=f"supp_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            date=date_str,
            name="Creatine Monohydrate",
            dosage="5g",
            timing="Morning",
            scheduled_time="07:30",
            status="completed",
            completed_at="07:45 AM",
            badge_emoji="⚡"
        ))
        db.add(DailySupplementLog(
            id=f"supp_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            date=date_str,
            name="Omega-3 Fish Oil",
            dosage="2 softgels",
            timing="With Meals",
            scheduled_time="13:00",
            status="pending",
            badge_emoji="🐟"
        ))

    # Initialize streak if not exists
    if not db.query(StreakRecord).filter(StreakRecord.user_id == user_id).first():
        db.add(StreakRecord(user_id=user_id, current_streak=5, highest_streak=14, last_activity_date=date_str))

    db.commit()
    compute_and_save_daily_summary(db, user_id, date_str)


def get_user_meals_by_date(db: Session, user_id: int, date_str: str) -> List[DailyNutritionLog]:
    seed_default_user_day_if_empty(db, user_id, date_str)
    return db.query(DailyNutritionLog).filter(
        DailyNutritionLog.user_id == user_id,
        DailyNutritionLog.date == date_str
    ).order_by(DailyNutritionLog.created_at.asc()).all()


def add_meal_item(db: Session, user_id: int, data: LoggedMealCreate) -> DailyNutritionLog:
    meal_id = f"meal_{int(datetime.utcnow().timestamp() * 1000)}_{uuid.uuid4().hex[:4]}"

    # Mirror to TES event
    planned_start = _format_datetime(data.date_str, data.scheduled_time)
    tes_data = TemporalEventCreate(
        title=f"Meal: {data.name}",
        description=f"Category: {data.meal_category} | {data.calories} kcal | Protein: {data.protein}g",
        category="nutrition",
        event_type="meal",
        status=EventStatus.SCHEDULED,
        priority=EventPriority.MEDIUM,
        source=EventSource.USER,
        planned_start_at=planned_start,
        duration_minutes=30,
        metadata_payload={
            "meal_id": meal_id,
            "meal_category": data.meal_category,
            "calories": data.calories,
            "protein": data.protein
        },
        tags=["nutrition", "meal", data.meal_category.lower()]
    )
    tes_event = TemporalEventService.create_event(db, user_id, tes_data)

    meal = DailyNutritionLog(
        id=meal_id,
        user_id=user_id,
        date=data.date_str,
        meal_category=data.meal_category,
        food_id=data.food_id,
        name=data.name,
        serving_multiplier=data.serving_multiplier,
        calories=data.calories,
        protein=data.protein,
        carbs=data.carbs,
        fat=data.fat,
        fiber=data.fiber,
        sodium_mg=data.sodium_mg,
        potassium_mg=data.potassium_mg,
        badge_emoji=data.badge_emoji,
        status="pending",
        scheduled_time=data.scheduled_time,
        temporal_event_id=tes_event.id
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)

    compute_and_save_daily_summary(db, user_id, data.date_str)
    return meal


def toggle_meal_status(
    db: Session,
    user_id: int,
    date_str: str,
    meal_id: str,
    new_status: Optional[str] = None
) -> DailyNutritionLog:
    meal = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.id == meal_id,
        DailyNutritionLog.user_id == user_id
    ).first()

    if not meal:
        raise HTTPException(status_code=404, detail=f"Meal log '{meal_id}' not found.")

    if new_status:
        target_status = new_status
    else:
        target_status = "pending" if meal.status == "completed" else "completed"

    meal.status = target_status
    if target_status == "completed":
        meal.completed_at = datetime.utcnow().strftime("%I:%M %p")
    else:
        meal.completed_at = None

    # Update corresponding TES Event status if exists
    if meal.temporal_event_id:
        tes_event = db.query(TemporalEvent).filter(TemporalEvent.id == meal.temporal_event_id).first()
        if tes_event:
            if target_status == "completed":
                tes_event.status = EventStatus.COMPLETED.value
                tes_event.actual_start_at = datetime.utcnow()
                tes_event.actual_end_at = datetime.utcnow()
            elif target_status == "skipped":
                tes_event.status = EventStatus.SKIPPED.value
            else:
                tes_event.status = EventStatus.SCHEDULED.value

    db.commit()
    db.refresh(meal)

    compute_and_save_daily_summary(db, user_id, date_str)
    return meal


def remove_meal_item(db: Session, user_id: int, date_str: str, meal_id: str):
    meal = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.id == meal_id,
        DailyNutritionLog.user_id == user_id
    ).first()

    if not meal:
        raise HTTPException(status_code=404, detail=f"Meal log '{meal_id}' not found.")

    if meal.temporal_event_id:
        tes_event = db.query(TemporalEvent).filter(TemporalEvent.id == meal.temporal_event_id).first()
        if tes_event:
            db.delete(tes_event)

    db.delete(meal)
    db.commit()

    compute_and_save_daily_summary(db, user_id, date_str)
    return True


def copy_plan_to_date(db: Session, user_id: int, from_date_str: str, to_date_str: str) -> bool:
    """
    Copies all meals, hydration logs, and supplements from source date to target date.
    """
    source_meals = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.user_id == user_id,
        DailyNutritionLog.date == from_date_str
    ).all()

    if not source_meals:
        return False

    # Clear existing target date meals
    existing_target_meals = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.user_id == user_id,
        DailyNutritionLog.date == to_date_str
    ).all()

    for m in existing_target_meals:
        if m.temporal_event_id:
            te = db.query(TemporalEvent).filter(TemporalEvent.id == m.temporal_event_id).first()
            if te:
                db.delete(te)
        db.delete(m)

    for m in source_meals:
        new_meal_id = f"meal_{int(datetime.utcnow().timestamp() * 1000)}_{uuid.uuid4().hex[:4]}"
        planned_start = _format_datetime(to_date_str, m.scheduled_time)

        tes_data = TemporalEventCreate(
            title=f"Meal: {m.name}",
            description=f"Category: {m.meal_category} | {m.calories} kcal | Protein: {m.protein}g",
            category="nutrition",
            event_type="meal",
            status=EventStatus.SCHEDULED,
            priority=EventPriority.MEDIUM,
            source=EventSource.USER,
            planned_start_at=planned_start,
            duration_minutes=30,
            metadata_payload={
                "meal_id": new_meal_id,
                "meal_category": m.meal_category,
                "calories": m.calories,
                "protein": m.protein
            },
            tags=["nutrition", "meal", m.meal_category.lower()]
        )
        tes_event = TemporalEventService.create_event(db, user_id, tes_data)

        new_meal = DailyNutritionLog(
            id=new_meal_id,
            user_id=user_id,
            date=to_date_str,
            meal_category=m.meal_category,
            food_id=m.food_id,
            name=m.name,
            serving_multiplier=m.serving_multiplier,
            calories=m.calories,
            protein=m.protein,
            carbs=m.carbs,
            fat=m.fat,
            fiber=m.fiber,
            sodium_mg=m.sodium_mg,
            potassium_mg=m.potassium_mg,
            badge_emoji=m.badge_emoji,
            status="pending",
            scheduled_time=m.scheduled_time,
            temporal_event_id=tes_event.id
        )
        db.add(new_meal)

    # Copy supplements as well
    source_supps = db.query(DailySupplementLog).filter(
        DailySupplementLog.user_id == user_id,
        DailySupplementLog.date == from_date_str
    ).all()

    for s in source_supps:
        db.add(DailySupplementLog(
            id=f"supp_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            date=to_date_str,
            name=s.name,
            dosage=s.dosage,
            timing=s.timing,
            scheduled_time=s.scheduled_time,
            status="pending",
            badge_emoji=s.badge_emoji
        ))

    db.commit()
    compute_and_save_daily_summary(db, user_id, to_date_str)
    return True


def create_meal_event(db: Session, user_id: int, data) -> DailyNutritionLog:
    """
    Creates a Schedulable Meal Event integrated with Temporal Event System (TES).
    Configures recurrence rules, reminders, auto-copy options, and links.
    """
    meal_id = f"meal_{int(datetime.utcnow().timestamp() * 1000)}_{uuid.uuid4().hex[:4]}"
    planned_start = _format_datetime(data.scheduled_date, data.scheduled_time)

    # 1. Map Recurrence Rule if applicable
    rec = data.recurrence
    freq = rec.frequency.upper() if rec else "NEVER"
    until_dt = None
    if rec and rec.until_date:
        try:
            until_dt = datetime.strptime(rec.until_date, "%Y-%m-%d")
        except Exception:
            pass

    recurrence_data = None
    if freq != "NEVER":
        from backend.schemas.temporal_event_system import EventRecurrenceRuleCreate
        by_wk = rec.by_weekday if rec else []
        if freq == "WEEKDAYS" and not by_wk:
            by_wk = ["MO", "TU", "WE", "TH", "FR"]
        elif freq == "WEEKENDS" and not by_wk:
            by_wk = ["SA", "SU"]
        elif freq in ["EVERY_MONDAY", "MONDAY"]:
            freq = "WEEKLY"
            by_wk = ["MO"]
        elif freq in ["EVERY_TUE_THU", "TUE_THU"]:
            freq = "WEEKLY"
            by_wk = ["TU", "TH"]
        elif freq == "CUSTOM" and not by_wk:
            freq = "WEEKLY"

        mapped_freq = "DAILY" if freq == "EVERY_X_DAYS" else freq
        if mapped_freq not in ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]:
            mapped_freq = "DAILY"

        recurrence_data = EventRecurrenceRuleCreate(
            frequency=mapped_freq,
            interval=rec.interval if rec else 1,
            by_weekday=by_wk,
            until_date=until_dt,
            count=rec.count if rec else None
        )

    # 2. Create TES Event
    tes_data = TemporalEventCreate(
        title=f"Meal: {data.name}",
        description=f"Category: {data.meal_category} | {data.calories} kcal | Protein: {data.protein}g | Notes: {data.notes or 'None'}",
        category="nutrition",
        event_type="meal",
        status=EventStatus.SCHEDULED,
        priority=EventPriority[data.priority.upper()] if hasattr(EventPriority, data.priority.upper()) else EventPriority.MEDIUM,
        source=EventSource.USER,
        planned_start_at=planned_start,
        duration_minutes=30,
        metadata_payload={
            "meal_id": meal_id,
            "meal_category": data.meal_category,
            "calories": data.calories,
            "protein": data.protein,
            "carbs": data.carbs,
            "fat": data.fat,
            "notes": data.notes,
            "auto_copy_flags": data.auto_copy_flags.dict() if hasattr(data.auto_copy_flags, "dict") else dict(data.auto_copy_flags),
            "linked_recipe_id": data.linked_recipe_id,
            "linked_supplements": data.linked_supplements,
            "reminder_offset_minutes": data.reminder_offset_minutes
        },
        tags=["nutrition", "meal", data.meal_category.lower()],
        recurrence_rule=recurrence_data
    )
    tes_event = TemporalEventService.create_event(db, user_id, tes_data)

    # 3. Create DailyNutritionLog entry
    meal = DailyNutritionLog(
        id=meal_id,
        user_id=user_id,
        date=data.scheduled_date,
        meal_category=data.meal_category,
        food_id=data.food_id,
        name=data.name,
        serving_multiplier=1.0,
        calories=data.calories,
        protein=data.protein,
        carbs=data.carbs,
        fat=data.fat,
        fiber=data.fiber,
        sodium_mg=data.sodium_mg,
        potassium_mg=data.potassium_mg,
        badge_emoji=data.badge_emoji,
        status="pending",
        scheduled_time=data.scheduled_time,
        notes=data.notes,
        auto_copy_flags=data.auto_copy_flags.dict() if hasattr(data.auto_copy_flags, "dict") else dict(data.auto_copy_flags),
        linked_recipe_id=data.linked_recipe_id,
        linked_supplements=data.linked_supplements,
        temporal_event_id=tes_event.id
    )
    db.add(meal)

    # 4. If linked supplements exist, auto-create supplement logs for the day if auto_copy_supplements is on
    auto_flags = data.auto_copy_flags.dict() if hasattr(data.auto_copy_flags, "dict") else dict(data.auto_copy_flags)
    if auto_flags.get("copy_supplements", True) and data.linked_supplements:
        for supp_name in data.linked_supplements:
            db.add(DailySupplementLog(
                id=f"supp_{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                date=data.scheduled_date,
                name=supp_name,
                dosage="1 serving",
                timing="With Meals",
                scheduled_time=data.scheduled_time,
                status="pending",
                badge_emoji="💊"
            ))

    db.commit()
    db.refresh(meal)

    compute_and_save_daily_summary(db, user_id, data.scheduled_date)
    return meal


def update_meal_event_series(db: Session, user_id: int, event_id: str, data) -> DailyNutritionLog:
    """
    Updates a meal event series or a single occurrence depending on data.scope.
    """
    meal = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.id == event_id,
        DailyNutritionLog.user_id == user_id
    ).first()

    if not meal:
        raise HTTPException(status_code=404, detail="Meal log not found.")

    scope = getattr(data, "scope", "THIS_OCCURRENCE")

    if scope == "THIS_OCCURRENCE" and meal.temporal_event_id:
        # If part of a recurrence rule, materialize exception date on master TES event
        tes_event = db.query(TemporalEvent).filter(TemporalEvent.id == meal.temporal_event_id).first()
        if tes_event and tes_event.recurrence_rule:
            ex_dates = list(tes_event.recurrence_rule.exception_dates or [])
            if meal.date not in ex_dates:
                ex_dates.append(meal.date)
                tes_event.recurrence_rule.exception_dates = ex_dates

    # Update Meal properties
    if data.name is not None:
        meal.name = data.name
    if data.meal_category is not None:
        meal.meal_category = data.meal_category
    if data.scheduled_time is not None:
        meal.scheduled_time = data.scheduled_time
    if data.calories is not None:
        meal.calories = data.calories
    if data.protein is not None:
        meal.protein = data.protein
    if data.carbs is not None:
        meal.carbs = data.carbs
    if data.fat is not None:
        meal.fat = data.fat
    if data.notes is not None:
        meal.notes = data.notes
    if data.status is not None:
        meal.status = data.status
        if data.status == "completed":
            meal.completed_at = datetime.utcnow().strftime("%I:%M %p")
        else:
            meal.completed_at = None

    if meal.temporal_event_id:
        tes_event = db.query(TemporalEvent).filter(TemporalEvent.id == meal.temporal_event_id).first()
        if tes_event:
            tes_event.title = f"Meal: {meal.name}"
            if data.scheduled_time:
                tes_event.planned_start_at = _format_datetime(meal.date, data.scheduled_time)
            if data.status:
                tes_event.status = EventStatus.COMPLETED.value if data.status == "completed" else EventStatus.SCHEDULED.value

    db.commit()
    db.refresh(meal)
    compute_and_save_daily_summary(db, user_id, meal.date)
    return meal


def copy_range_plans(db: Session, user_id: int, from_start: str, from_end: str, to_start: str) -> bool:
    """
    Copies a contiguous date range of meal & supplement plans to a target start date.
    e.g. Copying last week (7 days) to this week.
    """
    start_dt = datetime.strptime(from_start, "%Y-%m-%d")
    end_dt = datetime.strptime(from_end, "%Y-%m-%d")
    target_start_dt = datetime.strptime(to_start, "%Y-%m-%d")

    num_days = (end_dt - start_dt).days + 1
    if num_days <= 0 or num_days > 31:
        raise HTTPException(status_code=400, detail="Invalid date range for copy operation.")

    for i in range(num_days):
        cur_from_str = (start_dt + timedelta(days=i)).strftime("%Y-%m-%d")
        cur_to_str = (target_start_dt + timedelta(days=i)).strftime("%Y-%m-%d")
        copy_plan_to_date(db, user_id, cur_from_str, cur_to_str)

    return True


def get_timeline_indicators(db: Session, user_id: int, start_date_str: str, end_date_str: str) -> List[dict]:
    """
    Returns day-by-day indicator summaries for the interactive timeline date strip.
    """
    start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date_str, "%Y-%m-%d")
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    result = []
    curr = start_dt

    while curr <= end_dt:
        d_str = curr.strftime("%Y-%m-%d")
        seed_default_user_day_if_empty(db, user_id, d_str)

        meals = db.query(DailyNutritionLog).filter(
            DailyNutritionLog.user_id == user_id,
            DailyNutritionLog.date == d_str
        ).all()

        total = len(meals)
        completed = sum(1 for m in meals if m.status == "completed")
        missed = sum(1 for m in meals if m.status == "skipped" or (m.status == "pending" and d_str < today_str))

        has_reminders = any(m.scheduled_time for m in meals)
        has_recurring = any(m.temporal_event_id for m in meals)
        pct = (completed / total * 100.0) if total > 0 else 0.0

        result.append({
            "date": d_str,
            "is_today": d_str == today_str,
            "total_meals": total,
            "completed_meals": completed,
            "missed_meals": missed,
            "has_reminders": has_reminders,
            "has_recurring": has_recurring,
            "compliance_pct": round(pct, 1)
        })

        curr += timedelta(days=1)

    return result


def search_food_library(
    db: Session,
    user_id: int,
    query: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    only_favorites: bool = False,
    only_recents: bool = False
) -> dict:
    """
    Fast searchable food picker against backend 1,000+ food items database.
    Supports token substring matching, search keywords, aliases, regional names,
    favorite flags, and recent flags.
    """
    from backend.services.meals.food_seed import seed_food_items_if_empty
    seed_food_items_if_empty(db)

    # Get user favorite & recent food IDs
    fav_ids = set(f.food_id for f in db.query(FavoriteFood).filter(FavoriteFood.user_id == user_id).all())
    recent_ids = set(r.food_id for r in db.query(RecentFood).filter(RecentFood.user_id == user_id).all())

    q = db.query(FoodItem)

    if only_favorites:
        q = q.filter(FoodItem.id.in_(fav_ids))

    if only_recents:
        q = q.filter(FoodItem.id.in_(recent_ids))

    if category and category != "All":
        q = q.filter(FoodItem.category == category)

    if query and query.strip():
        search_term = f"%{query.strip().lower()}%"
        q = q.filter(
            (FoodItem.name.ilike(search_term)) |
            (FoodItem.regional_names.ilike(search_term)) |
            (FoodItem.brand.ilike(search_term)) |
            (FoodItem.category.ilike(search_term))
        )

    total_count = q.count()
    offset = (max(1, page) - 1) * limit
    foods = q.offset(offset).limit(limit).all()

    items = []
    for f in foods:
        items.append({
            "id": f.id,
            "name": f.name,
            "category": f.category,
            "serving_size": f.serving_size,
            "serving_weight_g": f.serving_weight_g or 100.0,
            "calories": f.calories,
            "protein_g": f.protein_g,
            "carbs_g": f.carbs_g,
            "net_carbs_g": f.net_carbs_g,
            "fat_g": f.fat_g,
            "sat_fat_g": f.sat_fat_g,
            "unsat_fat_g": f.unsat_fat_g,
            "fiber_g": f.fiber_g,
            "sugar_g": f.sugar_g,
            "sodium_mg": f.sodium_mg,
            "potassium_mg": f.potassium_mg,
            "calcium_mg": f.calcium_mg,
            "iron_mg": f.iron_mg,
            "vitamin_a_iu": f.vitamin_a_iu,
            "vitamin_c_mg": f.vitamin_c_mg,
            "vitamin_d_iu": f.vitamin_d_iu,
            "vitamin_b_complex_mg": f.vitamin_b_complex_mg,
            "magnesium_mg": f.magnesium_mg,
            "zinc_mg": f.zinc_mg,
            "phosphorus_mg": f.phosphorus_mg,
            "water_g": f.water_g,
            "cholesterol_mg": f.cholesterol_mg,
            "brand": f.brand or "Generic",
            "search_keywords": f.search_keywords or [],
            "aliases": f.aliases or [],
            "regional_names": f.regional_names or "",
            "badge_emoji": f.badge_emoji or "🥗",
            "verified": f.verified,
            "is_custom": f.is_custom,
            "is_favorite": f.id in fav_ids,
            "is_recent": f.id in recent_ids,
        })

    return {
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "items": items
    }


def toggle_favorite_food(db: Session, user_id: int, food_id: str) -> bool:
    """
    Toggles a food item as favorite for a user.
    """
    fav = db.query(FavoriteFood).filter(
        FavoriteFood.user_id == user_id,
        FavoriteFood.food_id == food_id
    ).first()

    if fav:
        db.delete(fav)
        db.commit()
        return False
    else:
        new_fav = FavoriteFood(
            id=f"fav_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            food_id=food_id
        )
        db.add(new_fav)
        db.commit()
        return True


def record_recent_food(db: Session, user_id: int, food_id: str):
    """
    Records or updates recent food usage count.
    """
    if not food_id:
        return
    rec = db.query(RecentFood).filter(
        RecentFood.user_id == user_id,
        RecentFood.food_id == food_id
    ).first()

    if rec:
        rec.last_used_at = datetime.utcnow()
        rec.frequency_count += 1
    else:
        db.add(RecentFood(
            id=f"rec_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            food_id=food_id,
            last_used_at=datetime.utcnow(),
            frequency_count=1
        ))
    db.commit()


def update_meal_item(
    db: Session,
    user_id: int,
    meal_id: str,
    serving_multiplier: Optional[float] = None,
    status: Optional[str] = None,
    meal_category: Optional[str] = None,
    scheduled_time: Optional[str] = None
) -> DailyNutritionLog:
    """
    Updates portion size multiplier, status, or timing of a logged meal and dynamically
    recalculates caloric & macronutrient totals based on linked FoodItem.
    """
    meal = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.id == meal_id,
        DailyNutritionLog.user_id == user_id
    ).first()

    if not meal:
        raise HTTPException(status_code=404, detail="Logged meal not found.")

    if serving_multiplier is not None and serving_multiplier > 0:
        old_mult = meal.serving_multiplier or 1.0
        ratio = serving_multiplier / old_mult
        meal.serving_multiplier = serving_multiplier
        meal.calories = int(round(meal.calories * ratio))
        meal.protein = round(meal.protein * ratio, 1)
        meal.carbs = round(meal.carbs * ratio, 1)
        meal.fat = round(meal.fat * ratio, 1)
        meal.fiber = round(meal.fiber * ratio, 1)
        meal.sodium_mg = round(meal.sodium_mg * ratio, 1)
        meal.potassium_mg = round(meal.potassium_mg * ratio, 1)

    if status:
        meal.status = status
        if status == "completed":
            meal.completed_at = datetime.utcnow().strftime("%I:%M %p")
        else:
            meal.completed_at = None

    if meal_category:
        meal.meal_category = meal_category

    if scheduled_time:
        meal.scheduled_time = scheduled_time

    if meal.temporal_event_id:
        tes_event = db.query(TemporalEvent).filter(TemporalEvent.id == meal.temporal_event_id).first()
        if tes_event:
            tes_event.title = f"Meal: {meal.name}"
            if scheduled_time:
                tes_event.planned_start_at = _format_datetime(meal.date, scheduled_time)
            if status:
                tes_event.status = EventStatus.COMPLETED.value if status == "completed" else EventStatus.SCHEDULED.value

    db.commit()
    db.refresh(meal)

    compute_and_save_daily_summary(db, user_id, meal.date)
    return meal


