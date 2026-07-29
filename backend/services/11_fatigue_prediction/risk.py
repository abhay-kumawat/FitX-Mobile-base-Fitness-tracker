def evaluate_overtraining_risk(fatigue_map: dict) -> dict:
    max_fatigue = max(fatigue_map.values()) if fatigue_map else 0.0
    avg_fatigue = sum(fatigue_map.values()) / len(fatigue_map) if fatigue_map else 0.0

    if max_fatigue > 85.0 or avg_fatigue > 65.0:
        level = "HIGH"
        rec = "High risk of acute overtraining. Recommend active recovery or light mobility work."
    elif max_fatigue > 65.0 or avg_fatigue > 45.0:
        level = "MODERATE"
        rec = "Moderate fatigue accumulating. Keep rest periods adequate."
    else:
        level = "LOW"
        rec = "Fatigue levels are well managed."

    return {
        "risk_level": level,
        "max_body_part_fatigue": max_fatigue,
        "average_fatigue": round(avg_fatigue, 1),
        "recommendation": rec
    }
