def calculate_next_sets(current_sets: int, fatigue_level: float, adherence_pct: float = 100.0) -> int:
    if fatigue_level > 70.0:
        return max(2, current_sets - 1)
    elif fatigue_level < 30.0 and adherence_pct >= 90.0:
        return min(5, current_sets + 1)
    return current_sets
