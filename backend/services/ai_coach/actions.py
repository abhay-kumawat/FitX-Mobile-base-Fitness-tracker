def execute_coach_action(action_type: str, payload: dict) -> dict:
    if action_type == "modify_load":
        return {"status": "executed", "message": f"Applied {payload.get('pct', -10)}% load adjustment to today's workout."}
    elif action_type == "add_water":
        return {"status": "executed", "message": f"Added {payload.get('amount_l', 0.5)}L to your daily hydration log."}
    return {"status": "acknowledged", "message": f"Action '{action_type}' processed successfully."}
