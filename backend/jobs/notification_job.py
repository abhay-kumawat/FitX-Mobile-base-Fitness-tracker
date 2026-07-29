import logging

logger = logging.getLogger("fitx.jobs.notification")

def run_notification_dispatch_job(user_id: int, notification_payload: dict):
    logger.info(f"Dispatching notification to user {user_id}: {notification_payload.get('title')}")
    return {"status": "dispatched"}
