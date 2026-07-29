def score_heart_rate_component(resting_hr: int, baseline_hr: int = 60) -> float:
    diff = resting_hr - baseline_hr
    if diff <= 0:
        return 100.0
    elif diff <= 5:
        return 85.0
    elif diff <= 10:
        return 65.0
    return 40.0
