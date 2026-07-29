def search_memory_timeline(memories: list, query: str) -> list:
    q = query.lower()
    results = []
    for m in memories:
        if q in m.get("content", "").lower() or q in m.get("category", "").lower():
            results.append(m)
    return results
