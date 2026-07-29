def filter_equipment_exercises(exercises: list, available: list) -> list:
    available_set = set(item.lower() for item in available)
    if "all" in available_set or "full_gym" in available_set:
        return exercises
    filtered = []
    for ex in exercises:
        required = ex.get("equipment_required", "bodyweight").lower()
        if required == "bodyweight" or required in available_set:
            filtered.append(ex)
        else:
            # Substitute with bodyweight or available equivalent
            ex_copy = dict(ex)
            ex_copy["name"] = f"Bodyweight / Dumbbell {ex['name']}"
            ex_copy["equipment_required"] = "bodyweight"
            filtered.append(ex_copy)
    return filtered
