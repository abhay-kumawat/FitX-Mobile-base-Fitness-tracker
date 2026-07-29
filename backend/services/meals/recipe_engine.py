import uuid
from typing import List
from sqlalchemy.orm import Session

from backend.models.models import MealComboModel, RecipeItem
from backend.schemas.meals import MealComboCreate

DEFAULT_COMBOS = [
    {
        "id": "combo_1",
        "name": "High-Protein Muscle Power Stack",
        "items": [
            {"foodId": "c1", "quantity": 1.5},
            {"foodId": "p2", "quantity": 1.0},
            {"foodId": "f2", "quantity": 1.0}
        ],
        "total_calories": 810,
        "total_protein": 69.0,
        "total_carbs": 78.0,
        "total_fat": 23.0,
        "badge_emoji": "⚡"
    },
    {
        "id": "combo_2",
        "name": "Lean Shred Post-Workout Bowl",
        "items": [
            {"foodId": "p1", "quantity": 2.0},
            {"foodId": "c2", "quantity": 1.5},
            {"foodId": "v1", "quantity": 1.0}
        ],
        "total_calories": 560,
        "total_protein": 66.0,
        "total_carbs": 49.0,
        "total_fat": 8.0,
        "badge_emoji": "🔥"
    }
]

def seed_default_combos_if_empty(db: Session, user_id: int):
    count = db.query(MealComboModel).filter(MealComboModel.user_id == user_id).count()
    if count > 0:
        return

    for c in DEFAULT_COMBOS:
        combo = MealComboModel(
            id=c["id"],
            user_id=user_id,
            name=c["name"],
            items=c["items"],
            total_calories=c["total_calories"],
            total_protein=c["total_protein"],
            total_carbs=c["total_carbs"],
            total_fat=c["total_fat"],
            badge_emoji=c["badge_emoji"]
        )
        db.add(combo)
    db.commit()

def get_user_meal_combos(db: Session, user_id: int) -> List[MealComboModel]:
    seed_default_combos_if_empty(db, user_id)
    return db.query(MealComboModel).filter(MealComboModel.user_id == user_id).all()

def create_meal_combo(db: Session, user_id: int, data: MealComboCreate) -> MealComboModel:
    combo_id = f"combo_{uuid.uuid4().hex[:8]}"
    combo = MealComboModel(
        id=combo_id,
        user_id=user_id,
        name=data.name,
        items=data.items,
        total_calories=data.total_calories,
        total_protein=data.total_protein,
        total_carbs=data.total_carbs,
        total_fat=data.total_fat,
        badge_emoji=data.badge_emoji
    )
    db.add(combo)
    db.commit()
    db.refresh(combo)
    return combo
