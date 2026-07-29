def score_sleep_component(hours: float) -> float:
    # Target 8.0 hours
    if hours >= 8.0:
        return 100.0
    elif hours >= 7.0:
        return 85.0
    elif hours >= 6.0:
        return 65.0
    elif hours >= 5.0:
        return 45.0
    return 25.0
