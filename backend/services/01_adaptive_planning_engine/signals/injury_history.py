def process_injury_constraints(exercises: list, active_injuries: list) -> tuple[list, list]:
    injuries_set = set(inj.lower() for inj in active_injuries)
    safe_exercises = []
    modifications = []

    contraindications = {
        "shoulder": ["overhead press", "barbell bench press", "military press", "dips"],
        "knee": ["barbell back squat", "lunges", "jump squats", "leg press"],
        "lower_back": ["deadlift", "barbell row", "good mornings", "heavy squat"],
        "wrist": ["barbell curl", "pushups", "front squat"]
    }

    substitutions = {
        "overhead press": "DB Lateral Raise (Shoulder Friendly)",
        "barbell bench press": "Incline Dumbbell Press (Neutral Grip)",
        "barbell back squat": "Goblet Squat to Box",
        "deadlift": "Romanian Deadlift (Controlled Load)",
        "dips": "Chest Flyes"
    }

    for ex in exercises:
        ex_name = ex.get("name", "").lower()
        flagged = False
        for inj in injuries_set:
            forbidden = contraindications.get(inj, [])
            if any(f in ex_name for f in forbidden):
                flagged = True
                replacement_name = substitutions.get(ex.get("name", "").lower(), f"Safe Alternative for {ex['name']}")
                modifications.append({
                    "original": ex["name"],
                    "replaced_by": replacement_name,
                    "reason": f"Flagged due to active {inj} injury history."
                })
                ex_modified = dict(ex)
                ex_modified["name"] = replacement_name
                ex_modified["note"] = f"Adjusted for {inj} safety."
                safe_exercises.append(ex_modified)
                break
        if not flagged:
            safe_exercises.append(ex)

    return safe_exercises, modifications
