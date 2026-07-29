def recalculate_weekly_load(calendar: list) -> float:
    total_load = sum(day.get("estimated_load", 50) for day in calendar)
    return round(total_load, 1)
