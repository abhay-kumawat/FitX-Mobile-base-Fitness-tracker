def get_travel_workout_template() -> dict:
    return {
        "scenario": "Travel Mode",
        "description": "Minimal space bodyweight & resistance band routine for hotel rooms.",
        "exercises": [
            {"name": "Bodyweight Tempo Pushups", "sets": 4, "reps": 15, "rest_sec": 45},
            {"name": "Bulgarian Split Squats (Bed Edge)", "sets": 3, "reps": 12, "rest_sec": 45},
            {"name": "Doorframe Incline Bodyweight Rows", "sets": 3, "reps": 12, "rest_sec": 45},
            {"name": "Plank Shoulder Taps", "sets": 3, "reps": 20, "rest_sec": 30}
        ]
    }
