def validate_goal_switch_input(new_goal: str, target_timeframe_weeks: int = 12) -> dict:
    valid_goals = ["hypertrophy", "strength", "endurance", "fat_loss", "athleticism"]
    clean_goal = new_goal.lower().strip()
    if clean_goal not in valid_goals:
        raise ValueError(f"Invalid goal '{new_goal}'. Must be one of {valid_goals}")
    return {
        "new_goal": clean_goal,
        "timeframe_weeks": max(4, min(52, target_timeframe_weeks)),
        "validated": True
    }
