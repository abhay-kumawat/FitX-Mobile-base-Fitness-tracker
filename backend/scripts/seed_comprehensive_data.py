import sys
import os
import random
from datetime import datetime, timedelta
import uuid
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.core.database import SessionLocal, Base, engine
from backend.models.models import (
    User, Profile, MasterExercise, WorkoutPlan, WorkoutSession, WorkoutSet,
    BodyMeasurementLog, PsychologicalLog, DailyNutritionLog, DailyHydrationLog, DailySupplementLog,
    MemoryTimelineItem, StreakRecord, WorkoutEventLog, Habit, PersonalRecord
)

def seed_database():
    db = SessionLocal()
    print("Clearing old data...")
    # Clean relevant tables
    for model in [WorkoutSet, WorkoutEventLog, WorkoutSession, WorkoutPlan, 
                  BodyMeasurementLog, PsychologicalLog, DailyNutritionLog, DailyHydrationLog, 
                  DailySupplementLog, MemoryTimelineItem, StreakRecord, Habit, PersonalRecord]:
        db.query(model).delete()
    db.commit()

    print("Creating Demo User...")
    user = db.query(User).filter(User.email == "demo@fitx.app").first()
    if not user:
        user = User(email="demo@fitx.app", hashed_password="hashedpassword123", full_name="Demo User")
        db.add(user)
        db.commit()
        db.refresh(user)

    print("Creating Profile...")
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id, height_cm=180.0, weight_kg=82.0, body_fat_pct=15.0)
        db.add(profile)
        db.commit()

    print("Seeding Master Exercises...")
    exercises = [
        {"name": "Bench Press", "muscle_group": "Chest", "mechanic": "Compound"},
        {"name": "Squat", "muscle_group": "Legs", "mechanic": "Compound"},
        {"name": "Deadlift", "muscle_group": "Back", "mechanic": "Compound"},
        {"name": "Pull-up", "muscle_group": "Back", "mechanic": "Compound"},
        {"name": "Bicep Curl", "muscle_group": "Arms", "mechanic": "Isolation"}
    ]
    master_exs = []
    for ex in exercises:
        m = db.query(MasterExercise).filter(MasterExercise.name == ex["name"]).first()
        if not m:
            m = MasterExercise(name=ex["name"], primary_muscle=ex["muscle_group"], movement_pattern=ex["mechanic"], category=ex["muscle_group"], equipment="barbell")
            db.add(m)
            db.commit()
            db.refresh(m)
        master_exs.append(m)

    print("Creating Workout Plan...")
    plan = WorkoutPlan(user_id=user.id, name="Hypertrophy PPL", goal="hypertrophy", status="active", workout_data={}, created_at=datetime.utcnow() - timedelta(days=200))
    db.add(plan)
    db.commit()
    db.refresh(plan)

    print("Generating 6 months of historical data...")
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=180)
    current_date = start_date

    weight = 86.0
    streak = 0
    workout_count = 0

    while current_date <= end_date:
        # 1. Body Measurements (Weekly)
        if current_date.weekday() == 0:  # Monday
            weight -= random.uniform(-0.1, 0.4)
            bm = BodyMeasurementLog(
                id=str(uuid.uuid4()), user_id=user.id, date=current_date.strftime("%Y-%m-%d"),
                weight_kg=weight, body_fat_pct=(weight/86.0)*18.0, estimated_muscle_mass_kg=weight*0.4,
                created_at=current_date
            )
            db.add(bm)

        # 2. Nutrition & Hydration (Daily)
        if random.random() > 0.05:
            cals = random.randint(2200, 2800)
            nut = DailyNutritionLog(
                id=str(uuid.uuid4()), user_id=user.id, date=current_date.strftime("%Y-%m-%d"),
                meal_category="Dinner", name="Sample Meal", calories=cals,
                protein=cals*0.3/4, carbs=cals*0.4/4, fat=cals*0.3/9, status="completed"
            )
            hyd = DailyHydrationLog(
                user_id=user.id, date=current_date.strftime("%Y-%m-%d"),
                liquid_type="Water", volume_ml=random.randint(2000, 3500), timestamp=current_date.isoformat()
            )
            db.add(nut)
            db.add(hyd)

        # 3. Psych / Mood (Daily)
        if random.random() > 0.2:
            psy = PsychologicalLog(
                id=str(uuid.uuid4()), user_id=user.id, date=current_date.strftime("%Y-%m-%d"),
                mood=random.uniform(5, 10), stress=random.uniform(2, 7), energy=random.uniform(5, 10),
                created_at=current_date
            )
            db.add(psy)

        # 4. Workouts (4 times a week)
        is_workout = current_date.weekday() in [0, 1, 3, 4] and random.random() > 0.1
        if is_workout:
            streak += 1
            workout_count += 1
            dur = random.randint(45, 90)
            session = WorkoutSession(
                user_id=user.id, name=f"Workout {workout_count}",
                start_time=current_date, end_time=current_date + timedelta(minutes=dur),
                duration_seconds=dur*60, total_volume_kg=random.uniform(5000, 12000),
                status="completed"
            )
            db.add(session)
            db.flush() # get ID

            # Generate Sets
            for i in range(random.randint(3, 5)):
                ex = random.choice(master_exs)
                for s in range(3):
                    w = WorkoutSet(
                        session_id=session.id, exercise_name=ex.name,
                        set_number=s+1, reps=random.randint(8, 12), weight_kg=random.uniform(40, 100),
                        is_completed=True, rpe=random.randint(6,9),
                        start_time=current_date + timedelta(minutes=10*i + 3*s),
                        end_time=current_date + timedelta(minutes=10*i + 3*s + 1)
                    )
                    db.add(w)
                    
            # Memory Timeline Item
            mem = MemoryTimelineItem(
                user_id=user.id, category="milestone", timestamp=current_date,
                content=f"Crushed {session.name}! Lifted {session.total_volume_kg:.1f}kg total.",
                confidence=0.9
            )
            db.add(mem)
        else:
            if current_date.weekday() in [0, 1, 3, 4]:
                streak = 0
                
        current_date += timedelta(days=1)
        
        # Commit in batches
        if (end_date - current_date).days % 30 == 0:
            db.commit()

    db.commit()
    print(f"Data seeding complete! Generated {workout_count} workouts over 6 months.")

if __name__ == "__main__":
    seed_database()
