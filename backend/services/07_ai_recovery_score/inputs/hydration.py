def score_hydration_component(liters: float) -> float:
    # Target 3.0 liters
    if liters >= 3.0:
        return 100.0
    elif liters >= 2.0:
        return 80.0
    elif liters >= 1.5:
        return 60.0
    return 35.0
