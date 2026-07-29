def filter_by_budget(recipes: list, max_daily_budget: float) -> list:
    return [r for r in recipes if r.get("cost_per_serving", 0.0) * 3 <= max_daily_budget]
