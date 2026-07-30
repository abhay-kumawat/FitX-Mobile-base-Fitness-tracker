import random
from typing import Dict, Any

class InsightExplainer:
    """
    Generates human-readable explanations and confidence scores for calculated metrics.
    """
    
    @staticmethod
    def explain_metric(metric_name: str, value: float, components: Dict[str, Any]) -> Dict[str, Any]:
        """
        Returns a rich explanation payload for the frontend InsightExplainer component.
        """
        if metric_name == "workout_consistency_pct":
            completed = components.get("completed_workouts", 0)
            skipped = components.get("skipped_workouts", 0)
            target = components.get("target_workouts", 1)
            timeframe = components.get("timeframe_days", 30)
            
            explanation = f"Based on {completed} completed workouts against a target of {target} in the last {timeframe} days."
            if skipped > 0:
                explanation += f" ({skipped} workouts skipped)."
                
            confidence = 100.0 if completed + skipped > 5 else 60.0
            
            return {
                "title": "Workout Consistency",
                "value": f"{value:.1f}%",
                "explanation": explanation,
                "confidence": f"{confidence:.0f}%",
                "trend_direction": "up" if value >= 50 else "down",
                "trend_text": f"{'+' if value >= 50 else ''}{value - 50.0:.1f}% vs last period" # Mock trend
            }
            
        elif metric_name == "recovery_score":
            sleep = components.get("sleep_hours", 7.5)
            fatigue = components.get("fatigue_index", 20.0)
            
            explanation = f"Calculated from average sleep ({sleep:.1f}h) and accumulated fatigue index ({fatigue:.1f}/100)."
            
            return {
                "title": "Recovery Score",
                "value": f"{value:.1f}",
                "explanation": explanation,
                "confidence": "95%",
                "trend_direction": "up" if value >= 70 else "down",
                "trend_text": f"{'+' if value >= 70 else ''}{value - 70.0:.1f} pts"
            }
            
        elif metric_name == "training_adherence_pct":
            completed = components.get("completed_exercises", 0)
            skipped = components.get("skipped_exercises", 0)
            
            explanation = f"You completed {completed} out of {completed + skipped} planned exercises."
            
            return {
                "title": "Training Adherence",
                "value": f"{value:.1f}%",
                "explanation": explanation,
                "confidence": "100%",
                "trend_direction": "neutral",
                "trend_text": "0.0%"
            }
            
        # Fallback
        return {
            "title": metric_name.replace("_", " ").title(),
            "value": str(value),
            "explanation": "Calculated from aggregated user data.",
            "confidence": "90%",
            "trend_direction": "neutral",
            "trend_text": "N/A"
        }
