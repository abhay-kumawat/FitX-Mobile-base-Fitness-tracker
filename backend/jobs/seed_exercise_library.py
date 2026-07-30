import uuid
from backend.core.database import SessionLocal
from backend.models.models import MasterExercise, MuscleAtlas, JointAtlas, InjuryKnowledgeNode
import random

def create_muscle_atlas(db):
    muscles = [
        {"name": "Chest", "group": "Torso", "function": "Horizontal adduction, flexion"},
        {"name": "Lats", "group": "Back", "function": "Shoulder adduction, extension"},
        {"name": "Front Delts", "group": "Shoulders", "function": "Shoulder flexion"},
        {"name": "Side Delts", "group": "Shoulders", "function": "Shoulder abduction"},
        {"name": "Rear Delts", "group": "Shoulders", "function": "Shoulder horizontal abduction"},
        {"name": "Triceps", "group": "Arms", "function": "Elbow extension"},
        {"name": "Biceps", "group": "Arms", "function": "Elbow flexion"},
        {"name": "Quadriceps", "group": "Legs", "function": "Knee extension"},
        {"name": "Hamstrings", "group": "Legs", "function": "Knee flexion"},
        {"name": "Glutes", "group": "Legs", "function": "Hip extension"},
        {"name": "Core", "group": "Core", "function": "Spinal flexion, stabilization"},
    ]
    for m in muscles:
        if not db.query(MuscleAtlas).filter_by(name=m["name"]).first():
            db.add(MuscleAtlas(**m))
    db.commit()

def create_joint_atlas(db):
    joints = [
        {"name": "Shoulder", "type": "Ball and Socket"},
        {"name": "Elbow", "type": "Hinge"},
        {"name": "Wrist", "type": "Gliding"},
        {"name": "Hip", "type": "Ball and Socket"},
        {"name": "Knee", "type": "Hinge"},
        {"name": "Ankle", "type": "Hinge"},
        {"name": "Spine", "type": "Cartilaginous"}
    ]
    for j in joints:
        if not db.query(JointAtlas).filter_by(name=j["name"]).first():
            db.add(JointAtlas(**j))
    db.commit()

def create_injury_nodes(db):
    nodes = [
        {"name": "Rotator Cuff Tear", "affected_region": "Shoulder", "conflicting_movements": ["overhead_press", "upright_row"]},
        {"name": "Patellar Tendinitis", "affected_region": "Knee", "conflicting_movements": ["squat", "lunge"]},
        {"name": "Tennis Elbow", "affected_region": "Elbow", "conflicting_movements": ["heavy_pull", "curl"]},
        {"name": "Lower Back Strain", "affected_region": "Spine", "conflicting_movements": ["deadlift", "hinge", "unsupported_row"]}
    ]
    for n in nodes:
        if not db.query(InjuryKnowledgeNode).filter_by(name=n["name"]).first():
            db.add(InjuryKnowledgeNode(**n))
    db.commit()

