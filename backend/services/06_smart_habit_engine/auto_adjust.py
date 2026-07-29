def auto_adjust_habit_goals(adherence_rate: float, current_frequency_days: int) -> dict:
    if adherence_rate < 50.0:
        new_freq = max(2, current_frequency_days - 1)
        return {
            "auto_adjusted": True,
            "new_frequency_days": new_freq,
            "rationale": f"Adherence is {adherence_rate}%. Lowering weekly frequency to {new_freq} days to rebuild habit momentum."
        }
    elif adherence_rate > 90.0:
        new_freq = min(6, current_frequency_days + 1)
        return {
            "auto_adjusted": True,
            "new_frequency_days": new_freq,
            "rationale": f"Excellent adherence ({adherence_rate}%). Increasing target to {new_freq} days/week."
        }
    return {
        "auto_adjusted": False,
        "new_frequency_days": current_frequency_days,
        "rationale": "Adherence rate is optimal. Maintaining schedule."
    }
