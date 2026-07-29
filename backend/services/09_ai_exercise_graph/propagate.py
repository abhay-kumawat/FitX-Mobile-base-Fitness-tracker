def propagate_exercise_substitution(exercise_id: str, graph: dict, direction: str = "regression") -> str:
    node = graph.get(exercise_id)
    if not node:
        return exercise_id
    
    if direction == "regression":
        candidates = node.get("regressions", [])
        return candidates[0] if candidates else exercise_id
    elif direction == "progression":
        candidates = node.get("progressions", [])
        return candidates[0] if candidates else exercise_id
        
    return exercise_id
