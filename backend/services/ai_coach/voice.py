def process_voice_transcript(transcript_text: str) -> dict:
    clean_text = transcript_text.lower().strip()
    action = "general_query"
    if "sore" in clean_text or "pain" in clean_text:
        action = "report_soreness"
    elif "tired" in clean_text or "sleep" in clean_text:
        action = "report_fatigue"
    elif "swap" in clean_text or "replace" in clean_text:
        action = "request_exercise_swap"

    return {
        "transcript": transcript_text,
        "parsed_action": action,
        "confidence": 0.94
    }
