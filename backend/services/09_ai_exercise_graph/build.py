import importlib

node_mod = importlib.import_module("backend.services.09_ai_exercise_graph.node")
ExerciseNode = node_mod.ExerciseNode

def build_default_exercise_graph() -> dict:
    nodes = [
        ExerciseNode("pushup_01", "Knee Pushup", "chest", "beginner"),
        ExerciseNode("pushup_02", "Standard Pushup", "chest", "intermediate"),
        ExerciseNode("pushup_03", "Decline Pushup", "chest", "advanced"),
        ExerciseNode("squat_01", "Bodyweight Squat", "legs", "beginner"),
        ExerciseNode("squat_02", "Goblet Squat", "legs", "intermediate"),
        ExerciseNode("squat_03", "Barbell Back Squat", "legs", "advanced")
    ]

    nodes[0].progressions = ["pushup_02"]
    nodes[1].prerequisites = ["pushup_01"]
    nodes[1].regressions = ["pushup_01"]
    nodes[1].progressions = ["pushup_03"]
    nodes[2].prerequisites = ["pushup_02"]
    nodes[2].regressions = ["pushup_02"]

    nodes[3].progressions = ["squat_02"]
    nodes[4].prerequisites = ["squat_01"]
    nodes[4].regressions = ["squat_01"]
    nodes[4].progressions = ["squat_03"]
    nodes[5].prerequisites = ["squat_02"]
    nodes[5].regressions = ["squat_02"]

    graph = {node.exercise_id: node.to_dict() for node in nodes}
    return graph
