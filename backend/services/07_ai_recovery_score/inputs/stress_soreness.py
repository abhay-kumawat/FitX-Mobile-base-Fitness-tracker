def score_stress_soreness_component(stress_0_100: float, soreness_0_100: float) -> float:
    avg_strain = (stress_0_100 + soreness_0_100) / 2.0
    return max(0.0, 100.0 - avg_strain)
