def detect_muscle_group_conflicts(scheduled_exercises: list, fatigue_states: dict) -> list:
    conflicts = []
    for ex in scheduled_exercises:
        target = ex.get("target_muscle", "chest").lower()
        if fatigue_states.get(target, 0) > 75:
            conflicts.append({
                "exercise": ex["name"],
                "muscle_group": target,
                "fatigue_level": fatigue_states[target],
                "conflict_type": "high_muscle_fatigue",
                "recommendation": f"Avoid heavy work on {target}. Muscle fatigue level is high ({fatigue_states[target]}%)."
            })
    return conflicts
