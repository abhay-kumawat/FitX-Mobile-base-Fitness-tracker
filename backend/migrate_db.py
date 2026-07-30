import sqlite3

def migrate():
    import os
    db_path = os.path.join(os.path.dirname(__file__), '..', 'fitx.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    queries = [
        "ALTER TABLE master_exercises ADD COLUMN aliases JSON DEFAULT '[]';",
        "ALTER TABLE master_exercises ADD COLUMN exercise_type VARCHAR DEFAULT 'hypertrophy';",
        "ALTER TABLE master_exercises ADD COLUMN breathing_technique VARCHAR DEFAULT 'Exhale on exertion, inhale on eccentric';",
        "ALTER TABLE master_exercises ADD COLUMN average_duration_sec INTEGER DEFAULT 60;",
        "ALTER TABLE master_exercises ADD COLUMN recommended_sets INTEGER DEFAULT 3;",
        "ALTER TABLE master_exercises ADD COLUMN recommended_reps VARCHAR DEFAULT '8-12';",
        "ALTER TABLE master_exercises ADD COLUMN \"references\" JSON DEFAULT '[]';",
        "ALTER TABLE master_exercises ADD COLUMN future_ai_metadata JSON DEFAULT '{}';",
        "ALTER TABLE master_exercises ADD COLUMN joint_stress JSON DEFAULT '[]';",
        "ALTER TABLE workout_sessions ADD COLUMN temporal_event_id VARCHAR(36);",
        "ALTER TABLE workout_plans ADD COLUMN master_event_id VARCHAR(36);",
        "ALTER TABLE workout_sets ADD COLUMN planned_reps INTEGER DEFAULT 0;",
        "ALTER TABLE workout_sets ADD COLUMN target_weight_kg FLOAT DEFAULT 0.0;",
        "ALTER TABLE workout_sets ADD COLUMN failure_reason VARCHAR;",
        "ALTER TABLE workout_sets ADD COLUMN actual_rest_seconds INTEGER DEFAULT 0;",
        "ALTER TABLE workout_sets ADD COLUMN is_ai_modified BOOLEAN DEFAULT 0;",
        "ALTER TABLE workout_sets ADD COLUMN is_manual_modified BOOLEAN DEFAULT 0;",
        "ALTER TABLE workout_sets ADD COLUMN start_time DATETIME;",
        "ALTER TABLE workout_sets ADD COLUMN end_time DATETIME;",
        """CREATE TABLE IF NOT EXISTS workout_configurations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            auto_rest_timer BOOLEAN DEFAULT 1,
            default_rest_seconds INTEGER DEFAULT 90,
            auto_increase_weight BOOLEAN DEFAULT 1,
            auto_increase_reps BOOLEAN DEFAULT 0,
            auto_progression BOOLEAN DEFAULT 1,
            training_style VARCHAR DEFAULT 'hypertrophy',
            metric_units BOOLEAN DEFAULT 1,
            experience_mode VARCHAR DEFAULT 'intermediate',
            coach_aggressiveness VARCHAR DEFAULT 'moderate',
            workout_duration_limit_min INTEGER DEFAULT 60,
            available_equipment JSON DEFAULT '[]',
            preferred_workout_days JSON DEFAULT '[]',
            recovery_sensitivity VARCHAR DEFAULT 'normal',
            FOREIGN KEY(user_id) REFERENCES users(id)
        );""",
        """CREATE TABLE IF NOT EXISTS workout_event_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_id INTEGER,
            event_type VARCHAR NOT NULL,
            details JSON DEFAULT '{}',
            timestamp DATETIME,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(session_id) REFERENCES workout_sessions(id)
        );""",
        """CREATE TABLE IF NOT EXISTS ai_workout_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_id INTEGER,
            context_type VARCHAR NOT NULL,
            message TEXT NOT NULL,
            suggestion_data JSON DEFAULT '{}',
            is_applied BOOLEAN DEFAULT 0,
            is_dismissed BOOLEAN DEFAULT 0,
            created_at DATETIME,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(session_id) REFERENCES workout_sessions(id)
        );""",
        "ALTER TABLE ai_workout_recommendations ADD COLUMN confidence_score FLOAT DEFAULT 0.9;",
        "ALTER TABLE ai_workout_recommendations ADD COLUMN evidence_sources JSON DEFAULT '[]';",
        """CREATE TABLE IF NOT EXISTS body_measurement_logs (
            id VARCHAR(64) PRIMARY KEY,
            user_id INTEGER NOT NULL,
            date VARCHAR(10) NOT NULL,
            weight_kg FLOAT,
            body_fat_pct FLOAT,
            lean_mass_kg FLOAT,
            waist_cm FLOAT,
            chest_cm FLOAT,
            shoulders_cm FLOAT,
            arms_cm FLOAT,
            forearms_cm FLOAT,
            neck_cm FLOAT,
            thighs_cm FLOAT,
            calves_cm FLOAT,
            hips_cm FLOAT,
            bmi FLOAT,
            estimated_muscle_mass_kg FLOAT,
            created_at DATETIME,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );""",
        """CREATE TABLE IF NOT EXISTS psychological_logs (
            id VARCHAR(64) PRIMARY KEY,
            user_id INTEGER NOT NULL,
            date VARCHAR(10) NOT NULL,
            motivation FLOAT,
            confidence FLOAT,
            stress FLOAT,
            mood FLOAT,
            energy FLOAT,
            workout_enjoyment FLOAT,
            perceived_recovery FLOAT,
            exercise_difficulty FLOAT,
            training_anxiety FLOAT,
            burnout_risk FLOAT,
            consistency_mindset FLOAT,
            notes TEXT DEFAULT '',
            created_at DATETIME,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );""",
        "ALTER TABLE workout_version_history ADD COLUMN actor_type VARCHAR DEFAULT 'USER';",
        """CREATE TABLE IF NOT EXISTS workout_drafts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            plan_id INTEGER,
            name VARCHAR NOT NULL,
            proposed_by VARCHAR DEFAULT 'AI',
            workout_data JSON NOT NULL,
            diff_data JSON NOT NULL,
            rationale TEXT,
            status VARCHAR DEFAULT 'pending',
            created_at DATETIME,
            expires_at DATETIME,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(plan_id) REFERENCES workout_plans(id)
        );"""
    ]
    
    for q in queries:
        try:
            c.execute(q)
            print(f"Executed: {q}")
        except Exception as e:
            print(f"Error executing {q}: {e}")
            
    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate()
