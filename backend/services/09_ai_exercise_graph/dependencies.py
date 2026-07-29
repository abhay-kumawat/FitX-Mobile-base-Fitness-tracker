def check_exercise_dependencies(exercise_id: str, user_completed_exercises: set, graph: dict) -> dict:
    node = graph.get(exercise_id)
    if not node:
        return {"unlocked": True, "missing_prerequisites": []}
    
    missing = [req for req in node.get("prerequisites", []) if req not in user_completed_exercises]
    return {
        "unlocked": len(missing) == 0,
        "missing_prerequisites": missing
    }
