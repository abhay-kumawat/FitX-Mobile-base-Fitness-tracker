def create_workout_version(plan_data: dict, change_summary: str, rationale: str, current_version: int = 1) -> dict:
    new_version = current_version + 1
    return {
        "version": new_version,
        "change_summary": change_summary,
        "rationale": rationale,
        "plan_data": plan_data,
        "diff": {
            "added": plan_data.get("added_exercises", []),
            "removed": plan_data.get("removed_exercises", []),
            "modified": plan_data.get("modified_exercises", [])
        }
    }
