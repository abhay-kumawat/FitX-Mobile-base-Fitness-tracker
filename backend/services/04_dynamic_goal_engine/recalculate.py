def recalculate_program_parameters(new_goal: str, current_weight_kg: float, height_cm: float) -> dict:
    profiles = {
        "hypertrophy": {
            "rep_range": "8-12 reps",
            "intensity_pct_1rm": 75,
            "cardio_minutes_weekly": 60,
            "target_macro_ratio": {"protein": 0.35, "carbs": 0.45, "fat": 0.20},
            "calorie_surplus_deficit": +300
        },
        "strength": {
            "rep_range": "3-5 reps",
            "intensity_pct_1rm": 87.5,
            "cardio_minutes_weekly": 45,
            "target_macro_ratio": {"protein": 0.30, "carbs": 0.50, "fat": 0.20},
            "calorie_surplus_deficit": +400
        },
        "fat_loss": {
            "rep_range": "10-15 reps",
            "intensity_pct_1rm": 70,
            "cardio_minutes_weekly": 150,
            "target_macro_ratio": {"protein": 0.40, "carbs": 0.35, "fat": 0.25},
            "calorie_surplus_deficit": -500
        },
        "endurance": {
            "rep_range": "15-20 reps",
            "intensity_pct_1rm": 60,
            "cardio_minutes_weekly": 240,
            "target_macro_ratio": {"protein": 0.25, "carbs": 0.60, "fat": 0.15},
            "calorie_surplus_deficit": 0
        }
    }
    
    selected = profiles.get(new_goal, profiles["hypertrophy"])
    bmr = 10 * current_weight_kg + 6.25 * height_cm - 5 * 25 + 5 # Mifflin-St Jeor estimate
    tdee = bmr * 1.55
    target_calories = round(tdee + selected["calorie_surplus_deficit"])

    return {
        "new_goal": new_goal,
        "parameters": selected,
        "target_daily_calories": target_calories
    }
