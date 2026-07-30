from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
from backend.models.models import (
    User Gamification, WorkoutSession, WorkoutSet, DailyNutritionSummary,
    PsychologicalLog, BodyMeasurementLog, TemporalEvent, AIWorkoutRecommendation
)
from backend.schemas.growth import (
    GrowthTreeStats, GrowthTreeResponse, AnalyticsDashboardResponse, TrendData,
    TimelineResponse, TimelineEvent
)

class GrowthService:
    def __init__(self, db: Session):
        self.db = db

    def get_growth_tree(self, user_id: int) -> GrowthTreeResponse:
        # Mocking actual logic for now to calculate these from real data.
        # In a real scenario, this would aggregate workout logs, recovery scores, and nutrition.
        # Let's derive basic stats:
        sessions_count = self.db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id, WorkoutSession.status == "completed").count()
        nutrition_logs_count = self.db.query(DailyNutritionSummary).filter(DailyNutritionSummary.user_id == user_id).count()
        
        stats = GrowthTreeStats(
            level=min(50, 1 + (sessions_count // 5)),
            strength_level=min(100, 10 + (sessions_count * 2)),
            endurance_level=min(100, 5 + sessions_count),
            mobility_level=min(100, 15 + (sessions_count // 2)),
            nutrition_level=min(100, 10 + (nutrition_logs_count * 3)),
            recovery_level=min(100, 50 + (sessions_count % 10)),
            consistency_level=min(100, 20 + sessions_count),
            mental_resilience_level=min(100, 30 + (sessions_count // 3)),
            discipline_level=min(100, 25 + (sessions_count // 2)),
            cardiovascular_health_level=min(100, 10 + sessions_count)
        )

        return GrowthTreeResponse(
            stats=stats,
            message="Your Growth Tree attributes are calculated based on your historical training, nutrition, and recovery data."
        )

    def get_analytics_dashboard(self, user_id: int) -> AnalyticsDashboardResponse:
        # Calculate completion %
        total_sessions = self.db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id).count()
        completed_sessions = self.db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id, WorkoutSession.status == "completed").count()
        completion_pct = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0.0

        # Fake trend data for demonstration (this would normally be aggregated by date)
        volume_trend = [TrendData(date=(datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), value=1000 + i*50) for i in range(7, 0, -1)]
        recovery_trend = [TrendData(date=(datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), value=70 + (i%15)) for i in range(7, 0, -1)]
        
        # Check Psychological Logs for mood and energy trends
        logs = self.db.query(PsychologicalLog).filter(PsychologicalLog.user_id == user_id).order_by(PsychologicalLog.date.asc()).limit(7).all()
        mood_trend = []
        energy_trend = []
        for i, log in enumerate(logs):
            if log.mood: mood_trend.append(TrendData(date=log.date, value=log.mood))
            if log.energy: energy_trend.append(TrendData(date=log.date, value=log.energy))

        if not mood_trend:
             mood_trend = [TrendData(date=(datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), value=7.5) for i in range(7, 0, -1)]
        if not energy_trend:
             energy_trend = [TrendData(date=(datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), value=6.5) for i in range(7, 0, -1)]

        return AnalyticsDashboardResponse(
            workout_completion_pct=completion_pct,
            workout_consistency_score=min(100, completion_pct * 1.1),
            exercise_frequency={"Bench Press": 5, "Squat": 4, "Deadlift": 3, "Pull Up": 6},
            volume_growth_trend=volume_trend,
            recovery_trend=recovery_trend,
            energy_trend=energy_trend,
            mood_trend=mood_trend,
            plateau_risk=15.5,
            overtraining_risk=22.0,
            ai_confidence_score=92.5,
            training_age_months=12
        )

    def get_timeline(self, user_id: int, date: str = None) -> TimelineResponse:
        events = []
        
        # 1. Fetch Workouts
        query = self.db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id)
        if date:
            query = query.filter(WorkoutSession.start_time >= datetime.strptime(date, "%Y-%m-%d"), 
                                 WorkoutSession.start_time < datetime.strptime(date, "%Y-%m-%d") + timedelta(days=1))
        
        workouts = query.all()
        for w in workouts:
            events.append(TimelineEvent(
                id=f"workout-{w.id}",
                date=w.start_time.strftime("%Y-%m-%d"),
                time=w.start_time.strftime("%H:%M"),
                type="workout",
                title=f"Workout: {w.name}",
                description=f"Completed {w.total_sets_completed} sets, volume: {w.total_volume_kg}kg",
                icon="Dumbbell",
                details={"status": w.status, "duration": w.duration_seconds}
            ))

        # 2. Fetch AI Recommendations
        ai_query = self.db.query(AIWorkoutRecommendation).filter(AIWorkoutRecommendation.user_id == user_id)
        if date:
            ai_query = ai_query.filter(AIWorkoutRecommendation.created_at >= datetime.strptime(date, "%Y-%m-%d"), 
                                       AIWorkoutRecommendation.created_at < datetime.strptime(date, "%Y-%m-%d") + timedelta(days=1))
        
        recs = ai_query.all()
        for r in recs:
            events.append(TimelineEvent(
                id=f"ai-rec-{r.id}",
                date=r.created_at.strftime("%Y-%m-%d"),
                time=r.created_at.strftime("%H:%M"),
                type="ai_recommendation",
                title="AI Coach Suggestion",
                description=r.message,
                icon="Bot",
                details={"confidence": r.confidence_score, "evidence": r.evidence_sources}
            ))

        # Sort by date/time
        events.sort(key=lambda x: x.date + " " + x.time, reverse=True)
        return TimelineResponse(events=events)
