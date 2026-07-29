def create_memory_entry(category: str, content: str, confidence: float = 0.95, source: str = "user_input") -> dict:
    return {
        "category": category,
        "content": content,
        "confidence": confidence,
        "source": source,
        "is_active": True
    }
