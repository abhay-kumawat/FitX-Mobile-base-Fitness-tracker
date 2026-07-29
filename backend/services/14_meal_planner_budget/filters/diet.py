def filter_by_diet(recipes: list, dietary_pref: str) -> list:
    pref = dietary_pref.lower().strip()
    if pref in ["anything", "all"]:
        return recipes
    return [r for r in recipes if r.get("diet_type", "anything").lower() == pref]
