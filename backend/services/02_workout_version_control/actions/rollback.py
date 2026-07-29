def rollback_workout_version(history_records: list, target_version: int) -> dict:
    target = None
    for record in history_records:
        if record.get("version") == target_version:
            target = record
            break
    if not target:
        raise ValueError(f"Version {target_version} not found in version history.")
    
    return {
        "status": "rolled_back",
        "target_version": target_version,
        "restored_plan_data": target.get("plan_data", {}),
        "rollback_rationale": f"Reverted to stable version {target_version} per user request."
    }
