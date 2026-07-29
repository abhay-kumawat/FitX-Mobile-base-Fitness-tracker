def analyze_missed_workout_reasons(missed_logs: list) -> dict:
    reasons = {}
    for log in missed_logs:
        r = log.get("reason", "lack_of_time")
        reasons[r] = reasons.get(r, 0) + 1
    return {
        "total_missed": len(missed_logs),
        "reason_breakdown": reasons
    }
