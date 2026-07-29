def update_user_preferences(profile, goal: str, dietary_pref: str, daily_budget: float):
    profile.fitness_goal = goal
    profile.dietary_preference = dietary_pref
    profile.daily_meal_budget = daily_budget
    return profile
