def evaluate_calorie_signal(calories_consumed: int, target_calories: int = 2200) -> dict:
    diff = calories_consumed - target_calories
    if diff < -600:
        return {"factor": 0.75, "glycogen_status": "depleted", "volume_modifier": -2, "note": "High calorie deficit. Reduced volume to prevent catabolism."}
    elif diff < -200:
        return {"factor": 0.9, "glycogen_status": "moderate", "volume_modifier": -1, "note": "Moderate deficit. Standard workout volume."}
    elif diff > 500:
        return {"factor": 1.1, "glycogen_status": "surplus", "volume_modifier": +1, "note": "Calorie surplus. Maximize hypertrophy potential."}
    return {"factor": 1.0, "glycogen_status": "balanced", "volume_modifier": 0, "note": "Calorie intake matches target."}