def generate_exercises(db):
    equipments = ["Barbell", "Dumbbell", "Cable", "Machine", "Kettlebell", "Resistance Band", "Bodyweight", "Smith Machine"]
    movements = {
        "push": [
            ("Chest Press", "Chest", ["Front Delts", "Triceps"], ["Shoulder", "Elbow"]),
            ("Incline Press", "Chest", ["Front Delts", "Triceps"], ["Shoulder", "Elbow"]),
            ("Decline Press", "Chest", ["Triceps"], ["Shoulder", "Elbow"]),
            ("Overhead Press", "Front Delts", ["Triceps"], ["Shoulder", "Elbow"]),
            ("Lateral Raise", "Side Delts", [], ["Shoulder"]),
            ("Tricep Extension", "Triceps", [], ["Elbow"]),
            ("Pushdown", "Triceps", [], ["Elbow"]),
            ("Fly", "Chest", ["Front Delts"], ["Shoulder"])
        ],
        "pull": [
            ("Row", "Lats", ["Biceps", "Rear Delts"], ["Shoulder", "Elbow", "Spine"]),
            ("Pulldown", "Lats", ["Biceps"], ["Shoulder", "Elbow"]),
            ("Curl", "Biceps", ["Forearms"], ["Elbow"]),
            ("Face Pull", "Rear Delts", ["Traps"], ["Shoulder", "Elbow"]),
            ("Shrug", "Traps", [], ["Shoulder"]),
            ("Pullover", "Lats", ["Chest"], ["Shoulder"])
        ],
        "squat": [
            ("Squat", "Quadriceps", ["Glutes", "Core"], ["Knee", "Hip", "Spine"]),
            ("Front Squat", "Quadriceps", ["Core"], ["Knee", "Hip", "Spine"]),
            ("Split Squat", "Quadriceps", ["Glutes"], ["Knee", "Hip"]),
            ("Leg Press", "Quadriceps", ["Glutes"], ["Knee", "Hip"]),
            ("Hack Squat", "Quadriceps", ["Glutes"], ["Knee", "Hip"])
        ],
        "hinge": [
            ("Deadlift", "Glutes", ["Hamstrings", "Spine", "Core"], ["Hip", "Spine"]),
            ("Romanian Deadlift", "Hamstrings", ["Glutes", "Spine"], ["Hip", "Spine"]),
            ("Good Morning", "Hamstrings", ["Glutes", "Spine"], ["Hip", "Spine"]),
            ("Hip Thrust", "Glutes", ["Hamstrings"], ["Hip"]),
            ("Glute Bridge", "Glutes", ["Hamstrings"], ["Hip"])
        ],
        "lunge": [
            ("Lunge", "Quadriceps", ["Glutes"], ["Knee", "Hip"]),
            ("Reverse Lunge", "Glutes", ["Quadriceps"], ["Knee", "Hip"]),
            ("Walking Lunge", "Quadriceps", ["Glutes"], ["Knee", "Hip"]),
            ("Step Up", "Quadriceps", ["Glutes"], ["Knee", "Hip"])
        ],
        "isolation": [
            ("Leg Extension", "Quadriceps", [], ["Knee"]),
            ("Leg Curl", "Hamstrings", [], ["Knee"]),
            ("Calf Raise", "Calves", [], ["Ankle"]),
            ("Crunch", "Core", [], ["Spine"]),
            ("Plank", "Core", [], ["Spine"])
        ]
    }
    
    variations = ["Standard", "Single-Arm", "Single-Leg", "Paused", "Deficit", "Banded", "Tempo", "Eccentric-Focused"]
    
    exercises_to_add = []
    
    for movement_pattern, base_exercises in movements.items():
        for base_name, primary_muscle, secondary_muscles, joints in base_exercises:
            for eq in equipments:
                for var in variations:
                    # Skip nonsensical combinations
                    if eq == "Bodyweight" and var in ["Banded", "Single-Arm"] and base_name not in ["Row", "Squat", "Lunge"]:
                        continue
                    if eq == "Machine" and var in ["Single-Arm", "Banded"]:
                        continue
                        
                    name = f"{var} {eq} {base_name}".replace("Standard ", "").strip()
                    
                    # Generate joint stress
                    stress = []
                    for j in joints:
                        stress.append({"joint": j, "level": random.choice(["low", "moderate", "high"])})
                        
                    exercises_to_add.append(
                        MasterExercise(
                            name=name,
                            category=primary_muscle,
                            primary_muscle=primary_muscle,
                            secondary_muscles=secondary_muscles,
                            movement_pattern=movement_pattern,
                            equipment=eq,
                            difficulty=random.choice(["beginner", "intermediate", "advanced"]),
                            exercise_type=random.choice(["hypertrophy", "strength"]),
                            instructions=[f"Perform {name} with proper form."],
                            breathing_technique="Exhale on the concentric portion of the lift.",
                            joint_stress=stress
                        )
                    )
    
    # Batch insert to avoid DB lockups
    print(f"Generated {len(exercises_to_add)} exercises. Inserting...")
    for i in range(0, len(exercises_to_add), 100):
        batch = exercises_to_add[i:i+100]
        for ex in batch:
            if not db.query(MasterExercise).filter_by(name=ex.name).first():
                db.add(ex)
        db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        print("Seeding Muscle Atlas...")
        create_muscle_atlas(db)
        print("Seeding Joint Atlas...")
        create_joint_atlas(db)
        print("Seeding Injury Knowledge...")
        create_injury_nodes(db)
        print("Seeding Exercise Library (1000+)...")
        generate_exercises(db)
        print("Done!")
    finally:
        db.close()
