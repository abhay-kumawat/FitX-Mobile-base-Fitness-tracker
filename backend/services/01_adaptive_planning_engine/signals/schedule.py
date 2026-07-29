def adapt_to_schedule(exercises: list, total_minutes: int) -> list:
    if total_minutes >= 60:
        return exercises
    elif total_minutes >= 30:
        # Keep key compound movements, drop isolation
        return [ex for ex in exercises if ex.get("category", "compound") == "compound"][:4]
    else:
        # Micro workout mode: top 2 high-yield movements
        return exercises[:2]
