from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.analytics import DailyAggregate, MetricExplanation, RawAnalyticsEvent
from backend.services.analytics.explainability import InsightExplainer
from typing import List, Dict, Any

router = APIRouter(prefix="/pipeline/analytics", tags=["Analytics Pipeline"])

@router.get("/dashboard")
def get_analytics_dashboard(
    user_id: int = 1,
    timeframe: str = "30d", # 7d, 14d, 30d, 90d, 1y
    db: Session = Depends(get_db)
):
    """
    Fetches aggregated metrics for the Growth Intelligence dashboard.
    """
    # In a real app, timeframe would filter dates. We'll fetch the most recent DailyAggregate for the summary
    # and all aggregates in the timeframe for graphs.
    
    daily_aggs = db.query(DailyAggregate).filter(
        DailyAggregate.user_id == user_id
    ).order_by(DailyAggregate.date.desc()).limit(30).all()
    
    if not daily_aggs:
        return {"status": "no_data"}
        
    latest = daily_aggs[0]
    
    # Process for the UI cards
    cards = []
    
    metrics_to_show = [
        ("workout_consistency_pct", latest.workout_consistency_pct),
        ("training_adherence_pct", latest.training_adherence_pct),
        ("recovery_score", latest.recovery_score),
        ("daily_volume_kg", latest.daily_volume_kg),
        ("calories_burned", latest.calories_burned),
        ("body_weight_kg", latest.body_weight_kg)
    ]
    
    for m_name, m_val in metrics_to_show:
        # Check if there is a real explanation stored, otherwise fallback to InsightExplainer
        explanation = db.query(MetricExplanation).filter_by(
            user_id=user_id, metric_name=m_name, date_context=latest.date
        ).first()
        
        if explanation:
            cards.append({
                "metric_id": m_name,
                "title": m_name.replace("_", " ").title(),
                "value": m_val,
                "explanation": explanation.explanation_text,
                "confidence": f"{explanation.confidence_pct:.0f}%",
                "trend_direction": explanation.trend_direction,
                "trend_value": f"{explanation.trend_value:+.1f}"
            })
        else:
            cards.append(InsightExplainer.explain_metric(m_name, m_val or 0.0, {}))
            
    # For graphs
    graph_data = [
        {
            "date": agg.date,
            "consistency": agg.workout_consistency_pct,
            "recovery": agg.recovery_score,
            "volume": agg.daily_volume_kg,
            "weight": agg.body_weight_kg
        } for agg in reversed(daily_aggs)
    ]
    
    return {
        "status": "success",
        "latest_date": latest.date,
        "cards": cards,
        "graph_data": graph_data
    }

@router.get("/timeline")
def get_timeline(
    user_id: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Fetches raw analytics events for the 'Detailed History' view.
    """
    events = db.query(RawAnalyticsEvent).filter(
        RawAnalyticsEvent.user_id == user_id
    ).order_by(RawAnalyticsEvent.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "category": e.event_category,
            "type": e.event_type,
            "payload": e.payload
        } for e in events
    ]
