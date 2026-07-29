import importlib

l_mod = importlib.import_module("backend.services.18_ai_injury_predictor.load")
sc_mod = importlib.import_module("backend.services.18_ai_injury_predictor.sleep_correlation")
hm_mod = importlib.import_module("backend.services.18_ai_injury_predictor.history_match")

analyze_load_spike = l_mod.analyze_load_spike
correlate_sleep_with_injury_risk = sc_mod.correlate_sleep_with_injury_risk
match_injury_history_patterns = hm_mod.match_injury_history_patterns

def generate_injury_warning_report(current_vol: float, avg_vol: float, sleep_hrs: float, injuries: list, exercises: list) -> dict:
    load_res = analyze_load_spike(current_vol, avg_vol)
    sleep_res = correlate_sleep_with_injury_risk(sleep_hrs)
    history_res = match_injury_history_patterns(injuries, exercises)

    risk_score = 15.0
    if load_res["load_spike"]:
        risk_score += 35.0
    if sleep_res["risk_multiplier"] > 1.0:
        risk_score += 25.0
    if history_res:
        risk_score += 20.0

    risk_score = min(100.0, risk_score)

    return {
        "injury_risk_score": round(risk_score, 1),
        "risk_level": "HIGH" if risk_score > 60 else ("MODERATE" if risk_score > 35 else "LOW"),
        "load_analysis": load_res,
        "sleep_analysis": sleep_res,
        "flagged_exercises": history_res,
        "preventative_action": "Reduce volume by 20% and add warm-up mobility sets." if risk_score > 50 else "Safe to proceed."
    }
