def build_grocery_list(aggregated_items: dict) -> list:
    grocery_list = []
    category_map = {
        "Oats (500g)": "Carbs & Grains",
        "Peanut Butter (1 jar)": "Healthy Fats & Nuts",
        "Bananas (1 bunch)": "Produce & Fruits",
        "Chicken Breast (1kg)": "Proteins & Meats",
        "Rice (1kg)": "Carbs & Grains",
        "Broccoli (2 heads)": "Vegetables & Greens"
    }
    
    for item, qty in aggregated_items.items():
        category = category_map.get(item, "General Pantry")
        grocery_list.append({
            "item_name": item,
            "quantity": qty,
            "category": category,
            "status": "pending"
        })
    return grocery_list
