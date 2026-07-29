def modify_workout_by_recovery(exercises: list, recovery_score: float) -> list:
    if recovery_score >= 80.0:
        return exercises
    
    modified = []
    for ex in exercises:
        ex_copy = dict(ex)
        if recovery_score < 40.0:
            ex_copy["sets"] = max(2, ex_copy.get("sets", 3) - 1)
            ex_copy["note"] = "Active recovery adjustment (Reduced sets & intensity)."
        elif recovery_score < 60.0:
            ex_copy["sets"] = max(2, ex_copy.get("sets", 3) - 1)
            ex_copy["note"] = "Moderate deload adjustment applied."
        modified.append(ex_copy)
        
    return modified
