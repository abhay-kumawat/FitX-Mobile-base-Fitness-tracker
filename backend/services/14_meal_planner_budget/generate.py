import json
import logging
import importlib
from backend.core.config import settings

b_mod = importlib.import_module("backend.services.14_meal_planner_budget.filters.budget")
r_mod = importlib.import_module("backend.services.14_meal_planner_budget.filters.region")
d_mod = importlib.import_module("backend.services.14_meal_planner_budget.filters.diet")
cs_mod = importlib.import_module("backend.services.14_meal_planner_budget.filters.cooking_skill")

filter_by_budget = b_mod.filter_by_budget
filter_by_region = r_mod.filter_by_region
filter_by_diet = d_mod.filter_by_diet
filter_by_cooking_skill = cs_mod.filter_by_cooking_skill

logger = logging.getLogger("fitx.meal_planner")

SAMPLE_RECIPES = [
    {"name": "Oatmeal with Peanut Butter & Banana", "diet_type": "veg", "cost_per_serving": 2.50, "calories": 550, "protein": 22, "carbs": 75, "fat": 18, "region": "global", "difficulty": "easy"},
    {"name": "Grilled Chicken Rice & Broccoli Bowl", "diet_type": "non-veg", "cost_per_serving": 5.00, "calories": 650, "protein": 48, "carbs": 60, "fat": 14, "region": "North America", "difficulty": "easy"},
    {"name": "Paneer Tikka Quinoa Bowl", "diet_type": "veg", "cost_per_serving": 4.50, "calories": 600, "protein": 32, "carbs": 55, "fat": 22, "region": "South Asia", "difficulty": "medium"},
    {"name": "Tuna Avocado Salad Wrap", "diet_type": "non-veg", "cost_per_serving": 3.80, "calories": 500, "protein": 40, "carbs": 35, "fat": 16, "region": "global", "difficulty": "easy"},
    {"name": "Greek Yogurt & Berry Protein Bowl", "diet_type": "veg", "cost_per_serving": 3.00, "calories": 400, "protein": 35, "carbs": 40, "fat": 6, "region": "global", "difficulty": "easy"}
]

def generate_budget_meal_plan(budget: float, region: str, diet_pref: str, cooking_skill: str, target_calories: int = 2200) -> dict:
    f_budget = filter_by_budget(SAMPLE_RECIPES, budget)
    f_region = filter_by_region(f_budget, region)
    f_diet = filter_by_diet(f_region, diet_pref)
    final_candidates = filter_by_cooking_skill(f_diet, cooking_skill)

    if not final_candidates:
        final_candidates = SAMPLE_RECIPES[:3]

    total_cost = sum(r["cost_per_serving"] for r in final_candidates[:3])
    total_cals = sum(r["calories"] for r in final_candidates[:3])
    total_p = sum(r["protein"] for r in final_candidates[:3])
    total_c = sum(r["carbs"] for r in final_candidates[:3])
    total_f = sum(r["fat"] for r in final_candidates[:3])

    plan = {
        "status": "success",
        "daily_budget": budget,
        "actual_cost": round(total_cost, 2),
        "within_budget": total_cost <= budget,
        "target_calories": target_calories,
        "actual_calories": total_cals,
        "macro_totals": {"protein_g": total_p, "carbs_g": total_c, "fat_g": total_f},
        "meals": [
            {"meal": "Breakfast", "recipe": final_candidates[0]},
            {"meal": "Lunch", "recipe": final_candidates[min(1, len(final_candidates)-1)]},
            {"meal": "Dinner", "recipe": final_candidates[min(2, len(final_candidates)-1)]}
        ]
    }

    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            prompt = f"Optimize this budget meal plan for {diet_pref} in {region} under ${budget}/day. Return JSON."
            res = model.generate_content(prompt)
        except Exception as e:
            logger.warning(f"Gemini meal plan generation fallback: {e}")

    return plan
