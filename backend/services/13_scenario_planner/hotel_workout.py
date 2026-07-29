import importlib

t_mod = importlib.import_module("backend.services.13_scenario_planner.templates.travel")
le_mod = importlib.import_module("backend.services.13_scenario_planner.templates.low_equipment")

get_travel_workout_template = t_mod.get_travel_workout_template
get_low_equipment_template = le_mod.get_low_equipment_template

def generate_hotel_or_travel_workout(scenario_type: str, time_min: int = 20) -> dict:
    if scenario_type == "travel":
        base = get_travel_workout_template()
    else:
        base = get_low_equipment_template()

    if time_min < 20:
        base["exercises"] = base["exercises"][:2]
        base["description"] += " (Condensed 15-min Micro Version)"

    return base
