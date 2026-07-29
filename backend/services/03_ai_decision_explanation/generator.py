import os

TEMPLATE_DIR = os.path.dirname(__file__)

def generate_decision_explanation(action: str, details: dict) -> str:
    if action == "remove":
        path = os.path.join(TEMPLATE_DIR, "templates", "remove.txt")
        if os.path.exists(path):
            with open(path, "r") as f:
                template = f.read()
            return template.format(
                exercise_name=details.get("exercise_name", "Exercise"),
                reason=details.get("reason", "Fatigue/Safety restriction"),
                body_part=details.get("body_part", "target muscle"),
                stress_reduction_pct=details.get("stress_reduction_pct", 35)
            )
    elif action == "replace":
        path = os.path.join(TEMPLATE_DIR, "templates", "replace.txt")
        if os.path.exists(path):
            with open(path, "r") as f:
                template = f.read()
            return template.format(
                original_exercise=details.get("original_exercise", "Original Exercise"),
                replacement_exercise=details.get("replacement_exercise", "Replacement Exercise"),
                reason=details.get("reason", "Biomechanical optimization"),
                body_part=details.get("body_part", "joint area")
            )
    
    return f"AI Decision Explanation: {action.upper()} executed based on user telemetry and readiness metrics."
