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
    Core AI Agent logic using Gemini. 
    1. Loads conversational memory (AIConversation, AIMessage)
    2. Performs RAG over User Profile, RecoveryScore
    3. Calls Gemini API to formulate response.
    4. Parses suggested actions.
    """
    from backend.models.models import AIConversation, AIMessage, Profile, RecoveryScore, WorkoutPlan, WorkoutDraft
    from backend.core.config import settings
    import json
    import google.generativeai as genai
    
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
    
    # 2. Gather RAG context
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    recovery = db.query(RecoveryScore).filter(RecoveryScore.user_id == user_id).order_by(RecoveryScore.id.desc()).first()
    
    context_str = f"User Goal: {profile.fitness_goal if profile else 'Unknown'}. Experience: {profile.experience_level if profile else 'Unknown'}. "
    context_str += f"Latest Recovery Score: {recovery.total_recovery_score if recovery else 'Unknown'}."

    reply_text = ""
    suggested_actions = []
    draft = None

    if settings.GEMINI_API_KEY:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            prompt = f"You are an elite AI personal trainer. Respond to the user's message considering their context. Context: {context_str}. User message: {message}. Keep the response concise, motivational, and actionable. At the end, output a JSON array of suggested actions in this exact format: JSON_ACTIONS=[{{\"label\": \"string\", \"action_type\": \"string\", \"target\": \"string\", \"replacement\": \"string\"}}]."
            
            response = model.generate_content(prompt)
            reply_text = response.text
            
            # Extract JSON
            if "JSON_ACTIONS=" in reply_text:
                parts = reply_text.split("JSON_ACTIONS=")
                reply_text = parts[0].strip()
                try:
                    actions_json = parts[1].strip()
                    if actions_json.endswith("`") or actions_json.endswith("```"):
                        actions_json = actions_json.replace("```json", "").replace("```", "").strip()
                    suggested_actions = json.loads(actions_json)
                except Exception:
                    pass
        except Exception as e:
            reply_text = f"I'm currently operating in offline mode. Based on your profile and recovery, I'd suggest focusing on your form and consistency. (Error: {str(e)})"
    else:
        # Fallback Heuristic Engine
        reply_text = f"I see you're asking about '{message}'. Based on your profile (Goal: {profile.fitness_goal if profile else 'Unknown'}) and recent recovery score ({recovery.total_recovery_score if recovery else 'N/A'}), I recommend adjusting your volume."
        if "shoulder" in message.lower() or "pain" in message.lower() or "add" in message.lower():
            reply_text = "I've drafted some changes to your workout plan to better suit your needs right now. Please review them."
            suggested_actions = [
                {"label": "Swap Bench Press -> Machine Press", "action_type": "replace_exercise", "target": "Bench Press", "replacement": "Machine Press"}
            ]

    # Handle Draft Generation logic if a plan is provided and actions exist
    if plan_id and suggested_actions:
        current_plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
        if current_plan:
            draft_data = dict(current_plan.workout_data)
            diff_data = {
                "added": [{"name": a.get("replacement"), "rationale": "AI Suggestion"} for a in suggested_actions if a.get("action_type") == "replace_exercise" and a.get("replacement")],
                "removed": [{"name": a.get("target"), "rationale": "AI Suggestion"} for a in suggested_actions if a.get("action_type") == "replace_exercise" and a.get("target")],
                "modified": []
            }
            draft = WorkoutDraft(
                user_id=user_id,
                plan_id=plan_id,
                name=f"AI Proposed Plan Revision",
                workout_data=draft_data,
                diff_data=diff_data,
                rationale="AI generated adjustment."
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

def propose_plan_diff(db: Session, user_id: int, current_exercises: list, request_type: str = "general") -> dict:
    """
    Generates a structured plan modification diff comparing Current Plan vs Proposed Plan vs Differences.
    """
    if "shoulder" in request_type.lower() or "pain" in request_type.lower():
        diff_data = {
            "added": [
                {"name": "Neutral-Grip Dumbbell Press", "rationale": "Reduces rotator cuff impingement and shoulder shear force"}
            ],
            "removed": [
                {"name": "Barbell Incline Bench Press", "rationale": "High shoulder joint compression during lower phase"}
            ],
            "modified": [
                {"name": "Cable Lateral Raises", "changes": ["Reduce weight by 15%", "Increase reps to 15"], "rationale": "Protect deltoid insertion tendons while maintaining stimulus"}
            ]
        }
    elif "leg" in request_type.lower() or "quad" in request_type.lower():
        diff_data = {
            "added": [
                {"name": "Bulgarian Split Squat", "rationale": "Isolates quad volume without heavy axial lumbar loading"}
            ],
            "removed": [
                {"name": "Barbell Back Squat", "rationale": "High lower back fatigue from yesterday's session"}
            ],
            "modified": [
                {"name": "Leg Press", "changes": ["Tempo: 3-1-1-0", "Rest: 120s"], "rationale": "Maximize quad hypertrophic tension curve"}
            ]
        }
    else:
        diff_data = {
            "added": [
                {"name": "Incline Dumbbell Flyes", "rationale": "Adds loaded stretch for upper chest hypertrophy"}
            ],
            "removed": [
                {"name": "Cable Crossovers", "rationale": "Lower activation profile for target goal"}
            ],
            "modified": [
                {"name": "Weighted Dips", "changes": ["Add +5kg weight plate", "Set count: 4"], "rationale": "Progressive overload threshold reached"}
            ]
        }
    return {
        "status": "success",
        "current_plan_count": len(current_exercises),
        "diff_data": diff_data
    }

def apply_plan_diff(db: Session, user_id: int, plan_id: int, diff_data: dict) -> dict:
    """
    Applies an approved AI plan diff to a WorkoutPlan in the database.
    """
    from backend.models.models import WorkoutPlan
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id, WorkoutPlan.user_id == user_id).first()
    if not plan:
        # Create a new plan if plan_id is not specified or 0
        plan = WorkoutPlan(
            user_id=user_id,
            name="AI Optimized Workout Plan",
            goal="Hypertrophy & Performance",
            planned_date=datetime.utcnow().strftime("%Y-%m-%d"),
            workout_data={"exercises": []}
        )
        db.add(plan)
        db.flush()

    current_data = plan.workout_data or {}
    exercises = current_data.get("exercises", [])

    # Process removals
    removed_names = [r["name"] for r in diff_data.get("removed", [])]
    exercises = [ex for ex in exercises if ex.get("name") not in removed_names]

    # Process additions
    for added in diff_data.get("added", []):
        exercises.append({
            "id": f"ex_{int(datetime.utcnow().timestamp())}_{len(exercises)}",
            "name": added["name"],
            "muscleTag": "Target Muscle",
            "formGuard": "AI Safe Tech Active",
            "tips": [added.get("rationale", "Follow optimal form")],
            "targetSets": 3,
            "sets": [
                {"setNumber": 1, "weightKg": 20, "reps": 10, "completed": False, "type": "work"},
                {"setNumber": 2, "weightKg": 25, "reps": 10, "completed": False, "type": "work"},
                {"setNumber": 3, "weightKg": 25, "reps": 8, "completed": False, "type": "work"}
            ]
        })

    plan.workout_data = {"exercises": exercises}
    db.commit()
    db.refresh(plan)

    return {
        "status": "applied",
        "plan_id": plan.id,
        "updated_exercise_count": len(exercises)
    }

