import logging
import importlib

logger = logging.getLogger("fitx.jobs.plan_generate")

gen_mod = importlib.import_module("backend.services.01_adaptive_planning_engine.generator")
generate_adaptive_workout_plan = gen_mod.generate_adaptive_workout_plan

def run_plan_generate_background_job(user_id: int, signal_data: dict) -> dict:
    logger.info(f"Triggered async plan generation job for user {user_id}...")
    plan = generate_adaptive_workout_plan(signal_data)
    logger.info("Plan generation completed.")
    return plan
