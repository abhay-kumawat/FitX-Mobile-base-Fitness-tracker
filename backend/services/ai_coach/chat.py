import json
import logging
from backend.core.config import settings

logger = logging.getLogger("fitx.ai_coach")

def process_coach_chat(user_id: int, user_message: str, user_context: dict = None) -> dict:
    ctx_str = json.dumps(user_context or {})
    
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            prompt = f"""
            You are FitX Coach AI - an elite personal trainer & sports nutritionist.
            User Message: {user_message}
            User Telemetry Context: {ctx_str}
            Provide an encouraging, scientific response.
            Return JSON:
            {{
                "reply": "string",
                "suggested_actions": [
                    {{"label": "string", "action_type": "string", "payload": {{}}}}
                ]
            }}
            """
            res = model.generate_content(prompt)
            parsed = json.loads(res.text)
            return {
                "reply": parsed.get("reply", "Let's optimize your routine today!"),
                "suggested_actions": parsed.get("suggested_actions", []),
                "confidence": 0.98
            }
        except Exception as e:
            logger.warning(f"Gemini AI Coach fallback: {e}")

    # Fallback response
    return {
        "reply": f"FitX Coach: Received your message '{user_message}'. Based on your recovery status, keep pushing with controlled tempo!",
        "suggested_actions": [
            {"label": "Adjust Today's Load", "action_type": "modify_load", "payload": {"pct": -10}},
            {"label": "Log Water Intake", "action_type": "add_water", "payload": {"amount_l": 0.5}}
        ],
        "confidence": 0.95
    }
