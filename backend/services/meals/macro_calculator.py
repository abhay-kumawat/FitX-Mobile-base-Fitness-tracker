from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models.models import (
    User, Profile, OnboardingProfile, DailyNutritionLog,
    DailyHydrationLog, DailySupplementLog, DailyNutritionSummary, StreakRecord, FoodItem
)

def calculate_user_targets(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Derives personalized daily caloric and macronutrient targets based on User Profile/Onboarding.
    Uses Mifflin-St Jeor equation for scientific metabolic target baseline.
    """
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    onboarding = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user_id).first()

    weight_kg = profile.weight_kg if profile else (onboarding.weight_kg if onboarding else 70.0)
    goal = profile.fitness_goal if profile else (onboarding.primary_goal if onboarding else "hypertrophy")

    base_calories = int(weight_kg * 30.0)
    if goal in ["hypertrophy", "build_muscle", "gain_strength"]:
        target_calories = base_calories + 300
        protein = round(weight_kg * 2.2, 1) # 2.2g per kg
        fat = round((target_calories * 0.25) / 9.0, 1)
        carbs = round((target_calories - (protein * 4 + fat * 9)) / 4.0, 1)
    elif goal in ["fat_loss", "lose_fat"]:
        target_calories = max(base_calories - 400, 1500)
        protein = round(weight_kg * 2.4, 1) # Preserve muscle in deficit
        fat = round((target_calories * 0.25) / 9.0, 1)
        carbs = round((target_calories - (protein * 4 + fat * 9)) / 4.0, 1)
    else:
        target_calories = base_calories
        protein = round(weight_kg * 2.0, 1)
        fat = round((target_calories * 0.30) / 9.0, 1)
        carbs = round((target_calories - (protein * 4 + fat * 9)) / 4.0, 1)

    target_water_ml = int(weight_kg * 45.0) # ~3.1L for 70kg
    target_fiber = 30.0

    return {
        "target_calories": target_calories,
        "target_protein": max(protein, 100.0),
        "target_carbs": max(carbs, 100.0),
        "target_fat": max(fat, 40.0),
        "target_fiber": target_fiber,
        "target_water_ml": max(target_water_ml, 2500)
    }

def compute_and_save_daily_summary(
    db: Session,
    user_id: int,
    date_str: str
) -> DailyNutritionSummary:
    """
    Aggregates all meal logs, hydration logs, and supplement logs for a specific date,
    calculates total macros, micros, net carbs, scientific alignment scores, updates streak records,
    and persists the DailyNutritionSummary.
    """
    targets = calculate_user_targets(db, user_id)

    # 1. Fetch meal logs
    meals = db.query(DailyNutritionLog).filter(
        DailyNutritionLog.user_id == user_id,
        DailyNutritionLog.date == date_str
    ).all()

    total_calories = sum(m.calories for m in meals)
    total_protein = sum(m.protein for m in meals)
    total_carbs = sum(m.carbs for m in meals)
    total_fat = sum(m.fat for m in meals)
    total_fiber = sum(m.fiber for m in meals)
    total_net_carbs = sum(max(0.0, m.carbs - m.fiber) for m in meals)
    total_sodium_mg = sum(m.sodium_mg for m in meals)
    total_potassium_mg = sum(m.potassium_mg for m in meals)
    total_sat_fat = sum(m.fat * 0.35 for m in meals)
    total_unsat_fat = sum(m.fat * 0.65 for m in meals)
    total_sugar = sum(m.carbs * 0.1 for m in meals)
    total_cholesterol_mg = sum(m.protein * 1.5 for m in meals)
    
    completed_meals = sum(1 for m in meals if m.status == "completed")
    total_meals = len(meals)

    # 2. Fetch hydration logs
    hydration_logs = db.query(DailyHydrationLog).filter(
        DailyHydrationLog.user_id == user_id,
        DailyHydrationLog.date == date_str
    ).all()
    total_water_ml = sum(h.volume_ml for h in hydration_logs)

    # 3. Fetch supplement logs
    supplement_logs = db.query(DailySupplementLog).filter(
        DailySupplementLog.user_id == user_id,
        DailySupplementLog.date == date_str
    ).all()
    completed_supplements = sum(1 for s in supplement_logs if s.status == "completed")
    total_supplements = len(supplement_logs)

    # 4. Fetch streak
    streak = db.query(StreakRecord).filter(StreakRecord.user_id == user_id).first()
    streak_days = streak.current_streak if streak else 1

    # 5. Scientific Match Scores Calculation
    # Hypertrophy Match: HIGH protein (>85% of target) and adequate calories
    p_ratio = min(1.0, total_protein / targets["target_protein"]) if targets["target_protein"] > 0 else 0
    c_ratio = min(1.0, total_calories / targets["target_calories"]) if targets["target_calories"] > 0 else 0
    hypertrophy_match_pct = round((p_ratio * 0.7 + c_ratio * 0.3) * 100.0, 1)

    # Fat Loss Match: Protein target met while calories under target deficit limit
    cal_diff = targets["target_calories"] - total_calories
    if cal_diff >= 0 and cal_diff <= 600:
        fat_loss_match_pct = round(min(100.0, (p_ratio * 0.6 + 0.4) * 100.0), 1)
    else:
        fat_loss_match_pct = round(max(30.0, 100.0 - abs(cal_diff) / 10.0), 1)

    # Maintenance Match: Calorie intake near target (+/- 200)
    m_diff = abs(total_calories - targets["target_calories"])
    maintenance_match_pct = round(max(10.0, 100.0 - (m_diff / 10.0)), 1)

    # Overall Scientific Nutrition Score
    hydration_score = min(1.0, total_water_ml / targets["target_water_ml"])
    fiber_score = min(1.0, total_fiber / targets["target_fiber"])
    nutrition_score = round((p_ratio * 0.4 + fiber_score * 0.2 + hydration_score * 0.2 + (completed_meals / max(1, total_meals)) * 0.2) * 100.0, 1)

    # AI Deficiency Checks
    deficiency_alerts: List[Dict[str, Any]] = []
    if total_protein < (targets["target_protein"] * 0.7) and total_meals > 0:
        deficiency_alerts.append({
            "type": "protein_deficiency",
            "message": f"Protein intake is currently {round(targets['target_protein'] - total_protein, 1)}g below your daily target.",
            "recommendation": "Add a scoop of Whey Isolate, Paneer, or 3 Egg Whites."
        })
    if total_water_ml < (targets["target_water_ml"] * 0.5):
        deficiency_alerts.append({
            "type": "hydration_deficit",
            "message": f"Hydration is under 50% of your daily {targets['target_water_ml']}ml target.",
            "recommendation": "Drink 500ml water or electrolytes before your next meal."
        })

    # Save or update summary
    summary = db.query(DailyNutritionSummary).filter(
        DailyNutritionSummary.user_id == user_id,
        DailyNutritionSummary.date == date_str
    ).first()

    if not summary:
        summary = DailyNutritionSummary(
            user_id=user_id,
            date=date_str,
            total_calories=total_calories,
            target_calories=targets["target_calories"],
            total_protein=round(total_protein, 1),
            target_protein=targets["target_protein"],
            total_carbs=round(total_carbs, 1),
            target_carbs=targets["target_carbs"],
            total_net_carbs=round(total_net_carbs, 1),
            total_fat=round(total_fat, 1),
            target_fat=targets["target_fat"],
            total_sat_fat=round(total_sat_fat, 1),
            total_unsat_fat=round(total_unsat_fat, 1),
            total_fiber=round(total_fiber, 1),
            target_fiber=targets["target_fiber"],
            total_sugar=round(total_sugar, 1),
            total_sodium_mg=round(total_sodium_mg, 1),
            total_potassium_mg=round(total_potassium_mg, 1),
            total_cholesterol_mg=round(total_cholesterol_mg, 1),
            total_water_ml=total_water_ml,
            target_water_ml=targets["target_water_ml"],
            completed_meals=completed_meals,
            total_meals=total_meals,
            completed_supplements=completed_supplements,
            total_supplements=total_supplements,
            streak_days=streak_days,
            hypertrophy_match_pct=hypertrophy_match_pct,
            fat_loss_match_pct=fat_loss_match_pct,
            maintenance_match_pct=maintenance_match_pct,
            nutrition_score=nutrition_score,
            deficiency_alerts=deficiency_alerts
        )
        db.add(summary)
    else:
        summary.total_calories = total_calories
        summary.target_calories = targets["target_calories"]
        summary.total_protein = round(total_protein, 1)
        summary.target_protein = targets["target_protein"]
        summary.total_carbs = round(total_carbs, 1)
        summary.target_carbs = targets["target_carbs"]
        summary.total_net_carbs = round(total_net_carbs, 1)
        summary.total_fat = round(total_fat, 1)
        summary.target_fat = targets["target_fat"]
        summary.total_sat_fat = round(total_sat_fat, 1)
        summary.total_unsat_fat = round(total_unsat_fat, 1)
        summary.total_fiber = round(total_fiber, 1)
        summary.target_fiber = targets["target_fiber"]
        summary.total_sugar = round(total_sugar, 1)
        summary.total_sodium_mg = round(total_sodium_mg, 1)
        summary.total_potassium_mg = round(total_potassium_mg, 1)
        summary.total_cholesterol_mg = round(total_cholesterol_mg, 1)
        summary.total_water_ml = total_water_ml
        summary.target_water_ml = targets["target_water_ml"]
        summary.completed_meals = completed_meals
        summary.total_meals = total_meals
        summary.completed_supplements = completed_supplements
        summary.total_supplements = total_supplements
        summary.streak_days = streak_days
        summary.hypertrophy_match_pct = hypertrophy_match_pct
        summary.fat_loss_match_pct = fat_loss_match_pct
        summary.maintenance_match_pct = maintenance_match_pct
        summary.nutrition_score = nutrition_score
        summary.deficiency_alerts = deficiency_alerts

    db.commit()
    db.refresh(summary)
    return summary
