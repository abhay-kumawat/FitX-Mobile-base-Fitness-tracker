import re
from typing import Dict, Any, Tuple

# Deterministic patterns for prompt injection attempts & medical diagnostic requests
PROMPT_INJECTION_PATTERNS = [
    re.compile(r"ignore previous instructions", re.IGNORECASE),
    re.compile(r"system prompt", re.IGNORECASE),
    re.compile(r"you are now a medical doctor", re.IGNORECASE),
    re.compile(r"bypass safety rules", re.IGNORECASE),
]

MEDICAL_DIAGNOSTIC_PATTERNS = [
    re.compile(r"\bdiagnose\b", re.IGNORECASE),
    re.compile(r"\bprescribe\b", re.IGNORECASE),
    re.compile(r"\bcure my\b", re.IGNORECASE),
    re.compile(r"\bmedical treatment\b", re.IGNORECASE),
]

MEDICAL_DISCLAIMER_NOTICE = (
    "FitX AI Notice: FitX AI provides general fitness, exercise science, and physiological wellness guidance. "
    "It is not a medical professional, physician, or diagnostic tool. Please consult a qualified medical doctor "
    "or orthopedic specialist for clinical diagnosis or prescription of medical treatments."
)

def evaluate_ai_prompt_security(user_query: str) -> Tuple[bool, str, str]:
    """
    Evaluates incoming AI Coach query for prompt injections or medical diagnostic requests.
    Returns: (is_safe, processed_query_or_fallback, disclaimer_text)
    """
    if not user_query:
        return True, user_query, ""

    # Check Prompt Injection
    for pattern in PROMPT_INJECTION_PATTERNS:
        if pattern.search(user_query):
            return False, "Sanitized query: How can I safely optimize my workout form?", MEDICAL_DISCLAIMER_NOTICE

    # Check Medical Diagnostic Requests
    for pattern in MEDICAL_DIAGNOSTIC_PATTERNS:
        if pattern.search(user_query):
            return True, user_query, MEDICAL_DISCLAIMER_NOTICE

    return True, user_query, ""
