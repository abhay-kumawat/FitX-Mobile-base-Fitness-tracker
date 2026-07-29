def simulate_duration_constraint(exercises: list, max_duration_minutes: int) -> list:
    # Estimate 3 mins per set including rest
    available_sets = max_duration_minutes // 3
    adapted = []
    accumulated_sets = 0

    for ex in exercises:
        ex_sets = ex.get("sets", 3)
        if accumulated_sets + ex_sets <= available_sets:
            adapted.append(ex)
            accumulated_sets += ex_sets
        elif accumulated_sets < available_sets:
            ex_copy = dict(ex)
            ex_copy["sets"] = available_sets - accumulated_sets
            adapted.append(ex_copy)
            break

    return adapted if adapted else exercises[:1]
