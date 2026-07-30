from sqlalchemy.orm import Session
from datetime import datetime
from backend.models.models import WorkoutSession, RecoveryScore, User, AIWorkoutRecommendation

def generate_contextual_recommendations(db: Session, user_id: int, session_id: int = None) -> list:
    """
    Analyzes the user's current context (recovery score, recent skipped workouts, active session state)
    to generate real-time AI recommendations. Includes RAG-style evidence and confidence scores.
    """
    user = db.query(User).filter(User.id == user_id).first()
    recommendations = []

    # Example Check: Recovery Score
    latest_recovery = db.query(RecoveryScore).filter(RecoveryScore.user_id == user_id).order_by(RecoveryScore.id.desc()).first()
    
    if latest_recovery and latest_recovery.total_recovery_score < 40.0:
        recommendations.append({
            "context_type": "pre_workout",
            "message": f"Your recovery score is low ({latest_recovery.total_recovery_score}). Consider reducing intensity or switching to a mobility day.",
            "suggestion_data": {"action": "reduce_intensity", "value": -20},
            "confidence_score": 0.88,
            "evidence_sources": [
                f"Latest recovery score dropped to {latest_recovery.total_recovery_score} / 100",
                "Sleep metrics indicate poor restorative sleep."
            ]
        })

    # Example Check: Session state (if during workout)
    if session_id:
        session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
        if session and session.duration_seconds > 3600: # Over an hour
            recommendations.append({
                "context_type": "session",
                "message": "You've been working out for over an hour. Consider wrapping up soon to prevent excess cortisol buildup.",
                "suggestion_data": {"action": "wrap_up"},
                "confidence_score": 0.95,
                "evidence_sources": [
                    f"Current session duration exceeded {session.duration_seconds // 60} minutes.",
                    "Historical data shows performance drops rapidly after 60 minutes."
                ]
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
                suggestion_data=rec["suggestion_data"],
                confidence_score=rec.get("confidence_score", 0.9),
                evidence_sources=rec.get("evidence_sources", [])
            )
            db.add(new_rec)
            persisted_recs.append(new_rec)
    
    db.commit()
    return persisted_recs

def process_coach_chat(db: Session, user_id: int, message: str, plan_id: int = None) -> dict:
    """
    Core AI Agent logic. 
    1. Loads conversational memory (AIConversation, AIMessage)
    2. Performs RAG over User Profile, RecoveryScore, FatigueLogs, WorkoutSessions
    3. Returns natural language reply + structured proposed changes as a WorkoutDraft.
    """
    from backend.models.models import AIConversation, AIMessage, Profile, RecoveryScore, WorkoutPlan, WorkoutDraft
    import json
    
    # 1. Fetch or create active conversation
    conv = db.query(AIConversation).filter(AIConversation.user_id == user_id).order_by(AIConversation.id.desc()).first()
    if not conv:
        conv = AIConversation(user_id=user_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        
    # Log user message
    user_msg = AIMessage(conversation_id=conv.id, sender="user", text=message)
    db.add(user_msg)
    
    # 2. Gather RAG context (Mocking the embeddings retrieval for now, grabbing raw DB state)
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    recovery = db.query(RecoveryScore).filter(RecoveryScore.user_id == user_id).order_by(RecoveryScore.id.desc()).first()
    
    # 3. Formulate response (Simulated LLM Generation)
    reply_text = f"I see you're asking about '{message}'. Based on your profile (Goal: {profile.fitness_goal if profile else 'Unknown'}) and recent recovery score ({recovery.total_recovery_score if recovery else 'N/A'}), I recommend adjusting your volume."
    
    draft = None
    suggested_actions = []
    
    # Simple trigger logic for demonstration of Workspace mode structured data
    if "shoulder" in message.lower() or "pain" in message.lower() or "add" in message.lower():
        reply_text = "I've drafted some changes to your workout plan to better suit your needs right now. Please review them."
        suggested_actions = [
            {"label": "Swap Bench Press -> Machine Press", "action_type": "replace_exercise", "target": "Bench Press", "replacement": "Machine Press"}
        ]
        if plan_id:
            # Load current plan to generate diff
            current_plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
            if current_plan:
                # Mock generating a draft based on user input
                draft_data = dict(current_plan.workout_data)
                diff_data = {
                    "added": [{"name": "Machine Press", "rationale": "Easier on shoulders"}],
                    "removed": [{"name": "Bench Press", "rationale": "Causes shoulder pain"}],
                    "modified": []
                }
                draft = WorkoutDraft(
                    user_id=user_id,
                    plan_id=plan_id,
                    name=f"Proposed Plan Revision",
                    workout_data=draft_data,
                    diff_data=diff_data,
                    rationale="Adjusted due to reported shoulder pain."
                )
                db.add(draft)
                db.commit()
                db.refresh(draft)
        
    coach_msg = AIMessage(
        conversation_id=conv.id, 
        sender="coach", 
        text=reply_text, 
        suggested_actions=suggested_actions
    )
    db.add(coach_msg)
    db.commit()
    
    return {
        "reply": reply_text,
        "draft_id": draft.id if draft else None,
        "diff_data": draft.diff_data if draft else None,
        "suggested_actions": suggested_actions,
        "confidence": 0.94
    }
