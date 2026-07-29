def match_injury_history_patterns(active_injuries: list, proposed_exercises: list) -> list:
    flagged = []
    for ex in proposed_exercises:
        ex_name = ex.get("name", "").lower()
        for inj in active_injuries:
            if inj.lower() in ex_name or ("shoulder" in inj.lower() and "press" in ex_name):
                flagged.append({"exercise": ex["name"], "matched_injury": inj})
    return flagged
