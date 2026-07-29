def calculate_next_reps(current_reps: int, rpe: float, target_range_max: int = 12) -> int:
    # If RPE <= 7, user had reps in reserve -> increase reps
    if rpe <= 7.0:
        return min(target_range_max, current_reps + 2)
    elif rpe <= 8.5:
        return min(target_range_max, current_reps + 1)
    elif rpe >= 9.5:
        # At failure -> maintain or drop rep to preserve form
        return max(4, current_reps)
    return current_reps
