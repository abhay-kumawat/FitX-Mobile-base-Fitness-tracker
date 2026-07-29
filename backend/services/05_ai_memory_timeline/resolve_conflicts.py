def resolve_memory_conflicts(existing_memories: list, new_entry: dict) -> tuple[list, list]:
    resolved = list(existing_memories)
    conflicts_detected = []
    
    # E.g. If user previously reported shoulder injury healed, deactivate old active injury memory
    if "healed" in new_entry["content"].lower() or "recovered" in new_entry["content"].lower():
        for mem in resolved:
            if mem["category"] == "injury" and mem["is_active"]:
                mem["is_active"] = False
                conflicts_detected.append(f"Deactivated legacy injury memory: '{mem['content']}' due to recovery signal.")
                
    resolved.append(new_entry)
    return resolved, conflicts_detected
