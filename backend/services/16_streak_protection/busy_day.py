def evaluate_busy_day_trigger(available_time_minutes: int, schedule_overflow: bool) -> bool:
    return available_time_minutes < 25 or schedule_overflow
