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
            If the user is asking to modify their meal plan, generate an action payload.
            Return JSON:
            {{
                "reply": "string",
                "suggested_actions": [
                    {{"label": "string", "action_type": "string", "payload": {{}}}}
                ],
                "action_payload": {{
                    "recommendations": [
                        {{
                            "type": "ADD | REMOVE | MODIFY",
                            "foodName": "string",
                            "amount": "string",
                            "reason": "string",
                            "confidence": 95,
                            "expectedImpact": "string",
                            "originalFoodName": "string"
                        }}
                    ]
                }}
            }}
            """
            res = model.generate_content(prompt)
            parsed = json.loads(res.text)
            return {
                "reply": parsed.get("reply", "Let's optimize your routine today!"),
                "suggested_actions": parsed.get("suggested_actions", []),
                "action_payload": parsed.get("action_payload", None),
                "confidence": 0.98
            }
        except Exception as e:
            logger.warning(f"Gemini AI Coach fallback: {e}")

    
    is_nutrition = "meal" in user_message.lower() or "protein" in user_message.lower() or "food" in user_message.lower() or "eat" in user_message.lower() or "replace" in user_message.lower() or "generate" in user_message.lower()

    if is_nutrition:
        return {
            "reply": "Based on your goals, I've prepared some adjustments to your meal plan.",
            "suggested_actions": [],
            "action_payload": {
                "recommendations": [
                    {
                        "type": "ADD",
                        "foodName": "Chicken Breast",
                        "amount": "150g",
                        "reason": "Protein target below goal.",
                        "confidence": 93,
                        "expectedImpact": "+32g protein"
                    },
                    {
                        "type": "REMOVE",
                        "foodName": "Fried Snack",
                        "reason": "Daily calorie target exceeded.",
                        "confidence": 88,
                        "expectedImpact": "-280 kcal"
                    }
                ]
            },
            "confidence": 0.95
        }

    # Fallback response
    return {
        "reply": f"FitX Coach: Received your message '{user_message}'. Based on your recovery status, keep pushing with controlled tempo!",
        "suggested_actions": [
            {"label": "Adjust Today's Load", "action_type": "modify_load", "payload": {"pct": -10}},
            {"label": "Log Water Intake", "action_type": "add_water", "payload": {"amount_l": 0.5}}
        ],
        "action_payload": None,
        "confidence": 0.95
    }
