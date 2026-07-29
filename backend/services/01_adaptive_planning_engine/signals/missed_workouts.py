def evaluate_missed_workouts(missed_count: int) -> dict:
    if missed_count >= 3:
        return {"action": "full_rebalance", "volume_reduction": 0.3, "recommendation": "Perform full body activation session to rebuild momentum."}
    elif missed_count >= 1:
        return {"action": "shift_schedule", "volume_reduction": 0.1, "recommendation": "Shift priority muscle groups to today's workout."}
    return {"action": "none", "volume_reduction": 0.0, "recommendation": "On schedule."}
