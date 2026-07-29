def generate_explanation_payload(version: int, rationale: str, changes: dict) -> dict:
    return {
        "version": version,
        "title": f"Why Version {version} was generated",
        "detailed_explanation": rationale,
        "delta_changes": changes,
        "confidence_score": 0.96
    }
