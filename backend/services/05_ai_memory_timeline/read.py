def read_memory_timeline(memories: list, active_only: bool = True) -> list:
    if active_only:
        return [m for m in memories if m.get("is_active", True)]
    return memories
