def score_workout_load_component(prior_load_score: float) -> float:
    # High prior load lowers recovery readiness score
    if prior_load_score > 85:
        return 40.0
    elif prior_load_score > 65:
        return 70.0
    elif prior_load_score > 40:
        return 90.0
    return 100.0
