from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.models import User, OnboardingProfile
from backend.schemas.schemas import OnboardingInput, OnboardingOut, MicroPromptOut

router = APIRouter(prefix="/onboarding", tags=["Progressive Onboarding & Health Profile"])

@router.post("/submit", response_model=OnboardingOut)
def submit_onboarding(
    onboarding_in: OnboardingInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
    data = onboarding_in.model_dump()
    if existing:
        for k, v in data.items():
            if hasattr(existing, k):
                setattr(existing, k, v)
        existing.is_completed = True
        db.commit()
        db.refresh(existing)
        return existing
    else:
        profile = OnboardingProfile(user_id=current_user.id, is_completed=True, **data)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

@router.get("/profile", response_model=OnboardingOut)
def get_onboarding_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
    if not existing:
        existing = OnboardingProfile(user_id=current_user.id, is_completed=False)
        db.add(existing)
        db.commit()
        db.refresh(existing)
    return existing

@router.get("/micro-prompt", response_model=MicroPromptOut)
def get_daily_micro_prompt(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a single-tap contextual micro-prompt for progressive context collection.
    """
    return MicroPromptOut(
        prompt_id="prompt_circadian_01",
        category="Sleep & Stress Baseline",
        question="What is your average sleep duration on workdays?",
        options=[
            {"label": "< 6 Hours", "value": "5.5"},
            {"label": "6 - 7.5 Hours", "value": "7.0"},
            {"label": "7.5 - 9 Hours", "value": "8.0"},
            {"label": "> 9 Hours", "value": "9.5"}
        ],
        confidence_impact=0.05
    )

@router.get("/confidence")
def get_health_profile_confidence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
    if not profile or not profile.is_completed:
        return {"overall_confidence_score": 0.45, "status": "INCOMPLETE", "missing_categories": ["goals", "equipment", "sleep"]}
    return {
        "overall_confidence_score": 0.94,
        "status": "HIGH_CONFIDENCE",
        "verified_vectors": 28,
        "pending_micro_prompts": 2
    }
