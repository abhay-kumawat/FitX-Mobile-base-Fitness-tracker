def correct_memory_item(memory_item: dict, updated_content: str, updated_category: str = None) -> dict:
    memory_item["content"] = updated_content
    if updated_category:
        memory_item["category"] = updated_category
    memory_item["source"] = "user_correction"
    return memory_item
