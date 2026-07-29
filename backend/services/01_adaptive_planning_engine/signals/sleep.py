def evaluate_sleep_signal(hours: float) -> dict:
    if hours < 5.0:
        return {"factor": 0.6, "intensity_reduction": 0.4, "note": "Severe sleep deficit detected. Reducing heavy compound intensity."}
    elif hours < 6.5:
        return {"factor": 0.8, "intensity_reduction": 0.2, "note": "Mild sleep deficit. Moderate load adjustment."}
    elif hours > 9.0:
        return {"factor": 1.05, "intensity_reduction": 0.0, "note": "High recovery sleep recorded. Readiness boosted."}
    return {"factor": 1.0, "intensity_reduction": 0.0, "note": "Optimal sleep duration."}
