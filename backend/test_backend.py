import os
import sys

# Ensure FitX root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app

from backend.core.events import startup_event_handler

client = TestClient(app)

def run_all_tests():
    print("--- Testing FitX AI Backend Endpoints ---")
    startup_event_handler()
    
    # 1. Root
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("[OK] Root endpoint OK")

    # 1.5 Auth & JWT Token Flow (Milestone 1)
    # Login existing admin user or signup test user
    login_payload = {
        "email": "alex.rivera@fitx.ai",
        "password": "FitXPassword2026!"
    }
    r = client.post("/api/v1/auth/login", json=login_payload)
    if r.status_code != 200:
        # Signup test user if default admin missing
        signup_payload = {
            "email": "alex.rivera@fitx.ai",
            "password": "FitXPassword2026!",
            "full_name": "Alex Rivera"
        }
        client.post("/api/v1/auth/signup", json=signup_payload)
        r = client.post("/api/v1/auth/login", json=login_payload)
    
    assert r.status_code == 200, f"Login failed: {r.text}"
    token = r.json()["access_token"]
    refresh_token = r.json().get("refresh_token")
    assert refresh_token is not None, "Refresh token missing from login response!"
    auth_headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Auth Signup & Dual JWT Token Login OK: Access & Refresh tokens issued")

    # Phase 11 Wave 1 Assertion: Token Refresh Rotation
    ref_res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 200, f"Token refresh failed: {ref_res.text}"
    assert ref_res.json().get("access_token") is not None, "Failed to issue new access token from refresh token"
    print("[OK] Dual-Token JWT Refresh Rotation OK: Issued new access token")



    # Verify Auth Me Endpoint
    r = client.get("/api/v1/auth/me", headers=auth_headers)
    assert r.status_code == 200, f"Auth Me failed: {r.text}"
    print(f"[OK] Auth Me OK: Authenticated as {r.json()['email']}")

    # Verify Profile Endpoint with JWT Auth
    r = client.get("/api/v1/users/profile", headers=auth_headers)
    assert r.status_code == 200, f"Get Profile failed: {r.text}"
    print(f"[OK] Authenticated Profile Retrieval OK: Goal={r.json()['fitness_goal']}")



    # 2. Recovery Score (Service 07)
    r = client.post("/api/v1/recovery/score", json={
        "sleep_hours": 7.5,
        "hydration_liters": 2.5,
        "workout_load": 65.0,
        "resting_heart_rate": 62,
        "stress_score": 30.0,
        "soreness_score": 20.0
    })
    assert r.status_code == 200, f"Recovery score failed: {r.text}"
    print(f"[OK] Recovery Score OK: {r.json()['total_score']} ({r.json()['status']})")

    # 3. Adaptive Plan Generator (Service 01)
    r = client.post("/api/v1/adaptive-plan/generate", json={
        "sleep_hours": 5.0,
        "calories_consumed": 1800,
        "missed_workouts": 1,
        "available_equipment": ["dumbbells", "barbell"],
        "active_injuries": ["shoulder"],
        "schedule_minutes": 45
    })
    assert r.status_code == 200, f"Adaptive plan failed: {r.text}"
    print(f"[OK] Adaptive Plan Generator OK: {r.json()['adapted_plan_name']}")

    # 4. Progressive Overload (Service 10)
    r = client.post("/api/v1/progressive-overload/calculate", json={
        "exercise_name": "Barbell Squat",
        "current_weight": 100.0,
        "current_reps": 8,
        "current_sets": 3,
        "rpe": 7.5,
        "fatigue_level": 30.0
    })
    assert r.status_code == 200, f"Progressive overload failed: {r.text}"
    print(f"[OK] Progressive Overload Engine OK: Next Weight={r.json()['target_weight']}kg, Reps={r.json()['target_reps']}")

    # 5. Budget Meal Planner (Service 14)
    r = client.post("/api/v1/meal-planner/generate", json={
        "daily_budget": 25.0,
        "region": "North America",
        "dietary_preference": "veg",
        "cooking_skill": "easy",
        "target_calories": 2200
    })
    assert r.status_code == 200, f"Meal planner failed: {r.text}"
    print(f"[OK] Budget Meal Planner OK: Actual Cost=${r.json()['actual_cost']}")

    # 6. AI Grocery Generator (Service 15)
    r = client.get("/api/v1/grocery/generate")
    assert r.status_code == 200, f"Grocery generator failed: {r.text}"
    print(f"[OK] AI Grocery Generator OK: Total Cost=${r.json()['total_cost']}")

    # 7. AI Coach Chat
    r = client.post("/api/v1/coach/chat", json={
        "user_id": 1,
        "message": "I have mild shoulder tightness today."
    })
    assert r.status_code == 200, f"Coach chat failed: {r.text}"
    print(f"[OK] AI Coach Chat OK: Reply='{r.json()['reply'][:60]}...'")

    # Phase 11 Wave 1 Assertion: AI Medical Security Guardrails
    med_res = client.post("/api/v1/coach/chat", json={
        "user_id": 1,
        "message": "Can you diagnose my knee injury and prescribe medical treatment?"
    })
    assert med_res.status_code == 200, f"Medical guardrail chat failed: {med_res.text}"
    assert "FitX AI Notice:" in med_res.json()["reply"], "Medical disclaimer missing from diagnostic query response!"
    print("[OK] AI Medical Security Guardrail Filter OK: Intercepted diagnostic query with disclaimer")


    # 8. Exercise Graph (Service 09)
    r = client.get("/api/v1/exercise-graph")
    assert r.status_code == 200, f"Exercise graph failed: {r.text}"
    print(f"[OK] AI Exercise Graph OK: {len(r.json())} nodes loaded")

    # 9. Fatigue Prediction (Service 11)
    r = client.get("/api/v1/fatigue/predict?recovery_score=75")
    assert r.status_code == 200, f"Fatigue prediction failed: {r.text}"
    print(f"[OK] Fatigue Prediction OK: Legs fatigue={r.json()['legs']}%")

    # 10. Micro Workout Streak Protection (Service 16)
    r = client.post("/api/v1/streak/micro-workout", json={"available_minutes": 15})
    assert r.status_code == 200, f"Micro workout failed: {r.text}"
    print(f"[OK] Streak Protection Micro Workout OK: {r.json()['title']}")

    # 11. Onboarding Submission
    r = client.post("/api/v1/onboarding/submit", json={
        "age": 28,
        "gender": "male",
        "height_cm": 180.0,
        "weight_kg": 78.5,
        "experience_level": "intermediate",
        "primary_goal": "build_muscle",
        "preferred_split": "ppl",
        "injury_history": {"shoulder": {"rotator_cuff": True, "pain": 2}}
    })
    assert r.status_code == 200, f"Onboarding submission failed: {r.text}"
    print(f"[OK] World-Class Onboarding OK: User Goal = {r.json()['primary_goal']}")

    # 11.5 Progressive Onboarding Micro-Prompt & Confidence (Milestone 2)
    r = client.get("/api/v1/onboarding/micro-prompt", headers=auth_headers)
    assert r.status_code == 200, f"Micro-prompt failed: {r.text}"
    print(f"[OK] Micro-Prompt OK: Prompt ID = {r.json()['prompt_id']}")

    # 11.6 Timeline Engine & Fitness Time Machine (Milestone 3)
    r = client.get("/api/v1/timeline/daily-container?date=2026-07-28", headers=auth_headers)
    assert r.status_code == 200, f"Daily container failed: {r.text}"
    print(f"[OK] FitX Timeline Engine Daily Container OK: Date = {r.json()['date']}")

    tm_payload = {
        "window_a_start": "2026-05-01",
        "window_a_end": "2026-05-31",
        "window_b_start": "2026-06-01",
        "window_b_end": "2026-06-30"
    }
    r = client.post("/api/v1/timeline/time-machine", json=tm_payload, headers=auth_headers)
    assert r.status_code == 200, f"Time machine failed: {r.text}"
    print(f"[OK] Fitness Time Machine AI Engine OK: Strength Delta = +{r.json()['strength_delta_pct']}%")

    r = client.get("/api/v1/timeline/search?query=sleep", headers=auth_headers)
    assert r.status_code == 200, f"Timeline search failed: {r.text}"
    print(f"[OK] Natural Language Timeline Search OK: Matched {r.json()['results_count']} dates")



    # 12. Exercise Database Search & Taxonomy
    r = client.get("/api/v1/exercises/search?category=chest")
    assert r.status_code == 200, f"Exercise search failed: {r.text}"
    print(f"[OK] Master Exercise Database OK: {len(r.json())} chest exercises returned")

    # 13. Workout Session Start & Set Logging
    r = client.post("/api/v1/workout/start", json={"name": "Hypertrophy Push v2"})
    assert r.status_code == 200, f"Workout start failed: {r.text}"
    session_id = r.json()["id"]

    r_set = client.post("/api/v1/workout/log-set", json={
        "session_id": session_id,
        "exercise_name": "Incline Dumbbell Press",
        "set_number": 1,
        "set_type": "working",
        "weight_kg": 32.0,
        "reps": 10,
        "rpe": 8.0,
        "rir": 2
    })
    assert r_set.status_code == 200, f"Log set failed: {r_set.text}"
    print(f"[OK] Workout Execution Logging OK: Set 1 1RM={r_set.json()['estimated_1rm']}kg, PR={r_set.json()['is_pr']}")

    # 13.5 Barbell Plate Calculator & Warmup Protocol (Milestone 4)
    r = client.get("/api/v1/workout/plate-calculator?target_weight_kg=100.0", headers=auth_headers)
    assert r.status_code == 200, f"Plate calculator failed: {r.text}"
    print(f"[OK] Barbell Plate Calculator OK: Weight Per Side = {r.json()['weight_per_side_kg']}kg")

    # 13.6 Human Performance Engine (HPE) (Milestone 5)
    r = client.get("/api/v1/hpe/readiness", headers=auth_headers)
    assert r.status_code == 200, f"HPE readiness failed: {r.text}"
    print(f"[OK] Human Performance Engine (HPE) Readiness OK: Score = {r.json()['overall_readiness_score']}%")

    r = client.get("/api/v1/hpe/burnout-forecast", headers=auth_headers)
    assert r.status_code == 200, f"HPE burnout forecast failed: {r.text}"
    print(f"[OK] HPE ACWR Overtraining & Burnout Forecast OK: ACWR = {r.json()['acwr_ratio']}")

    # 13.7 Digital Twin Intelligence Engine (DTIE) (Milestone 6)
    r = client.get("/api/v1/digital-twin/avatar", headers=auth_headers)
    assert r.status_code == 200, f"Digital Twin avatar failed: {r.text}"
    print(f"[OK] 13-Layer Digital Twin Avatar Profile OK: Model Confidence = {r.json()['overall_confidence_score']}")

    sim_payload = {
        "training_days_per_week": 4,
        "target_sleep_hours": 8.0,
        "daily_protein_grams": 165.0
    }
    r = client.post("/api/v1/digital-twin/simulate-what-if", json=sim_payload, headers=auth_headers)
    assert r.status_code == 200, f"Digital Twin simulation failed: {r.text}"
    print(f"[OK] What-If Scenario Simulator Engine OK: Projected Bench 1RM = {r.json()['projected_1rm_bench_kg']}kg")

    r = client.get("/api/v1/digital-twin/baselines", headers=auth_headers)
    assert r.status_code == 200, f"Personal baselines failed: {r.text}"
    print(f"[OK] 15 Personal Baselines Engine OK: Typical Sleep = {r.json()['typical_sleep_hours']}h")

    # 13.8 Knowledge Intelligence Engine (KIE) (Milestone 7)
    r = client.get("/api/v1/kie/taxonomy", headers=auth_headers)
    assert r.status_code == 200, f"KIE taxonomy failed: {r.text}"
    print(f"[OK] 22 Knowledge Domains Taxonomy OK: {r.json()['domains_count']} domains indexed")

    r = client.get("/api/v1/kie/evidence-node?id=kie_node_hypertrophy_01", headers=auth_headers)
    assert r.status_code == 200, f"Evidence node failed: {r.text}"
    print(f"[OK] KIE 12-Field Peer-Reviewed Evidence Node OK: {r.json()['evidence_level']} Consensus = {r.json()['confidence_score']}")

    # 13.9 Product Intelligence & Continuous Evolution Engine (PICE) (Milestone 8)
    r = client.get("/api/v1/pice/health-dashboard", headers=auth_headers)
    assert r.status_code == 200, f"PICE health dashboard failed: {r.text}"
    print(f"[OK] Product Health Dashboard OK: DAU = {r.json()['dau']}, Day-30 Retention = {r.json()['day_30_retention_pct']}%")

    r = client.get("/api/v1/pice/feature-scorecard", headers=auth_headers)
    assert r.status_code == 200, f"Feature scorecard failed: {r.text}"
    print(f"[OK] 10-Vector Feature Quality Scorecard OK: {len(r.json())} features scored")

    ai_eval_payload = {
        "recommendation_id": "rec_90842",
        "action_taken": "ACCEPTED"
    }
    r = client.post("/api/v1/pice/ai-evaluation", json=ai_eval_payload, headers=auth_headers)
    assert r.status_code == 200, f"AI evaluation failed: {r.text}"
    print(f"[OK] AI Self-Evaluation Autoregulation Telemetry OK: Action = {r.json()['action_taken']}")

    fb_payload = {
        "category": "UX_FRICTION",
        "rating_stars": 5,
        "comment": "What-If Simulator is extremely intuitive!",
        "context_screen": "/profile"
    }
    r = client.post("/api/v1/pice/feedback", json=fb_payload, headers=auth_headers)
    assert r.status_code == 200, f"User feedback failed: {r.text}"
    print(f"[OK] Multi-Modal Feedback Engine OK: Status = {r.json()['status']}")






    # 14. Adaptive Muscle Readiness Score & Heatmap
    r = client.get("/api/v1/recovery/readiness-heatmap")
    assert r.status_code == 200, f"Readiness heatmap failed: {r.text}"
    print(f"[OK] Adaptive Muscle Readiness Score OK: Overall readiness = {r.json()['overall_readiness_score']}%")

    # 15. RAG Vector Memory Query
    r = client.post("/api/v1/ai/rag-query", json={"query": "Why am I feeling weak on bench press today?"})
    assert r.status_code == 200, f"RAG Query failed: {r.text}"
    print(f"[OK] RAG Vector AI Assistant OK: '{r.json()['answer'][:60]}...'")

    # 16. Health Diagnostic Check (Feature 39)
    r = client.get("/api/v1/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    assert r.json()["database_connected"] == True
    print(f"[OK] System Diagnostic Health Check OK: Status={r.json()['status']}, DB={r.json()['database_connected']}")

    # 17. Version Control Rollback (Feature 4)
    r = client.post("/api/v1/version-control/rollback?plan_id=1&target_version=1")
    assert r.status_code == 200, f"Rollback failed: {r.text}"
    print(f"[OK] Workout Plan Rollback OK: Status={r.json()['status']}")

    # 18. Exercise Equipment Substitution (Feature 7)
    r = client.get("/api/v1/exercises/substitute?original_exercise=Barbell%20Bench%20Press&available_equipment=dumbbell")
    assert r.status_code == 200, f"Substitute failed: {r.text}"
    print(f"[OK] Equipment Auto-Substitution OK: Substitutes={r.json()['substituted_with']}")

    # 19. Warmup Protocol Generator (Feature 15)
    r = client.get("/api/v1/workout/warmup-protocol?exercise_name=Barbell%20Squat&working_weight_kg=100.0")
    assert r.status_code == 200, f"Warmup protocol failed: {r.text}"
    print(f"[OK] Warmup Protocol Generator OK: {len(r.json()['warmup_sets'])} warm-up sets generated")

    # 20. Sleep & Stress Telemetry (Feature 12)
    r = client.post("/api/v1/telemetry/sleep-stress", json={
        "weight_kg": 75.0,
        "sleep_deep_hours": 2.2,
        "sleep_rem_hours": 1.9,
        "perceived_stress": 25.0
    })
    assert r.status_code == 200, f"Telemetry log failed: {r.text}"
    print(f"[OK] Sleep & Stress Telemetry OK: Deep sleep={r.json()['sleep_deep_hours']}h")

    # 21. Dynamic TDEE & BMR Calculator (Feature 17)
    r = client.get("/api/v1/nutrition/tdee-bmr?weight_kg=75.0&height_cm=178.0&age=28")
    assert r.status_code == 200, f"TDEE BMR failed: {r.text}"
    print(f"[OK] Dynamic TDEE & BMR OK: TDEE={r.json()['tdee_calories']} kcal, BMR={r.json()['bmr_mifflin']} kcal")

    # 22. Macro Target Auto-Splitter (Feature 18)
    r = client.get("/api/v1/nutrition/macro-split?goal=hypertrophy&target_calories=2500")
    assert r.status_code == 200, f"Macro split failed: {r.text}"
    print(f"[OK] Macro Target Auto-Splitter OK: Protein={r.json()['protein_g']}g, Carbs={r.json()['carbs_g']}g")

    # 23. Meal Logging & Calorie Tracker (Feature 21)
    r = client.post("/api/v1/nutrition/meals", json={
        "meal_name": "Post-Workout Shake & Oats",
        "calories": 650,
        "protein_g": 48.0,
        "carbs_g": 85.0,
        "fat_g": 12.0,
        "water_ml": 500.0
    })
    assert r.status_code == 200, f"Meal log failed: {r.text}"
    print(f"[OK] Meal Logging Tracker OK: Meal ID={r.json()['id']}, Calories={r.json()['calories']}")

    # 24. Hydration & Electrolyte Engine (Feature 22)
    r = client.get("/api/v1/nutrition/hydration?weight_kg=75.0")
    assert r.status_code == 200, f"Hydration failed: {r.text}"
    print(f"[OK] Hydration Engine OK: Required={r.json()['required_ml']}ml")

    # 25. Intermittent Fasting Tracker (Feature 23)
    r = client.get("/api/v1/nutrition/fasting?protocol=16:8")
    assert r.status_code == 200, f"Fasting failed: {r.text}"
    print(f"[OK] Intermittent Fasting Tracker OK: Elapsed={r.json()['elapsed_hours']}h")

    # 26. Micronutrient & Fiber Matrix (Feature 24)
    r = client.get("/api/v1/nutrition/micronutrients")
    assert r.status_code == 200, f"Micronutrients failed: {r.text}"
    print(f"[OK] Micronutrient Matrix OK: Completeness={r.json()['overall_completeness_pct']}%")

    # 27. Fitness XP & Level System (Feature 25)
    r = client.get("/api/v1/gamification/xp-status")
    assert r.status_code == 200, f"XP status failed: {r.text}"
    print(f"[OK] Fitness XP & Level System OK: Level={r.json()['current_level']}, Progress={r.json()['progress_pct']}%")

    # 28. Streak Engine & Freeze (Feature 26)
    r = client.get("/api/v1/gamification/streak")
    assert r.status_code == 200, f"Streak failed: {r.text}"
    print(f"[OK] Streak Engine OK: Streak={r.json()['current_streak_days']} days")

    # 29. Leaderboard Engine (Feature 28)
    r = client.get("/api/v1/gamification/leaderboard")
    assert r.status_code == 200, f"Leaderboard failed: {r.text}"
    print(f"[OK] Leaderboard Engine OK: Top rank={r.json()[0]['user_name']}")

    # 30. Social Feed & Kudos (Feature 29)
    r = client.get("/api/v1/social/feed")
    assert r.status_code == 200, f"Social feed failed: {r.text}"
    print(f"[OK] Social Activity Feed OK: {len(r.json())} posts fetched")

    # 31. Wearables Normalizer (Feature 32)
    r = client.post("/api/v1/wearables/sync", json={"provider": "apple_health", "payload": {"resting_heart_rate": 62}})
    assert r.status_code == 200, f"Wearable sync failed: {r.text}"
    print(f"[OK] Wearable Sync API Normalizer OK: Provider={r.json()['provider']}")

    # 32. VO2 Max Estimator (Feature 33)
    r = client.get("/api/v1/wearables/vo2max")
    assert r.status_code == 200, f"VO2 Max failed: {r.text}"
    print(f"[OK] VO2 Max Estimator OK: {r.json()['estimated_vo2max']} ml/kg/min")

    # 33. HR Zone Distribution (Feature 34)
    r = client.get("/api/v1/wearables/hr-zones")
    assert r.status_code == 200, f"HR zone failed: {r.text}"
    print(f"[OK] Heart Rate Zone Tracker OK: Dominant zone={r.json()['dominant_zone']}")

    # 34. Body Composition Forecast (Feature 35)
    r = client.get("/api/v1/analytics/body-composition-forecast?current_weight_kg=75.0&current_body_fat_pct=18.0")
    assert r.status_code == 200, f"Body fat forecast failed: {r.text}"
    print(f"[OK] Body Composition Trajectory Forecaster OK: 12-week BF%={r.json()['projected_12_weeks']['body_fat_pct']}%")

    # 35. Workout Execution & Lifecycle Engine Test
    r_start = client.post("/api/v1/workout/start", json={"name": "End-to-End Test Routine"}, headers=auth_headers)
    assert r_start.status_code == 200, f"Workout start failed: {r_start.text}"
    session_id = r_start.json()["id"]
    print(f"[OK] Workout Execution Start OK: Session ID={session_id}")

    # Pause & Resume Session
    r_pause = client.post("/api/v1/workout/pause", json={"session_id": session_id}, headers=auth_headers)
    assert r_pause.status_code == 200, f"Workout pause failed: {r_pause.text}"
    r_resume = client.post("/api/v1/workout/resume", json={"session_id": session_id}, headers=auth_headers)
    assert r_resume.status_code == 200, f"Workout resume failed: {r_resume.text}"
    print("[OK] Workout Pause & Resume Lifecycle OK")

    # Log Set & PR Detection
    from datetime import datetime
    unique_ex_name = f"Incline Barbell Press {datetime.utcnow().timestamp()}"
    r_log = client.post("/api/v1/workout/log-set", json={
        "session_id": session_id,
        "exercise_name": unique_ex_name,
        "set_number": 1,
        "set_type": "work",
        "planned_reps": 10,
        "reps": 10,
        "target_weight_kg": 120.0,
        "weight_kg": 120.0,
        "rpe": 8.0,
        "pain_level": 0,
        "form_rating": 5,
        "notes": "Smooth execution"
    }, headers=auth_headers)
    assert r_log.status_code == 200, f"Log set failed: {r_log.text}"
    assert r_log.json()["is_pr"] is True, "Expected first set to trigger PR!"
    print(f"[OK] Log Set & PR Detection OK: Estimated 1RM={r_log.json()['estimated_1rm']}kg")

    # Skip Set & Skip Exercise
    r_skip_set = client.post("/api/v1/workout/skip-set", json={
        "session_id": session_id,
        "exercise_name": unique_ex_name,
        "set_number": 2,
        "reason": "Pain/Discomfort"
    }, headers=auth_headers)
    assert r_skip_set.status_code == 200, f"Skip set failed: {r_skip_set.text}"

    r_skip_ex = client.post("/api/v1/workout/skip-exercise", json={
        "session_id": session_id,
        "exercise_name": unique_ex_name,
        "reason": "Equipment unavailable"
    }, headers=auth_headers)
    assert r_skip_ex.status_code == 200, f"Skip exercise failed: {r_skip_ex.text}"
    print("[OK] Skip Set & Skip Exercise Analytics OK")

    # Performance Reporting
    r_report = client.post("/api/v1/workout/performance-report", json={
        "session_id": session_id,
        "pain_level": 0,
        "energy_level": 5,
        "form_confidence": 5,
        "difficulty_level": 4,
        "motivation_level": 5,
        "notes": "Excellent session response"
    }, headers=auth_headers)
    assert r_report.status_code == 200, f"Performance report failed: {r_report.text}"
    print("[OK] Workout Performance Report Persistence OK")

    # Complete Session
    r_complete = client.post(f"/api/v1/workout/complete?session_id={session_id}&notes=Finished", headers=auth_headers)
    assert r_complete.status_code == 200, f"Workout complete failed: {r_complete.text}"
    print(f"[OK] Workout Complete OK: Total Volume={r_complete.json()['total_volume_kg']}kg")

    # AI Plan Diff Propose & Apply
    r_prop = client.post("/api/v1/workout/intelligence/propose-plan-diff", json={
        "request_type": "shoulder_pain",
        "current_exercises": []
    }, headers=auth_headers)
    assert r_prop.status_code == 200, f"Propose diff failed: {r_prop.text}"
    diff_data = r_prop.json()["diff_data"]

    r_apply = client.post("/api/v1/workout/intelligence/apply-plan-diff", json={
        "plan_id": 0,
        "diff_data": diff_data
    }, headers=auth_headers)
    assert r_apply.status_code == 200, f"Apply diff failed: {r_apply.text}"
    print(f"[OK] AI Plan Review & Diff Application OK: Updated Exercises={r_apply.json()['updated_exercise_count']}")

    print("\nALL FITX AI BACKEND SERVICES & WORKOUT MODULE END-TO-END PASSED VERIFICATION!")

if __name__ == "__main__":
    run_all_tests()



