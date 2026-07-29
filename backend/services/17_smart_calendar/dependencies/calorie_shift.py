def adjust_nutrition_for_workout_shift(shifted_days: int, target_calories: int) -> dict:
    if shifted_days > 0:
        return {
            "today_calorie_target": target_calories - 300, # Lower target on rest/shifted day
            "shifted_day_calorie_target": target_calories + 300,
            "note": "Rebalanced nutrition macros to align higher carbs with heavy workout day."
        }
    return {
        "today_calorie_target": target_calories,
        "note": "Standard nutrition targets."
    }
