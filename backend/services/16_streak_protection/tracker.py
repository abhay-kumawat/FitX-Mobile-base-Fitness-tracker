def update_streak_tracker(current_streak: int, highest_streak: int, is_micro_workout: bool = False) -> dict:
    new_streak = current_streak + 1
    new_highest = max(highest_streak, new_streak)
    return {
        "current_streak": new_streak,
        "highest_streak": new_highest,
        "protected_via_micro_workout": is_micro_workout,
        "badge": "🔥 Flame Keeper" if new_streak >= 7 else "⚡ Momentum Builder"
    }
