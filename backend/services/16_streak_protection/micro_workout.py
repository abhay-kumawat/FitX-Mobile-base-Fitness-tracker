def generate_streak_saver_micro_workout(available_minutes: int = 15) -> dict:
    return {
        "title": "Streak-Saver Micro Workout (EMOM)",
        "duration_minutes": min(20, max(10, available_minutes)),
        "streak_protected": True,
        "format": "Every Minute On The Minute for 12 Minutes",
        "exercises": [
            {"minute": "Min 1", "exercise": "Bodyweight Squats", "target": "15 reps"},
            {"minute": "Min 2", "exercise": "Pushups", "target": "12 reps"},
            {"minute": "Min 3", "exercise": "High Knees", "target": "40 seconds"},
            {"minute": "Min 4", "exercise": "Plank Hold", "target": "45 seconds"}
        ],
        "message": "Complete this 12-minute micro workout to maintain your daily streak without overtaxing your recovery!"
    }
