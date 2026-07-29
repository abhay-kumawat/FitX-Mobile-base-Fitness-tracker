import importlib

dur_mod = importlib.import_module("backend.services.12_workout_simulator.modes.duration")
loc_mod = importlib.import_module("backend.services.12_workout_simulator.modes.location")

simulate_duration_constraint = dur_mod.simulate_duration_constraint
simulate_location_constraint = loc_mod.simulate_location_constraint

def regenerate_simulated_workout(base_exercises: list, target_duration_min: int, target_location: str) -> dict:
    dur_adapted = simulate_duration_constraint(base_exercises, target_duration_min)
    loc_adapted = simulate_location_constraint(dur_adapted, target_location)
    
    return {
        "simulated_duration_min": target_duration_min,
        "simulated_location": target_location,
        "exercise_count": len(loc_adapted),
        "exercises": loc_adapted
    }
