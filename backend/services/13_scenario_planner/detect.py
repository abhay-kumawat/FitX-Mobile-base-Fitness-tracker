def detect_scenario_mode(user_location: str, available_equipment: list) -> str:
    if "hotel" in user_location.lower() or "travel" in user_location.lower():
        return "travel"
    elif len(available_equipment) <= 1:
        return "low_equipment"
    return "standard"
