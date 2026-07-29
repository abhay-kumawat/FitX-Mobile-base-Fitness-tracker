import importlib

rs_mod = importlib.import_module("backend.services.17_smart_calendar.dependencies.recovery_shift")
calculate_recovery_schedule_shift = rs_mod.calculate_recovery_schedule_shift

def reschedule_calendar_events(weekly_calendar: list, recovery_score: float) -> dict:
    shift_days = calculate_recovery_schedule_shift(recovery_score)
    if shift_days == 0:
        return {"rescheduled": False, "calendar": weekly_calendar}

    new_calendar = []
    for day in weekly_calendar:
        d_copy = dict(day)
        if d_copy.get("type") == "heavy_workout":
            d_copy["type"] = "active_recovery"
            d_copy["title"] = "Rest & Recovery (Auto-shifted)"
        new_calendar.append(d_copy)

    return {
        "rescheduled": True,
        "shift_days": shift_days,
        "calendar": new_calendar,
        "rationale": f"Auto-shifted heavy workout by {shift_days} day due to recovery readiness score ({recovery_score})."
    }
