def evaluate_deload_trigger(consecutive_weeks_high_load: int, average_recovery_score: float) -> dict:
    if consecutive_weeks_high_load >= 4 or average_recovery_score < 45.0:
        return {
            "trigger_deload": True,
            "volume_reduction_pct": 40.0,
            "intensity_reduction_pct": 20.0,
            "reason": f"System threshold reached ({consecutive_weeks_high_load} high-load weeks, average recovery {average_recovery_score}/100)."
        }
    return {
        "trigger_deload": False,
        "volume_reduction_pct": 0.0,
        "intensity_reduction_pct": 0.0,
        "reason": "Normal training phase."
    }
