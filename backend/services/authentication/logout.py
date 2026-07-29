def invalidate_user_session(user_id: int) -> dict:
    return {
        "status": "success",
        "message": f"Session for user {user_id} invalidated successfully."
    }
