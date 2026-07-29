import logging
from datetime import datetime

logger = logging.getLogger("fitx.ai_decision_logger")

def log_ai_decision(user_id: int, action: str, explanation: str):
    log_entry = {
        "user_id": user_id,
        "action": action,
        "explanation": explanation,
        "timestamp": datetime.utcnow().isoformat()
    }
    logger.info(f"AI Decision Audit Log: {log_entry}")
    return log_entry
