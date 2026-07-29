def calculate_dynamic_rest_seconds(is_compound: bool, rpe: float, fatigue_score: float) -> int:
    base_rest = 120 if is_compound else 60
    if rpe >= 9.0:
        base_rest += 30
    if fatigue_score > 60:
        base_rest += 30
    return min(300, base_rest)
