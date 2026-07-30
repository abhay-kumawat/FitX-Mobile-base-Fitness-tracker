import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models.analytics import (
    RawAnalyticsEvent,
    DailyAggregate,
    WeeklyAggregate,
    MonthlyAggregate,
    MetricExplanation
)
from backend.models.models import User, WorkoutSession

logger = logging.getLogger("fitx.analytics.pipeline")

class AnalyticsEngine:
    """
    Core Analytics Pipeline that processes raw events into aggregated metrics.
    """
    
    def __init__(self, db: Session):
        self.db = db
        
    def process_raw_event(self, event: RawAnalyticsEvent):
        """
        Processes a single raw event and updates the relevant aggregates.
        """
        # Determine the date context from the event timestamp
        date_str = event.timestamp.strftime("%Y-%m-%d")
        
        # 1. Update Daily Aggregate
        daily = self._get_or_create_daily(event.user_id, date_str)
        self._apply_event_to_daily(daily, event)
        
        # 2. Update Weekly Aggregate
        year, week, _ = event.timestamp.isocalendar()
        weekly = self._get_or_create_weekly(event.user_id, year, week)
        self._apply_event_to_weekly(weekly, event)
        
        # 3. Update Monthly Aggregate
        monthly = self._get_or_create_monthly(event.user_id, event.timestamp.year, event.timestamp.month)
        self._apply_event_to_monthly(monthly, event)
        
        # Mark event as processed
        event.processed = True
        event.processed_at = datetime.utcnow()
        
        self.db.commit()
        
    def recalculate_daily_aggregate(self, user_id: int, date_str: str):
        """
        Full recalculation of a specific day based on raw events.
        Useful for backfilling or correcting data.
        """
        daily = self._get_or_create_daily(user_id, date_str)
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        # Fetch all events for that day
        events = self.db.query(RawAnalyticsEvent).filter(
            RawAnalyticsEvent.user_id == user_id,
            func.date(RawAnalyticsEvent.timestamp) == target_date
        ).all()
        
        # Reset metrics
        daily.workout_consistency_pct = 0.0
        daily.training_adherence_pct = 0.0
        daily.daily_volume_kg = 0.0
        daily.workout_duration_min = 0
        daily.calories_burned = 0.0
        daily.skipped_exercises = 0
        daily.completed_exercises = 0
        
        daily.nutrition_adherence_pct = 0.0
        daily.calories_consumed = 0
        daily.protein_g = 0.0
        daily.carbs_g = 0.0
        daily.fat_g = 0.0
        daily.hydration_ml = 0
        
        # Re-apply all events
        for evt in events:
            self._apply_event_to_daily(daily, evt)
            
        # Post-processing calculations (e.g., consistency)
        self._calculate_consistency(daily, user_id, target_date)
        
        self.db.commit()
        return daily

    # --- Private Helpers ---
    
    def _get_or_create_daily(self, user_id: int, date_str: str) -> DailyAggregate:
        agg = self.db.query(DailyAggregate).filter_by(user_id=user_id, date=date_str).first()
        if not agg:
            agg = DailyAggregate(user_id=user_id, date=date_str)
            self.db.add(agg)
        return agg

    def _get_or_create_weekly(self, user_id: int, year: int, week: int) -> WeeklyAggregate:
        agg = self.db.query(WeeklyAggregate).filter_by(user_id=user_id, year=year, week_number=week).first()
        if not agg:
            agg = WeeklyAggregate(user_id=user_id, year=year, week_number=week)
            self.db.add(agg)
        return agg

    def _get_or_create_monthly(self, user_id: int, year: int, month: int) -> MonthlyAggregate:
        agg = self.db.query(MonthlyAggregate).filter_by(user_id=user_id, year=year, month=month).first()
        if not agg:
            agg = MonthlyAggregate(user_id=user_id, year=year, month=month)
            self.db.add(agg)
        return agg

    def _apply_event_to_daily(self, daily: DailyAggregate, event: RawAnalyticsEvent):
        payload = event.payload
        if event.event_category == "workout":
            if event.event_type == "workout_completed":
                daily.daily_volume_kg = (daily.daily_volume_kg or 0.0) + payload.get("total_volume_kg", 0.0)
                daily.workout_duration_min = (daily.workout_duration_min or 0) + payload.get("duration_minutes", 0)
                daily.calories_burned = (daily.calories_burned or 0.0) + payload.get("calories_burned", 0.0)
                daily.completed_exercises = (daily.completed_exercises or 0) + payload.get("completed_exercises", 0)
                daily.skipped_exercises = (daily.skipped_exercises or 0) + payload.get("skipped_exercises", 0)
                
                # Training adherence based on completed / (completed + skipped)
                total_ex = (daily.completed_exercises or 0) + (daily.skipped_exercises or 0)
                if total_ex > 0:
                    daily.training_adherence_pct = ((daily.completed_exercises or 0) / total_ex) * 100.0
                    
        elif event.event_category == "nutrition":
            if event.event_type == "meal_logged":
                daily.calories_consumed = (daily.calories_consumed or 0) + payload.get("calories", 0)
                daily.protein_g = (daily.protein_g or 0.0) + payload.get("protein_g", 0.0)
                daily.carbs_g = (daily.carbs_g or 0.0) + payload.get("carbs_g", 0.0)
                daily.fat_g = (daily.fat_g or 0.0) + payload.get("fat_g", 0.0)
                
        elif event.event_category == "recovery":
            if event.event_type == "score_calculated":
                daily.recovery_score = payload.get("score", 0.0)
                daily.readiness_score = payload.get("readiness", 0.0)
                
        elif event.event_category == "sleep":
            if event.event_type == "sleep_logged":
                daily.sleep_hours = (daily.sleep_hours or 0.0) + payload.get("duration_hours", 0.0)
                
        elif event.event_category == "body":
            if event.event_type == "weight_logged":
                daily.body_weight_kg = payload.get("weight_kg", 0.0)
                
        elif event.event_category == "mood":
            if event.event_type == "mood_logged":
                daily.mood_score = payload.get("mood_score", 0.0)
                daily.stress_score = payload.get("stress_score", 0.0)
                daily.fatigue_index = payload.get("fatigue_index", 0.0)

    def _apply_event_to_weekly(self, weekly: WeeklyAggregate, event: RawAnalyticsEvent):
        payload = event.payload
        if event.event_category == "workout" and event.event_type == "workout_completed":
            weekly.total_volume_kg = (weekly.total_volume_kg or 0.0) + payload.get("total_volume_kg", 0.0)
            
            # Simple moving average for recovery
            if not weekly.avg_recovery_score:
                weekly.avg_recovery_score = payload.get("recovery_score", 0.0)
            else:
                weekly.avg_recovery_score = (weekly.avg_recovery_score + payload.get("recovery_score", 0.0)) / 2

    def _apply_event_to_monthly(self, monthly: MonthlyAggregate, event: RawAnalyticsEvent):
        payload = event.payload
        if event.event_category == "workout" and event.event_type == "workout_completed":
            monthly.total_volume_kg = (monthly.total_volume_kg or 0.0) + payload.get("total_volume_kg", 0.0)

    def _calculate_consistency(self, daily: DailyAggregate, user_id: int, target_date):
        """
        Calculates consistency % based on the last 30 days of workouts vs plans.
        (A simplified version for the pipeline)
        """
        # In a real scenario, this would compare workout_plans with workout_sessions.
        # For simplicity, we assume an arbitrary target of 4 workouts a week (approx 16/month)
        start_date = target_date - timedelta(days=30)
        
        # Count completed workouts in the last 30 days
        completed = self.db.query(func.count(WorkoutSession.id)).filter(
            WorkoutSession.user_id == user_id,
            func.date(WorkoutSession.start_time) >= start_date,
            func.date(WorkoutSession.start_time) <= target_date,
            WorkoutSession.status == "completed"
        ).scalar() or 0
        
        # Assume target is 16 workouts in 30 days
        target = 16
        consistency = min((completed / target) * 100.0, 100.0) if target > 0 else 0.0
        daily.workout_consistency_pct = consistency
        
        # Generate an explanation for this metric
        explanation = MetricExplanation(
            user_id=user_id,
            metric_name="workout_consistency",
            date_context=target_date.strftime("%Y-%m-%d"),
            explanation_text=f"Workout Consistency: {consistency:.1f}%. Based on {completed} completed workouts in the last 30 days.",
            formula_components={
                "completed_workouts": completed,
                "target_workouts": target,
                "timeframe_days": 30
            },
            trend_direction="up" if consistency > 50 else "down",
            trend_value=consistency - 50.0 # dummy trend
        )
        self.db.add(explanation)

def ingest_raw_event(db: Session, user_id: int, category: str, event_type: str, payload: dict, source_id: str = None):
    """
    Helper function to insert a raw event and trigger processing.
    """
    event = RawAnalyticsEvent(
        user_id=user_id,
        event_category=category,
        event_type=event_type,
        source_id=source_id,
        payload=payload
    )
    db.add(event)
    db.commit()
    
    # Process it immediately (in a production system, this could be pushed to a message queue)
    engine = AnalyticsEngine(db)
    engine.process_raw_event(event)
    return event
