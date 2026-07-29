def detect_injury_exercise_conflicts(exercises: list, active_injuries: list) -> list:
    conflicts = []
    injury_map = {
        "shoulder": ["overhead press", "barbell bench press", "dips"],
        "knee": ["squat", "lunge", "leg extension"],
        "back": ["deadlift", "bent over row", "good morning"]
    }
    
    for ex in exercises:
        ex_name = ex.get("name", "").lower()
        for inj in active_injuries:
            forbidden = injury_map.get(inj.lower(), [])
            if any(f in ex_name for f in forbidden):
                conflicts.append({
                    "exercise": ex["name"],
                    "injury": inj,
                    "risk_level": "HIGH",
                    "action_required": "Replace or remove exercise immediately."
                })
    return conflicts
