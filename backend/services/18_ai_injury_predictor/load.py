def analyze_load_spike(current_week_volume: float, prior_4week_avg_volume: float) -> dict:
    if prior_4week_avg_volume == 0:
        return {"load_spike": False, "ratio": 1.0}
    
    ratio = current_week_volume / prior_4week_avg_volume
    is_spike = ratio > 1.35 # >35% acute-to-chronic workload ratio spike
    
    return {
        "load_spike": is_spike,
        "acwr_ratio": round(ratio, 2),
        "risk_contribution": "High" if is_spike else "Low"
    }
