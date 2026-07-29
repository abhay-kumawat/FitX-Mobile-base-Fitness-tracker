def create_live_event_payload(event_type: str, data: dict) -> dict:
    return {
        "event_type": event_type,
        "payload": data,
        "status": "live"
    }
