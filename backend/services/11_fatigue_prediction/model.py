def predict_fatigue_distribution(recent_workouts: list, recovery_score: float) -> dict:
    body_part_fatigue = {
        "shoulders": 20.0,
        "chest": 25.0,
        "back": 15.0,
        "legs": 35.0,
        "core": 10.0,
        "arms": 20.0
    }
    
    # Scale fatigue by volume and inverse of recovery score
    fatigue_scalar = max(0.8, (100.0 - recovery_score) / 50.0)
    
    for bp in body_part_fatigue:
        body_part_fatigue[bp] = min(100.0, round(body_part_fatigue[bp] * fatigue_scalar, 1))

    return body_part_fatigue
