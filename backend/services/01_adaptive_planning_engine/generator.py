import json
import logging
import importlib

from backend.core.config import settings

sleep_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.signals.sleep")
calories_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.signals.calories")
missed_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.signals.missed_workouts")
equipment_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.signals.equipment")
injury_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.signals.injury_history")
schedule_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.signals.schedule")
rules_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.rules")
recommend_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.recommend")

evaluate_sleep_signal = sleep_mod.evaluate_sleep_signal
evaluate_calorie_signal = calories_mod.evaluate_calorie_signal
evaluate_missed_workouts = missed_mod.evaluate_missed_workouts
filter_equipment_exercises = equipment_mod.filter_equipment_exercises
process_injury_constraints = injury_mod.process_injury_constraints
adapt_to_schedule = schedule_mod.adapt_to_schedule
apply_rule_engine = rules_mod.apply_rule_engine
build_adaptive_recommendation = recommend_mod.build_adaptive_recommendation

logger = logging.getLogger("fitx.adaptive_generator")

DEFAULT_EXERCISES = [
    {"name": "Barbell Bench Press", "category": "compound", "sets": 4, "reps": 8, "equipment_required": "barbell"},
    {"name": "Overhead Press", "category": "compound", "sets": 3, "reps": 10, "equipment_required": "barbell"},
    {"name": "Incline Dumbbell Flyes", "category": "isolation", "sets": 3, "reps": 12, "equipment_required": "dumbbells"},
    {"name": "Tricep Rope Pushdowns", "category": "isolation", "sets": 3, "reps": 15, "equipment_required": "cables"}
]

def generate_adaptive_workout_plan(signal_data: dict) -> dict:
    # 1. Gather signals
    sleep_sig = evaluate_sleep_signal(signal_data.get("sleep_hours", 7.5))
    cal_sig = evaluate_calorie_signal(signal_data.get("calories_consumed", 2200))
    missed_sig = evaluate_missed_workouts(signal_data.get("missed_workouts", 0))
    
    signals_summary = {
        "sleep": sleep_sig,
        "calories": cal_sig,
        "missed": missed_sig
    }

    # 2. Rule engine evaluation
    rule_results = apply_rule_engine(signals_summary)

    # 3. Apply physical constraints
    eq_filtered = filter_equipment_exercises(DEFAULT_EXERCISES, signal_data.get("available_equipment", ["dumbbells", "barbell"]))
    safe_exercises, mods = process_injury_constraints(eq_filtered, signal_data.get("active_injuries", []))
    final_exercises = adapt_to_schedule(safe_exercises, signal_data.get("schedule_minutes", 45))

    # 4. Attempt Gemini API Enhancement if configured
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            prompt = f"""
            You are FitX AI Adaptive Planning Engine.
            Given signals: {json.dumps(signals_summary)}
            Rule Output: {json.dumps(rule_results)}
            Initial Exercises: {json.dumps(final_exercises)}
            Return ONLY a valid JSON object matching this schema:
            {{
                "adapted_plan_name": "string",
                "ai_summary": "string",
                "exercises": [
                    {{"name": "string", "sets": int, "reps": int, "note": "string"}}
                ]
            }}
            """
            response = model.generate_content(prompt)
            parsed = json.loads(response.text)
            return {
                "status": "success",
                "adapted_plan_name": parsed.get("adapted_plan_name", "AI Adapted Session"),
                "ai_summary": parsed.get("ai_summary", "Plan tailored via Gemini AI."),
                "intensity_factor": rule_results["final_intensity_multiplier"],
                "volume_modifier": rule_results["final_volume_modifier"],
                "active_warnings": rule_results["warnings"],
                "modifications": mods,
                "exercises": parsed.get("exercises", final_exercises)
            }
        except Exception as e:
            logger.warning(f"Gemini API execution fallback to rule engine: {e}")

    # Fallback to pure rule-engine recommendation
    rec = build_adaptive_recommendation(rule_results, final_exercises, mods)
    rec["ai_summary"] = "Plan calculated using FitX Adaptive Heuristics Engine."
    return rec
