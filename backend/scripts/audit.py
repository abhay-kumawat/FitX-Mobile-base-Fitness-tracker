import os
import re

ROOT_DIR = r"d:\intenship work\intenship project\FitX"
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

# Heuristics for different states
mock_pattern = re.compile(r"mock|dummy|fake|sample_data|TODO|FIXME|placeholder", re.IGNORECASE)
empty_handler_pattern = re.compile(r"onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}")
hardcoded_data_pattern = re.compile(r"const\s+\w+\s*=\s*\[\s*\{.*?\}\s*\]", re.DOTALL)

frontend_features = {}
backend_features = {}

def scan_frontend():
    print("Scanning frontend...")
    for root, dirs, files in os.walk(FRONTEND_DIR):
        if "node_modules" in root or ".next" in root:
            continue
        for file in files:
            if file.endswith((".tsx", ".ts")):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        name = os.path.relpath(path, FRONTEND_DIR)
                        
                        flags = []
                        if mock_pattern.search(content):
                            flags.append("Has Mocks/Placeholders")
                        if empty_handler_pattern.search(content):
                            flags.append("Empty Handlers")
                        if hardcoded_data_pattern.search(content):
                            flags.append("Hardcoded Data")
                        
                        frontend_features[name] = flags
                except Exception as e:
                    pass

def scan_backend():
    print("Scanning backend...")
    for root, dirs, files in os.walk(BACKEND_DIR):
        if ".venv" in root or "__pycache__" in root:
            continue
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        name = os.path.relpath(path, BACKEND_DIR)
                        
                        flags = []
                        if mock_pattern.search(content):
                            flags.append("Has Mocks/Placeholders")
                        if "pass" in content and "def " in content:
                            flags.append("Empty Functions")
                        if "NotImplementedError" in content:
                            flags.append("Not Implemented")
                        
                        backend_features[name] = flags
                except Exception as e:
                    pass

scan_frontend()
scan_backend()

report = "# FitX Complete Project Audit\n\n"

report += "## Frontend Analysis (Issues Found)\n"
for name, flags in frontend_features.items():
    if flags:
        report += f"- 🔴 `{name}`: {', '.join(flags)}\n"

report += "\n## Backend Analysis (Issues Found)\n"
for name, flags in backend_features.items():
    if flags:
        report += f"- 🔴 `{name}`: {', '.join(flags)}\n"

out_path = r"C:\Users\ABT\.gemini\antigravity-ide\brain\092eaad5-bf2b-4043-a46d-64bd542d6917\audit_report.md"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(report)
print(f"Report written to {out_path}")
