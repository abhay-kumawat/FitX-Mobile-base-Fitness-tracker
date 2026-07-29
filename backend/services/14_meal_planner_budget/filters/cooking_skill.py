def filter_by_cooking_skill(recipes: list, skill_level: str) -> list:
    skill = skill_level.lower()
    if skill == "beginner":
        return [r for r in recipes if r.get("difficulty", "easy").lower() in ["easy", "beginner"]]
    return recipes
