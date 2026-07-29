from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.models.models import MuscleReadiness, WorkoutSet, OnboardingProfile, RecoveryScore

MUSCLE_GROUPS = [
    "chest", "back", "shoulders", "biceps", "triceps", "forearms", 
    "core", "glutes", "quads", "hamstrings", "calves", "neck", "lower_back"
]

def calculate_muscle_readiness(
    db: Session,
    user_id: int,
    manual_soreness: Dict[str, int] = None,
    sleep_hours: float = 7.5,
    hrv_ms: float = 65.0
) -> Dict[str, Any]:
    manual_soreness = manual_soreness or {}
    
    # Fetch user onboarding for injury history
    onboarding = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user_id).first()
    injury_history = onboarding.injury_history if onboarding and onboarding.injury_history else {}

    muscle_scores: List[Dict[str, Any]] = []
    recovered_list: List[str] = []
    recovering_list: List[str] = []
    total_score_sum = 0.0

    for muscle in MUSCLE_GROUPS:
        # Base recovery score (starts at 100%)
        readiness = 100.0
        
        # 1. Soreness deduction (1-10 scale)
        soreness_val = manual_soreness.get(muscle, 1)
        soreness_penalty = (soreness_val - 1) * 7.5 # up to 67.5% penalty for level 10
        readiness -= soreness_penalty

        # 2. Sleep impact
        if sleep_hours < 6.0:
            readiness -= 12.0
        elif sleep_hours >= 8.0:
            readiness += 5.0

        # 3. HRV impact
        if hrv_ms < 45.0:
            readiness -= 8.0
        elif hrv_ms > 70.0:
            readiness += 4.0

        # 4. Active Injury check
        if muscle in injury_history or any(muscle in k for k in injury_history.keys()):
            readiness -= 20.0

        # Clamp between 15% and 100%
        final_pct = max(15.0, min(100.0, round(readiness, 1)))
        total_score_sum += final_pct

        status = "Fully Recovered" if final_pct >= 85.0 else ("Recovering" if final_pct >= 55.0 else "Needs Rest")
        if final_pct >= 85.0:
            recovered_list.append(muscle.capitalize())
        else:
            recovering_list.append(muscle.capitalize())

        hours_to_full = round((100.0 - final_pct) * 0.48, 1) # ~48h scale

        muscle_scores.append({
            "muscle_name": muscle.capitalize(),
            "readiness_pct": final_pct,
            "last_worked_date": (datetime.utcnow() - timedelta(days=1 if final_pct < 85 else 3)).strftime("%Y-%m-%d"),
            "soreness_rating": soreness_val,
            "full_recovery_hours": hours_to_full,
            "status": status
        })

        # Save or update in database
        db_readiness = db.query(MuscleReadiness).filter(
            MuscleReadiness.user_id == user_id,
            MuscleReadiness.muscle_name == muscle
        ).first()

        if not db_readiness:
            db_readiness = MuscleReadiness(
                user_id=user_id,
                muscle_name=muscle,
                readiness_pct=final_pct,
                soreness_rating=soreness_val,
                full_recovery_hours=hours_to_full,
                breakdown_json={"sleep_hours": sleep_hours, "hrv": hrv_ms, "soreness": soreness_val}
            )
            db.add(db_readiness)
        else:
            db_readiness.readiness_pct = final_pct
            db_readiness.soreness_rating = soreness_val
            db_readiness.full_recovery_hours = hours_to_full
            db_readiness.updated_at = datetime.utcnow()

    db.commit()

    overall_avg = round(total_score_sum / len(MUSCLE_GROUPS), 1)

    # Generate AI Recovery Recommendations
    recommendations = []
    if overall_avg >= 85.0:
        recommendations.append("🔥 High Readiness: Prime condition for heavy compound PR attempts.")
        recommendations.append("💪 Push session or heavy legs recommended today.")
    elif overall_avg >= 60.0:
        recommendations.append("⚡ Moderate Readiness: Moderate volume hypertrophic training suitable.")
        recommendations.append("🧘 Perform 10-min foam rolling and dynamic warm-up before lifting.")
    else:
        recommendations.append("⚠️ Deload / Active Recovery Advised: High cumulative systemic fatigue.")
        recommendations.append("🚶 Recommended: 30-min brisk walk, mobility drills, cold shower, and 8+ hours sleep.")

    return {
        "overall_readiness_score": overall_avg,
        "recovered_muscles": recovered_list,
        "recovering_muscles": recovering_list,
        "muscle_scores": muscle_scores,
        "ai_recovery_recommendations": recommendations
    }
