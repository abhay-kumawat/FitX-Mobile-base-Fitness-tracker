from sqlalchemy.orm import Session
from datetime import datetime
from backend.models.models import WorkoutSession, RecoveryScore, User, AIWorkoutRecommendation

def generate_contextual_recommendations(db: Session, user_id: int, session_id: int = None) -> list:
    """
    Analyzes the user's current context (recovery score, recent skipped workouts, active session state)
    to generate real-time AI recommendations.
    """
    user = db.query(User).filter(User.id == user_id).first()
    recommendations = []

    # Example Check: Recovery Score
    latest_recovery = db.query(RecoveryScore).filter(RecoveryScore.user_id == user_id).order_by(RecoveryScore.id.desc()).first()
    
    if latest_recovery and latest_recovery.total_recovery_score < 40.0:
        recommendations.append({
            "context_type": "pre_workout",
            "message": f"Your recovery score is low ({latest_recovery.total_recovery_score}). Consider reducing intensity or switching to a mobility day.",
            "suggestion_data": {"action": "reduce_intensity", "value": -20}
        })

    # Example Check: Session state (if during workout)
    if session_id:
        session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
        if session and session.duration_seconds > 3600: # Over an hour
            recommendations.append({
                "context_type": "session",
                "message": "You've been working out for over an hour. Consider wrapping up soon to prevent excess cortisol buildup.",
                "suggestion_data": {"action": "wrap_up"}
            })
            
    # Persist these recommendations to the database if they don't already exist for this session
    persisted_recs = []
    for rec in recommendations:
        # Prevent spamming the same message
        existing = db.query(AIWorkoutRecommendation).filter(
            AIWorkoutRecommendation.user_id == user_id,
            AIWorkoutRecommendation.session_id == session_id,
            AIWorkoutRecommendation.message == rec["message"]
        ).first()
        
        if not existing:
            new_rec = AIWorkoutRecommendation(
                user_id=user_id,
                session_id=session_id,
                context_type=rec["context_type"],
                message=rec["message"],
                suggestion_data=rec["suggestion_data"]
            )
            db.add(new_rec)
            persisted_recs.append(new_rec)
    
    db.commit()
    return persisted_recs
