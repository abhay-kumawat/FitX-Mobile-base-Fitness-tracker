def calculate_recovery_schedule_shift(recovery_score: float) -> int:
    # Returns days to shift (0 = today, 1 = shift by 1 day)
    if recovery_score < 40.0:
        return 1
    return 0
