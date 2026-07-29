def get_low_equipment_template() -> dict:
    return {
        "scenario": "Low Equipment Mode",
        "description": "Dumbbell-only hypertrophy routine.",
        "exercises": [
            {"name": "Dumbbell Goblet Squat", "sets": 4, "reps": 10, "rest_sec": 60},
            {"name": "Dumbbell Floor Press", "sets": 4, "reps": 10, "rest_sec": 60},
            {"name": "Single-Arm Dumbbell Row", "sets": 4, "reps": 12, "rest_sec": 60},
            {"name": "Dumbbell Romanian Deadlift", "sets": 3, "reps": 12, "rest_sec": 60}
        ]
    }
