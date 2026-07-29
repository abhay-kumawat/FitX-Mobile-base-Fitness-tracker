def calculate_next_weight(current_weight: float, rpe: float, is_compound: bool = True) -> float:
    # Smallest realistic increment: 2.5kg / 5lbs for compound, 1.25kg for isolation
    step = 2.5 if is_compound else 1.25
    
    if rpe <= 7.0:
        return current_weight + (step * 2)
    elif rpe <= 8.0:
        return current_weight + step
    elif rpe >= 9.5:
        # Near failure, keep weight stable
        return current_weight
    return current_weight
