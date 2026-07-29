class ExerciseNode:
    def __init__(self, exercise_id: str, name: str, primary_muscle: str, level: str = "intermediate"):
        self.exercise_id = exercise_id
        self.name = name
        self.primary_muscle = primary_muscle
        self.level = level
        self.prerequisites = [] # List of node IDs required before unlocking
        self.regressions = []   # Simpler variations
        self.progressions = []  # Harder variations

    def to_dict(self):
        return {
            "exercise_id": self.exercise_id,
            "name": self.name,
            "primary_muscle": self.primary_muscle,
            "level": self.level,
            "prerequisites": self.prerequisites,
            "regressions": self.regressions,
            "progressions": self.progressions
        }
