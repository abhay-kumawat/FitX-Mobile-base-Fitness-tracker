def format_goal_history(history_events: list) -> list:
    return [
        {
            "switched_at": evt.get("timestamp"),
            "from_goal": evt.get("from_goal"),
            "to_goal": evt.get("to_goal"),
            "reason": evt.get("reason", "User initiated preference update")
        }
        for evt in history_events
    ]
