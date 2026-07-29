def build_adaptive_recommendation(rule_outputs: dict, modified_exercises: list, Modifications: list) -> dict:
    return {
        "status": "success",
        "adapted_plan_name": "Adaptive Hypertrophy & Safety Session",
        "intensity_factor": rule_outputs["final_intensity_multiplier"],
        "volume_modifier": rule_outputs["final_volume_modifier"],
        "active_warnings": rule_outputs["warnings"],
        "modifications": Modifications,
        "exercises": modified_exercises
    }
