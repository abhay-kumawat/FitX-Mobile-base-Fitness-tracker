def analyze_fatigue_contributing_factors(sleep_hours: float, stress: float, acute_volume: float) -> list:
    factors = []
    if sleep_hours < 6.0:
        factors.append({"factor": "Sleep Deprivation", "impact": "High", "contribution_pct": 40})
    if stress > 65.0:
        factors.append({"factor": "Elevated Cortisol/Stress", "impact": "Moderate", "contribution_pct": 30})
    if acute_volume > 15000:
        factors.append({"factor": "High Acute Volume Spike", "impact": "High", "contribution_pct": 30})
    return factors
