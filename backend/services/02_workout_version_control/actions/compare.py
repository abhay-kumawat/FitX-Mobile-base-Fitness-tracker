def compare_workout_versions(v1_data: dict, v2_data: dict) -> dict:
    ex1 = {ex["name"]: ex for ex in v1_data.get("exercises", [])}
    ex2 = {ex["name"]: ex for ex in v2_data.get("exercises", [])}

    added = [name for name in ex2 if name not in ex1]
    removed = [name for name in ex1 if name not in ex2]
    modified = []

    for name in ex1:
        if name in ex2:
            if ex1[name] != ex2[name]:
                modified.append({
                    "exercise": name,
                    "before": ex1[name],
                    "after": ex2[name]
                })

    return {
        "v1_version": v1_data.get("version", 1),
        "v2_version": v2_data.get("version", 2),
        "added_count": len(added),
        "removed_count": len(removed),
        "modified_count": len(modified),
        "added": added,
        "removed": removed,
        "modified": modified
    }
