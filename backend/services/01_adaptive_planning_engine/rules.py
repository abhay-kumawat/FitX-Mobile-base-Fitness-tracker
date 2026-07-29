def apply_rule_engine(signals: dict) -> dict:
    intensity_multiplier = 1.0
    volume_modifier = 0
    warnings = []

    sleep_res = signals.get("sleep", {})
    if sleep_res.get("factor", 1.0) < 0.8:
        intensity_multiplier *= sleep_res.get("factor", 0.8)
        warnings.append(sleep_res.get("note"))

    cal_res = signals.get("calories", {})
    if cal_res.get("volume_modifier", 0) != 0:
        volume_modifier += cal_res.get("volume_modifier", 0)
        warnings.append(cal_res.get("note"))

    missed_res = signals.get("missed", {})
    if missed_res.get("action") == "full_rebalance":
        intensity_multiplier *= 0.85
        warnings.append(missed_res.get("recommendation"))

    return {
        "final_intensity_multiplier": round(intensity_multiplier, 2),
        "final_volume_modifier": volume_modifier,
        "warnings": warnings
    }
