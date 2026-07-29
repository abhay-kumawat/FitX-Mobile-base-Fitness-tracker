def toggle_memory_visibility(memory_item: dict, is_visible: bool) -> dict:
    memory_item["is_active"] = is_visible
    return memory_item
