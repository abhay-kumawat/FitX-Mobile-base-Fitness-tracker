def generate_weekly_performance_summary(user_id: int, streak: int, avg_recovery: float, workouts_completed: int) -> dict:
    return {
        "user_id": user_id,
        "week_label": "Week 28",
        "current_streak_days": streak,
        "average_recovery_score": avg_recovery,
        "workouts_completed": workouts_completed,
        "volume_lifted_kg": 18450,
        "calories_burned": 2850,
        "ai_coach_verdict": "Outstanding progression! Recovery readiness matched your high-volume squat session perfectly."
    }
