import unittest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.core.database import Base
from backend.models.models import User, TemporalEvent, DailyNutritionLog, DailyHydrationLog, DailySupplementLog, DailyNutritionSummary
from backend.schemas.meals import LoggedMealCreate, HydrationLogCreate, SupplementCreate
from backend.services.meals.food_seed import seed_food_items_if_empty
from backend.services.meals.macro_calculator import compute_and_save_daily_summary, calculate_user_targets
from backend.services.meals.meal_engine import (
    add_meal_item, toggle_meal_status, remove_meal_item, copy_plan_to_date, get_user_meals_by_date
)
from backend.services.meals.hydration_engine import (
    add_hydration_log, remove_hydration_log, update_daily_water_target
)
from backend.services.meals.supplement_engine import (
    add_supplement_log, toggle_supplement_status, remove_supplement_log
)
from backend.services.meals.recipe_engine import get_user_meal_combos, create_meal_combo
from backend.services.meals.reminder_engine import get_user_reminders, toggle_reminder_rule

class TestMealsTESModule(unittest.TestCase):
    def setUp(self):
        # Create isolated in-memory SQLite database for testing
        self.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

        # Create test user
        self.test_user = User(
            id=1,
            email="test.athlete@fitx.ai",
            hashed_password="hashed_secret",
            full_name="Test Athlete"
        )
        self.db.add(self.test_user)
        self.db.commit()
        self.db.refresh(self.test_user)

    def tearDown(self):
        self.db.close()

    def test_01_food_seeding(self):
        count = seed_food_items_if_empty(self.db)
        self.assertGreater(count, 0)

    def test_02_meal_creation_and_tes_mirroring(self):
        date_str = "2026-07-30"
        payload = LoggedMealCreate(
            food_id="p1",
            name="Grilled Chicken & Rice",
            meal_category="Lunch",
            serving_multiplier=1.5,
            calories=550,
            protein=48.0,
            carbs=52.0,
            fat=10.0,
            fiber=4.0,
            scheduled_time="13:00",
            date_str=date_str
        )
        meal = add_meal_item(self.db, self.test_user.id, payload)

        self.assertIsNotNone(meal.id)
        self.assertEqual(meal.status, "pending")
        self.assertIsNotNone(meal.temporal_event_id)

        # Check TES Event existence
        tes_event = self.db.query(TemporalEvent).filter(TemporalEvent.id == meal.temporal_event_id).first()
        self.assertIsNotNone(tes_event)
        self.assertEqual(tes_event.category, "nutrition")
        self.assertEqual(tes_event.event_type, "meal")
        self.assertEqual(tes_event.status, "SCHEDULED")

    def test_03_meal_checklist_toggle(self):
        date_str = "2026-07-30"
        payload = LoggedMealCreate(
            name="Protein Shake",
            meal_category="Snacks",
            calories=250,
            protein=30.0,
            carbs=10.0,
            fat=3.0,
            date_str=date_str
        )
        meal = add_meal_item(self.db, self.test_user.id, payload)
        
        # Toggle status to completed
        updated = toggle_meal_status(self.db, self.test_user.id, date_str, meal.id, new_status="completed")
        self.assertEqual(updated.status, "completed")
        self.assertIsNotNone(updated.completed_at)

        # Verify TES event updated
        tes_event = self.db.query(TemporalEvent).filter(TemporalEvent.id == meal.temporal_event_id).first()
        self.assertEqual(tes_event.status, "COMPLETED")

    def test_04_hydration_tracking(self):
        date_str = "2026-07-30"
        hyd = add_hydration_log(self.db, self.test_user.id, HydrationLogCreate(
            date_str=date_str,
            liquid_type="Water",
            volume_ml=500,
            emoji="💧"
        ))
        self.assertIsNotNone(hyd.id)
        self.assertIsNotNone(hyd.temporal_event_id)

        summary = compute_and_save_daily_summary(self.db, self.test_user.id, date_str)
        self.assertGreaterEqual(summary.total_water_ml, 500)

    def test_05_supplement_tracking(self):
        date_str = "2026-07-30"
        supp = add_supplement_log(self.db, self.test_user.id, SupplementCreate(
            date_str=date_str,
            name="Creatine Monohydrate",
            dosage="5g",
            timing="Morning"
        ))
        self.assertIsNotNone(supp.id)
        
        updated = toggle_supplement_status(self.db, self.test_user.id, date_str, supp.id)
        self.assertEqual(updated.status, "completed")

    def test_06_copy_plan_across_days(self):
        source_date = "2026-07-30"
        target_date = "2026-07-31"

        add_meal_item(self.db, self.test_user.id, LoggedMealCreate(
            name="Source Meal",
            meal_category="Breakfast",
            calories=400,
            protein=30.0,
            carbs=40.0,
            fat=10.0,
            date_str=source_date
        ))

        success = copy_plan_to_date(self.db, self.test_user.id, source_date, target_date)
        self.assertTrue(success)

        target_meals = get_user_meals_by_date(self.db, self.test_user.id, target_date)
        self.assertGreaterEqual(len(target_meals), 1)

    def test_07_schedulable_meal_event_with_recurrence(self):
        from backend.schemas.meal_events import MealEventCreate, RecurrenceConfig, AutoCopyFlags
        from backend.services.meals.meal_engine import create_meal_event, get_timeline_indicators

        payload = MealEventCreate(
            name="Recurring Protein Breakfast",
            meal_category="Breakfast",
            scheduled_date="2026-08-01",
            scheduled_time="07:30",
            calories=600,
            protein=50.0,
            carbs=60.0,
            fat=15.0,
            recurrence=RecurrenceConfig(frequency="DAILY", end_condition="NEVER"),
            reminder_offset_minutes=15,
            auto_copy_flags=AutoCopyFlags(copy_nutrition=True, copy_supplements=True),
            linked_supplements=["Creatine Monohydrate"]
        )

        meal = create_meal_event(self.db, self.test_user.id, payload)
        self.assertIsNotNone(meal.id)
        self.assertEqual(meal.scheduled_time, "07:30")
        self.assertIsNotNone(meal.temporal_event_id)

        indicators = get_timeline_indicators(self.db, self.test_user.id, "2026-08-01", "2026-08-03")
        self.assertEqual(len(indicators), 3)
        self.assertTrue(indicators[0]["total_meals"] >= 1)

    def test_08_food_search_and_portions(self):
        from backend.services.meals.meal_engine import search_food_library, toggle_favorite_food, update_meal_item

        # 1. Test dataset seeding count
        count = seed_food_items_if_empty(self.db)
        self.assertGreaterEqual(count, 1000)

        # 2. Test food search for Indian staple "roti"
        search_res = search_food_library(self.db, self.test_user.id, query="roti")
        self.assertGreaterEqual(search_res["total_count"], 1)
        first_food = search_res["items"][0]
        self.assertIn("roti", first_food["name"].lower())

        # 3. Test favorite toggle
        is_fav = toggle_favorite_food(self.db, self.test_user.id, first_food["id"])
        self.assertTrue(is_fav)

        fav_res = search_food_library(self.db, self.test_user.id, query="roti", only_favorites=True)
        self.assertEqual(fav_res["total_count"], 1)

        # 4. Test adding meal and updating portion multiplier
        date_str = "2026-07-30"
        meal = add_meal_item(self.db, self.test_user.id, LoggedMealCreate(
            food_id=first_food["id"],
            name=first_food["name"],
            meal_category="Breakfast",
            serving_multiplier=1.0,
            calories=first_food["calories"],
            protein=first_food["protein_g"],
            carbs=first_food["carbs_g"],
            fat=first_food["fat_g"],
            date_str=date_str
        ))
        initial_cals = meal.calories

        # Update multiplier to 2.0x
        updated_meal = update_meal_item(self.db, self.test_user.id, meal.id, serving_multiplier=2.0)
        self.assertEqual(updated_meal.serving_multiplier, 2.0)
        self.assertEqual(updated_meal.calories, initial_cals * 2)

if __name__ == "__main__":
    unittest.main()

