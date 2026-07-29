def format_version_history(history_list: list) -> list:
    formatted = []
    for item in history_list:
        formatted.append({
            "version": item.get("version"),
            "timestamp": item.get("created_at"),
            "summary": item.get("change_summary"),
            "rationale": item.get("rationale"),
            "explanation_link": f"/api/v1/version-control/explain/{item.get('version')}"
        })
    return formatted
