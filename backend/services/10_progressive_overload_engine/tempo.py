def get_tempo_guideline(goal: str, is_compound: bool) -> str:
    # Format: Eccentric - Isometric - Concentric - Explosive pause (e.g. 3-1-1-0)
    if goal == "hypertrophy":
        return "3-1-1-0" # 3s eccentric for max tension
    elif goal == "strength":
        return "2-1-X-0" # Explosive concentric
    elif goal == "endurance":
        return "2-0-2-0"
    return "3-1-1-0"
