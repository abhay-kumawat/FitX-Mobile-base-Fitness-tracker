import logging

logger = logging.getLogger("fitx.jobs.memory_extract")

def run_memory_extract_background_job(user_id: int, feedback_text: str):
    logger.info(f"Running background memory extract job for user {user_id}...")
    # Extract implicit injury/habit insights from user feedback
    extracted_category = "preference"
    if "sore" in feedback_text.lower() or "hurt" in feedback_text.lower():
        extracted_category = "injury"
    
    logger.info(f"Extracted memory category: {extracted_category}")
    return {"status": "completed", "extracted_category": extracted_category}
