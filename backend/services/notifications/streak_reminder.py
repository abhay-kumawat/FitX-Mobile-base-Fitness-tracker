def build_streak_reminder_notification(current_streak: int) -> dict:
    return {
        "title": "🔥 Don't Break Your Streak!",
        "body": f"You're on a {current_streak}-day streak! Even a 10-minute micro workout will keep your momentum alive today.",
        "type": "streak_reminder",
        "action_url": "/workout?mode=micro"
    }
