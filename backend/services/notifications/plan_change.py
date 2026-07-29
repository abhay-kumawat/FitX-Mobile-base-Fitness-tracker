def build_plan_change_notification(new_version: int, change_summary: str) -> dict:
    return {
        "title": f"⚡ Plan Updated to v{new_version}",
        "body": f"FitX AI adjusted your plan: {change_summary}",
        "type": "plan_change",
        "action_url": f"/api/v1/version-control/explain/{new_version}"
    }
