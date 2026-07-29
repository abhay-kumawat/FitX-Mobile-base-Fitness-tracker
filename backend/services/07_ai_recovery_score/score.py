import importlib

s_mod = importlib.import_module("backend.services.07_ai_recovery_score.inputs.sleep")
h_mod = importlib.import_module("backend.services.07_ai_recovery_score.inputs.hydration")
l_mod = importlib.import_module("backend.services.07_ai_recovery_score.inputs.workout_load")
hr_mod = importlib.import_module("backend.services.07_ai_recovery_score.inputs.heart_rate")
ss_mod = importlib.import_module("backend.services.07_ai_recovery_score.inputs.stress_soreness")

score_sleep_component = s_mod.score_sleep_component
score_hydration_component = h_mod.score_hydration_component
score_workout_load_component = l_mod.score_workout_load_component
score_heart_rate_component = hr_mod.score_heart_rate_component
score_stress_soreness_component = ss_mod.score_stress_soreness_component

def calculate_total_recovery_score(sleep_hrs: float, hydration_l: float, prior_load: float, resting_hr: int, stress: float, soreness: float) -> dict:
    s_score = score_sleep_component(sleep_hrs)
    h_score = score_hydration_component(hydration_l)
    l_score = score_workout_load_component(prior_load)
    hr_score = score_heart_rate_component(resting_hr)
    ss_score = score_stress_soreness_component(stress, soreness)

    total = (s_score * 0.30) + (h_score * 0.15) + (l_score * 0.20) + (hr_score * 0.15) + (ss_score * 0.20)
    total = round(total, 1)

    if total >= 80.0:
        status = "Optimal Readiness"
        rec = "You are fully primed for high intensity heavy compound training."
    elif total >= 60.0:
        status = "Moderate Readiness"
        rec = "Good condition. Maintain target volume but monitor fatigue."
    elif total >= 40.0:
        status = "Deload Needed"
        rec = "High strain detected. Auto-reducing volume by 25% and RPE by 1-2 points."
    else:
        status = "Critical Rest Required"
        rec = "Severe recovery deficit. Converting today to an active recovery/mobility session."

    return {
        "total_score": total,
        "status": status,
        "recommendation": rec,
        "breakdown": {
            "sleep_score": s_score,
            "hydration_score": h_score,
            "load_score": l_score,
            "heart_rate_score": hr_score,
            "stress_soreness_score": ss_score
        }
    }
