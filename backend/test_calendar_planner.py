import unittest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.core.database import Base
from backend.models.models import User, WorkoutPlan, WorkoutAssignment, WorkoutRevision

class TestCalendarPlanner(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        self.user = User(email=f"test_{datetime.utcnow().timestamp()}@fitx.ai", hashed_password="hashed_pass", full_name="Test User")
        self.db.add(self.user)
        self.db.commit()
        self.db.refresh(self.user)

    def tearDown(self):
        self.db.close()

    def test_workout_assignment_crud(self):
        date_str = "2026-07-30"
        assignment = WorkoutAssignment(
            user_id=self.user.id,
            planned_date=date_str,
            assignment_type="workout",
            name="Chest & Triceps Hypertrophy",
            goal="Hypertrophy",
            workout_data={
                "exercises": [
                    {
                        "id": "ex_1",
                        "name": "Barbell Bench Press",
                        "targetSets": 3,
                        "sets": [{"setNumber": 1, "weightKg": 80, "reps": 10}]
                    }
                ]
            }
        )
        self.db.add(assignment)
        self.db.commit()
        self.db.refresh(assignment)

        self.assertEqual(assignment.planned_date, "2026-07-30")
        self.assertEqual(assignment.name, "Chest & Triceps Hypertrophy")
        self.assertEqual(len(assignment.workout_data["exercises"]), 1)

        # Test revision audit log creation
        revision = WorkoutRevision(
            assignment_id=assignment.id,
            user_id=self.user.id,
            action="create",
            previous_data=None,
            new_data=assignment.workout_data
        )
        self.db.add(revision)
        self.db.commit()

        revisions = self.db.query(WorkoutRevision).filter(WorkoutRevision.assignment_id == assignment.id).all()
        self.assertEqual(len(revisions), 1)
        self.assertEqual(revisions[0].action, "create")

    def test_day_swap(self):
        date_a = "2026-07-28"
        date_b = "2026-07-31"

        assign_a = WorkoutAssignment(
            user_id=self.user.id,
            planned_date=date_a,
            assignment_type="workout",
            name="Monday Push",
            workout_data={"exercises": [{"name": "Pushup"}]}
        )
        assign_b = WorkoutAssignment(
            user_id=self.user.id,
            planned_date=date_b,
            assignment_type="workout",
            name="Thursday Legs",
            workout_data={"exercises": [{"name": "Squat"}]}
        )
        self.db.add_all([assign_a, assign_b])
        self.db.commit()

        # Swap dates
        assign_a.planned_date, assign_b.planned_date = date_b, date_a
        self.db.commit()

        fetched_a = self.db.query(WorkoutAssignment).filter(WorkoutAssignment.user_id == self.user.id, WorkoutAssignment.planned_date == date_a).first()
        fetched_b = self.db.query(WorkoutAssignment).filter(WorkoutAssignment.user_id == self.user.id, WorkoutAssignment.planned_date == date_b).first()

        self.assertEqual(fetched_a.name, "Thursday Legs")
        self.assertEqual(fetched_b.name, "Monday Push")

if __name__ == "__main__":
    unittest.main()
