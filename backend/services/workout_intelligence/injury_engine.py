from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.models.models import UserInjuryProfile, InjuryKnowledgeNode, MasterExercise

def get_active_user_injuries(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Fetch active injuries for a user and the corresponding knowledge nodes."""
    profiles = db.query(UserInjuryProfile, InjuryKnowledgeNode).join(
        InjuryKnowledgeNode, UserInjuryProfile.injury_node_id == InjuryKnowledgeNode.id
    ).filter(
        UserInjuryProfile.user_id == user_id,
        UserInjuryProfile.status == "active"
    ).all()
    
    res = []
    for p, node in profiles:
        res.append({
            "profile_id": p.id,
            "injury_name": node.name,
            "affected_region": node.affected_region,
            "pain_level": p.pain_level,
            "conflicting_movements": node.conflicting_movements,
            "safe_alternatives": node.safe_alternatives
        })
    return res

def filter_exercises_for_injury(db: Session, user_id: int, exercises: List[MasterExercise]) -> List[Dict[str, Any]]:
    """
    Takes a list of exercises and flags those that are risky based on user's active injuries.
    """
    active_injuries = get_active_user_injuries(db, user_id)
    if not active_injuries:
        return [{"exercise": ex, "is_safe": True, "warnings": []} for ex in exercises]

    conflicting_movements = set()
    affected_regions = set()
    for inj in active_injuries:
        affected_regions.add(inj["affected_region"].lower())
        for mov in inj["conflicting_movements"]:
            conflicting_movements.add(mov.lower())

    results = []
    for ex in exercises:
        warnings = []
        is_safe = True
        
        # Check movement pattern conflicts
        if ex.movement_pattern.lower() in conflicting_movements:
            is_safe = False
            warnings.append(f"Movement pattern '{ex.movement_pattern}' conflicts with active injury.")

        # Check direct joint stress
        for stress in ex.joint_stress:
            joint = stress.get("joint", "").lower()
            level = stress.get("level", "").lower()
            if joint in affected_regions and level in ["high", "moderate"]:
                is_safe = False
                warnings.append(f"Places {level} stress on {joint}, which is currently injured.")

        results.append({
            "exercise": ex,
            "is_safe": is_safe,
            "warnings": warnings
        })
        
    return results

def get_safe_alternatives(db: Session, user_id: int, target_muscle: str) -> List[MasterExercise]:
    """
    Returns exercises for a target muscle that do not conflict with the user's active injuries.
    """
    all_muscle_exs = db.query(MasterExercise).filter(MasterExercise.primary_muscle == target_muscle).all()
    filtered = filter_exercises_for_injury(db, user_id, all_muscle_exs)
    
    safe_exs = [item["exercise"] for item in filtered if item["is_safe"]]
    return safe_exs
