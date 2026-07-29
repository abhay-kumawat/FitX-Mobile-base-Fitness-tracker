def correlate_sleep_with_injury_risk(avg_sleep_hours: float) -> dict:
    if avg_sleep_hours < 6.0:
        return {"risk_multiplier": 1.7, "factor": "Sleep deprivation increases tissue injury risk by 70%."}
    return {"risk_multiplier": 1.0, "factor": "Sleep duration adequate."}
