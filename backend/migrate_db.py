import sqlite3

def migrate():
    conn = sqlite3.connect('fitx.db')
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
        "ALTER TABLE workout_plans ADD COLUMN master_event_id VARCHAR(36);"
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
