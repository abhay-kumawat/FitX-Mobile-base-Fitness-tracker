import sys
import os
import random
from datetime import datetime, timedelta

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.core.database import SessionLocal
from backend.services.analytics.pipeline import ingest_raw_event

def generate_sample_data(user_id: int = 1, months: int = 6):
    db = SessionLocal()
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 * months)
    
    current_date = start_date
    
    print(f"Generating {months} months of sample analytics data for User {user_id}...")
    
    # Track trends
    current_weight = 80.0
    workout_streak = 0
    total_workouts = 0
    
    while current_date <= end_date:
        # Simulate realistic daily patterns
        
        # 1. Sleep (every day)
        sleep_hours = random.uniform(5.5, 9.0)
        ingest_raw_event(
            db, user_id, "sleep", "sleep_logged", 
            {"duration_hours": sleep_hours, "quality": "good" if sleep_hours > 7 else "fair"}
        )
        # Hack to set timestamp accurately (ingest_raw_event uses utcnow by default, let's fix it after)
        
        # 2. Nutrition (most days)
        if random.random() > 0.05:
            cals = random.randint(2200, 3000)
            ingest_raw_event(db, user_id, "nutrition", "meal_logged", {
                "calories": cals,
                "protein_g": cals * 0.3 / 4,
                "carbs_g": cals * 0.45 / 4,
                "fat_g": cals * 0.25 / 9,
            })
            
        # 3. Workouts (3-5 times a week)
        is_workout_day = random.random() < 0.65
        if is_workout_day:
            workout_streak += 1
            total_workouts += 1
            vol = random.uniform(8000.0, 16000.0)
            dur = random.randint(35, 90)
            cals_burn = dur * 6
            ingest_raw_event(db, user_id, "workout", "workout_completed", {
                "total_volume_kg": vol,
                "duration_minutes": dur,
                "calories_burned": cals_burn,
                "completed_exercises": random.randint(5, 8),
                "skipped_exercises": random.randint(0, 1),
                "rpe_avg": random.uniform(7.0, 9.0)
            })
        else:
            workout_streak = 0
            
        # 4. Body Measurement (weekly)
        if current_date.weekday() == 6: # Sunday weigh-in
            # Slight trend downwards
            current_weight -= random.uniform(-0.2, 0.5)
            ingest_raw_event(db, user_id, "body", "weight_logged", {
                "weight_kg": current_weight,
                "body_fat_pct": (current_weight / 80.0) * 18.0
            })
            
        # 5. Recovery Score (calculated daily based on sleep and previous workouts)
        rec_score = min(100.0, max(0.0, sleep_hours * 10 - (10 if is_workout_day else 0) + random.uniform(-10, 10)))
        ingest_raw_event(db, user_id, "recovery", "score_calculated", {
            "score": rec_score,
            "readiness": (rec_score + 10) if not is_workout_day else rec_score
        })
        
        # 6. Mood (random)
        if random.random() > 0.2:
            ingest_raw_event(db, user_id, "mood", "mood_logged", {
                "mood_score": random.uniform(6.0, 10.0),
                "stress_score": random.uniform(2.0, 8.0),
                "fatigue_index": 100.0 - rec_score
            })
            
        # Manually backdate the events we just inserted
        # (This is a hack for the generation script, normally they happen in real-time)
        from backend.models.analytics import RawAnalyticsEvent, DailyAggregate
        events = db.query(RawAnalyticsEvent).filter(RawAnalyticsEvent.user_id == user_id).order_by(RawAnalyticsEvent.timestamp.desc()).limit(10).all()
        for e in events:
            if e.timestamp.date() == datetime.utcnow().date(): # Approximate check
                e.timestamp = current_date
        db.commit()
        
        # Also fix DailyAggregates
        aggs = db.query(DailyAggregate).filter(DailyAggregate.user_id == user_id, DailyAggregate.date == datetime.utcnow().strftime("%Y-%m-%d")).all()
        for a in aggs:
            a.date = current_date.strftime("%Y-%m-%d")
        db.commit()

        current_date += timedelta(days=1)
        
    # Re-run aggregation safely for all generated days
    from backend.services.analytics.pipeline import AnalyticsEngine
    engine = AnalyticsEngine(db)
    
    # We just run recalculate on the daily aggregates to make sure they are solid
    days_to_recalc = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]
    for d in days_to_recalc:
        engine.recalculate_daily_aggregate(user_id, d.strftime("%Y-%m-%d"))
        
    print(f"Data generation complete! {total_workouts} workouts logged.")

if __name__ == "__main__":
    generate_sample_data()
