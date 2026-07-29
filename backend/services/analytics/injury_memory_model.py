def model_injury_memory_trends(injury_memories: list) -> dict:
    active_count = sum(1 for m in injury_memories if m.get("is_active"))
    healed_count = len(injury_memories) - active_count
    return {
        "active_injury_flags": active_count,
        "resolved_injury_flags": healed_count,
        "overall_joint_health_index": max(50.0, 100.0 - (active_count * 15.0))
    }
