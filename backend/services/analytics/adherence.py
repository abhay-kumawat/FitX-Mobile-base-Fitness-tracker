def calculate_adherence_analytics(completed_count: int, total_scheduled: int) -> dict:
    pct = round((completed_count / max(1, total_scheduled)) * 100.0, 1)
    status = "Excellent" if pct >= 85 else ("Good" if pct >= 70 else "Needs Focus")
    return {
        "adherence_percentage": pct,
        "completed": completed_count,
        "scheduled": total_scheduled,
        "status": status
    }
