import sys
import os
from datetime import datetime, timedelta

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.core.database import Base, engine, SessionLocal
from backend.models.models import User, TemporalEvent, EventRecurrenceRule, TemporalEventAudit
from backend.schemas.temporal_event_system import (
    TemporalEventCreate,
    TemporalEventUpdate,
    TemporalEventTransition,
    EventRecurrenceRuleCreate,
    TimelineQueryFilter,
    EventStatus,
    EventPriority,
    EventSource,
    RecurrenceFrequency
)
from backend.services.temporal_event_system.service import TemporalEventService
from backend.services.temporal_event_system.engine.state_machine import StateMachineEngine


def run_tes_suite():
    print("=" * 80)
    print("RUNNING FITX TEMPORAL EVENT SYSTEM (TES) VERIFICATION SUITE")
    print("=" * 80)

    # 1. Initialize DB tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Create test user
        test_user = db.query(User).filter(User.email == "tes_test_user@fitx.ai").first()
        if not test_user:
            test_user = User(
                email="tes_test_user@fitx.ai",
                hashed_password="test_password_hash",
                full_name="TES Test User"
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

        user_id = test_user.id
        print(f"[1] Verified Test User (ID: {user_id})")

        # 2. Test Single Event Creation across multiple domain categories
        now = datetime.utcnow()
        workout_event_input = TemporalEventCreate(
            title="Hypertrophy Chest & Triceps",
            description="Push day 1: Bench Press, Incline DB Press, Cable Flyes",
            category="workout",
            event_type="session",
            status=EventStatus.SCHEDULED,
            priority=EventPriority.HIGH,
            source=EventSource.USER,
            planned_start_at=now,
            planned_end_at=now + timedelta(minutes=60),
            duration_minutes=60,
            metadata_payload={"target_muscle_groups": ["chest", "triceps"], "planned_sets": 16},
            tags=["hypertrophy", "push", "strength"]
        )

        workout_event = TemporalEventService.create_event(db, user_id, workout_event_input)
        print(f"[2] Created Workout Temporal Event ID: {workout_event.id} (Category: {workout_event.category})")
        assert workout_event.status == EventStatus.SCHEDULED.value

        meal_event_input = TemporalEventCreate(
            title="High-Protein Post-Workout Meal",
            category="nutrition",
            event_type="meal",
            status=EventStatus.SCHEDULED,
            priority=EventPriority.MEDIUM,
            source=EventSource.AI_COACH,
            planned_start_at=now + timedelta(hours=2),
            duration_minutes=30,
            metadata_payload={"calories": 750, "protein_g": 55, "carbs_g": 80, "fat_g": 20},
            tags=["nutrition", "post_workout", "refeed"]
        )
        meal_event = TemporalEventService.create_event(db, user_id, meal_event_input)
        print(f"[3] Created Meal Temporal Event ID: {meal_event.id} (Source: {meal_event.source})")

        # 3. Test Recurring Event Creation with RRULE
        recurring_workout_input = TemporalEventCreate(
            title="Daily Morning Hydration & Mobility Check",
            category="hydration",
            event_type="habit_check",
            status=EventStatus.SCHEDULED,
            priority=EventPriority.MEDIUM,
            source=EventSource.SYSTEM_AUTOMATION,
            planned_start_at=now.replace(hour=7, minute=0, second=0),
            duration_minutes=15,
            metadata_payload={"water_target_ml": 500},
            tags=["habit", "morning", "hydration"],
            recurrence_rule=EventRecurrenceRuleCreate(
                frequency=RecurrenceFrequency.DAILY,
                interval=1,
                by_weekday=["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
            )
        )

        rec_event = TemporalEventService.create_event(db, user_id, recurring_workout_input)
        print(f"[4] Created Recurring Event ID: {rec_event.id} with RRULE (Freq: {rec_event.recurrence_rule.frequency})")
        assert rec_event.recurrence_rule is not None

        # 4. Test State Machine Lifecycle & Transitions
        print("\n--- Testing State Machine Transitions ---")
        # SCHEDULED -> ACTIVE
        active_trans = TemporalEventTransition(
            target_status=EventStatus.ACTIVE,
            actor_type=EventSource.USER,
            actual_start_at=now
        )
        workout_event = TemporalEventService.transition_event_status(db, workout_event.id, user_id, active_trans)
        assert workout_event.status == EventStatus.ACTIVE.value
        print(f"    Transitioned to ACTIVE. Actual start at: {workout_event.actual_start_at}")

        # ACTIVE -> COMPLETED
        comp_trans = TemporalEventTransition(
            target_status=EventStatus.COMPLETED,
            actor_type=EventSource.USER,
            actual_end_at=now + timedelta(minutes=55)
        )
        workout_event = TemporalEventService.transition_event_status(db, workout_event.id, user_id, comp_trans)
        assert workout_event.status == EventStatus.COMPLETED.value
        assert workout_event.duration_minutes == 55
        print(f"    Transitioned to COMPLETED. Actual duration: {workout_event.duration_minutes} mins")

        # Test Invalid State Transition (COMPLETED -> SCHEDULED should fail)
        try:
            invalid_trans = TemporalEventTransition(target_status=EventStatus.SCHEDULED)
            StateMachineEngine.validate_transition(workout_event.status, invalid_trans.target_status.value)
            assert False, "Should have raised ValueError for invalid state transition"
        except ValueError as err:
            print(f"    Successfully blocked invalid state transition: {err}")

        # 5. Test Virtual Timeline Expansion & Range Queries
        print("\n--- Testing Timeline Slice Query with RRULE Expansion ---")
        filters = TimelineQueryFilter(
            start_date=now - timedelta(days=1),
            end_date=now + timedelta(days=7),
            include_virtual=True
        )
        timeline_slice = TemporalEventService.get_timeline(db, user_id, filters)
        print(f"    Timeline slice retrieved: Total Events={timeline_slice['total_events']}, "
              f"Materialized={timeline_slice['materialized_count']}, Virtual={timeline_slice['virtual_count']}")
        assert timeline_slice["total_events"] > 0
        assert timeline_slice["virtual_count"] >= 5

        # 6. Test Virtual Instance Materialization
        print("\n--- Testing Virtual Instance Materialization ---")
        virtual_events = [e for e in timeline_slice["events"] if e["is_virtual"]]
        target_v_event = virtual_events[0]
        v_id = target_v_event["id"]
        print(f"    Targeting Virtual Event ID for state transition: {v_id}")

        v_trans = TemporalEventTransition(
            target_status=EventStatus.COMPLETED,
            actor_type=EventSource.USER,
            reason="Completed morning hydration"
        )
        materialized_event = TemporalEventService.transition_event_status(db, v_id, user_id, v_trans)
        print(f"    Successfully materialized virtual event into DB ID: {materialized_event.id} (Status: {materialized_event.status})")
        assert materialized_event.status == EventStatus.COMPLETED.value
        assert materialized_event.master_event_id == rec_event.id

        # 7. Test Audit Trail Log Generation
        print("\n--- Testing Immutable Audit Trail History ---")
        audits = TemporalEventService.get_audit_history(db, workout_event.id, user_id)
        print(f"    Found {len(audits)} audit records for workout event {workout_event.id}:")
        for a in audits:
            print(f"      - Action: {a.action} | Previous: {a.previous_status} -> New: {a.new_status} | Timestamp: {a.timestamp}")
        assert len(audits) >= 3

        # 8. Test Analytics & Feature Extraction Engine
        print("\n--- Testing Analytics & Feature Extraction Engine ---")
        analytics = TemporalEventService.get_analytics_summary(db, user_id, lookback_days=30)
        print(f"    User Analytics Summary:")
        print(f"      - Adherence Ratio: {analytics['adherence_ratio']}")
        print(f"      - Consistency Score: {analytics['consistency_score']}")
        print(f"      - Current Streak: {analytics['current_streak_days']} days")
        print(f"      - Overtraining Risk Score: {analytics['overtraining_risk_score']}")
        print(f"      - Category Breakdown: {analytics['category_distribution']}")
        assert "adherence_ratio" in analytics

        # 9. Test Incremental Offline Sync API
        print("\n--- Testing Incremental Offline Mobile Sync ---")
        sync_result = TemporalEventService.get_sync_updates(db, user_id, last_sync_at=now - timedelta(minutes=5))
        print(f"    Incremental Sync returned {sync_result['total_count']} updated records since {now - timedelta(minutes=5)}")
        assert sync_result["total_count"] >= 3

        print("\n" + "=" * 80)
        print("ALL FITX TEMPORAL EVENT SYSTEM (TES) TESTS PASSED SUCCESSFULLY!")
        print("=" * 80)

    finally:
        db.close()

if __name__ == "__main__":
    run_tes_suite()
