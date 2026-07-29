def filter_by_region(recipes: list, region: str) -> list:
    r_clean = region.lower()
    matched = [r for r in recipes if r.get("region", "global").lower() in [r_clean, "global"]]
    return matched if matched else recipes
