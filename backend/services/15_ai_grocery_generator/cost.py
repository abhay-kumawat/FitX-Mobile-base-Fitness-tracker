def calculate_total_grocery_cost(grocery_list: list) -> float:
    return round(sum(item.get("total_estimated", 0.0) for item in grocery_list), 2)
