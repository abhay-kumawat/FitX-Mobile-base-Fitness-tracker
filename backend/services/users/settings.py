def get_user_settings_dict(user_id: int) -> dict:
    return {
        "user_id": user_id,
        "notifications_enabled": True,
        "dark_mode": True,
        "unit_system": "metric",
        "voice_guidance": True
    }
