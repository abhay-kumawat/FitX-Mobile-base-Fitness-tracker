def simulate_location_constraint(exercises: list, location: str) -> list:
    # location: "hotel_room", "park", "home_dumbbells", "full_gym"
    location_clean = location.lower()
    adapted = []

    for ex in exercises:
        ex_copy = dict(ex)
        if "hotel" in location_clean or "home" in location_clean:
            if "barbell" in ex.get("equipment_required", "").lower():
                ex_copy["name"] = f"Dumbbell / Bodyweight {ex['name']}"
                ex_copy["equipment_required"] = "dumbbells"
        elif "park" in location_clean:
            ex_copy["name"] = f"Bodyweight Calisthenics {ex['name']}"
            ex_copy["equipment_required"] = "bodyweight"
        adapted.append(ex_copy)

    return adapted
