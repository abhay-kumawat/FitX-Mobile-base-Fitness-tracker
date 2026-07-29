from sqlalchemy.orm import Session
from backend.models.models import FoodItem
from backend.services.meals.food_dataset_1000 import get_expanded_food_dataset

def seed_food_items_if_empty(db: Session) -> int:
    existing_count = db.query(FoodItem).count()
    if existing_count >= 1000:
        return existing_count

    dataset = get_expanded_food_dataset()
    added = 0
    
    for item in dataset:
        existing = db.query(FoodItem).filter(FoodItem.id == item["id"]).first()
        if not existing:
            db_item = FoodItem(
                id=item["id"],
                name=item["name"],
                category=item.get("category", "Proteins"),
                serving_size=item.get("serving_unit", "100g"),
                serving_weight_g=item.get("serving_weight_g", 100.0),
                calories=item.get("calories", 0),
                protein_g=item.get("protein_g", 0.0),
                carbs_g=item.get("carbs_g", 0.0),
                net_carbs_g=item.get("net_carbs_g", 0.0),
                fat_g=item.get("fat_g", 0.0),
                sat_fat_g=item.get("sat_fat_g", 0.0),
                unsat_fat_g=item.get("unsat_fat_g", 0.0),
                fiber_g=item.get("fiber_g", 0.0),
                sugar_g=item.get("sugar_g", 0.0),
                sodium_mg=item.get("sodium_mg", 0.0),
                potassium_mg=item.get("potassium_mg", 0.0),
                calcium_mg=item.get("calcium_mg", 0.0),
                iron_mg=item.get("iron_mg", 0.0),
                vitamin_a_iu=item.get("vitamin_a_iu", 0.0),
                vitamin_c_mg=item.get("vitamin_c_mg", 0.0),
                vitamin_d_iu=item.get("vitamin_d_iu", 0.0),
                vitamin_b_complex_mg=item.get("vitamin_b_complex_mg", 0.0),
                magnesium_mg=item.get("magnesium_mg", 0.0),
                zinc_mg=item.get("zinc_mg", 0.0),
                phosphorus_mg=item.get("phosphorus_mg", 0.0),
                water_g=item.get("water_g", 0.0),
                cholesterol_mg=item.get("cholesterol_mg", 0.0),
                brand=item.get("brand", "Generic"),
                search_keywords=item.get("search_keywords", []),
                aliases=item.get("aliases", []),
                regional_names=item.get("regional_names", ""),
                future_ai_metadata={"dataset": "1000_science_seed", "tier": "verified"},
                badge_emoji=item.get("badge_emoji", "🥗"),
                verified=item.get("is_verified", True),
                is_custom=False
            )
            db.add(db_item)
            added += 1
            
    if added > 0:
        db.commit()
        
    return db.query(FoodItem).count()

