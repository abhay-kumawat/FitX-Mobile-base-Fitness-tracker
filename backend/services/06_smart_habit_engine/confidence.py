def calculate_habit_confidence(total_days_logged: int, streak: int) -> float:
    base_confidence = min(0.95, (total_days_logged / 30.0) * 0.7 + (streak / 14.0) * 0.3)
    return round(max(0.1, base_confidence), 2)
