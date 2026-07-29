def detect_habit_patterns(workout_logs: list) -> dict:
    if not workout_logs:
        return {"pattern": "insufficient_data", "consistency": 0.0}
    
    total_scheduled = len(workout_logs)
    completed = sum(1 for log in workout_logs if log.get("completed", False))
    adherence = (completed / total_scheduled) * 100.0

    pattern = "consistent"
    if adherence < 50:
        pattern = "high_skip_rate"
    elif adherence < 75:
        pattern = "moderate_adherence"

    return {
        "pattern": pattern,
        "adherence_rate": round(adherence, 1),
        "total_tracked": total_scheduled,
        "completed": completed
    }
