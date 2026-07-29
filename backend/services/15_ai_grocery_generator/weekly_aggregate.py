def aggregate_weekly_ingredients(daily_meal_plans: list) -> dict:
    ingredient_counts = {}
    for day in daily_meal_plans:
        for meal in day.get("meals", []):
            rec_name = meal.get("recipe", {}).get("name", "Meal")
            # Deconstruct standard ingredients
            items = ["Oats (500g)", "Peanut Butter (1 jar)", "Bananas (1 bunch)", "Chicken Breast (1kg)", "Rice (1kg)", "Broccoli (2 heads)"]
            for item in items:
                ingredient_counts[item] = ingredient_counts.get(item, 0) + 1
    return ingredient_counts
