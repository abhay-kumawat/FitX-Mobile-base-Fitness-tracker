# FitX AI Platform ⚡

FitX is an advanced, hyper-personalized AI fitness and nutrition platform built with a 18-microservice backend architecture and a modern Next.js mobile-first web interface.

---

## 🚀 Key Features

### 🏋️ AI Fitness & Microservices
1. **Adaptive Planning Engine**: Dynamically auto-adjusts workout routines based on sleep, calories, active injuries, and available equipment.
2. **AI Recovery Readiness Score**: Real-time telemetry-based recovery score calculation (0–100) with interactive body fatigue heatmaps.
3. **Progressive Overload & Deload Engine**: Automated calculations for target weight, reps, sets, tempo, dynamic rest seconds, and deload triggers based on RPE.
4. **Workout Version Control & Rollback**: Versioned workout plans with automated change rationales and rollback capabilities.
5. **Conflict & Injury Risk Detection**: Prevents muscle group overtraining and warns against high acute-to-chronic workload ratios.
6. **Gemini AI Coach Chat**: Real-time context-aware fitness advice with interactive suggested inline actions.
7. **Budget-Aware Meal Planner & AI Grocery Generator**: Generates cost-optimized meal plans ($/day) and aggregates weekly grocery lists with ingredient reuse optimization.
8. **Streak Protection Micro-Workouts**: 15-minute high-efficiency micro-workouts (EMOM/AMRAP) to preserve workout streaks on busy days.
9. **Exercise Constellation Skill Tree**: Interactive visual skill graph tracing exercise progression from beginner to advanced movements.
10. **AI Memory Timeline**: Tracks user preferences, injuries, and historical milestones with confidence scores.

---

## 🛠 Architecture & Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, SQLite/PostgreSQL, Google Gemini API SDK.
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Containerization**: Docker, Docker Compose.

---


## 🚀 One-Command Launch (Recommended)

Start the entire stack (FastAPI Backend + Next.js Frontend) concurrently with a single command from the project root:

```bash
# Option A: Using Python (Cross-platform)
python run.py

# Option B: Using npm
npm start

# Option C: Windows CMD / Batch
run

# Option D: Windows PowerShell
.\run.ps1

# Option E: Linux / macOS
./run.sh
```

### Additional Launcher Options:
```bash
python run.py --test          # Run backend tests first, then launch servers
python run.py --docker        # Launch using Docker Compose
python run.py --backend-only  # Run FastAPI backend only
python run.py --frontend-only # Run Next.js frontend only
```

- **Frontend Web**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000` (Swagger Docs: `http://localhost:8000/docs`)

---

## 🏃 Manual Setup (Step-by-Step)

### 1. Backend Setup
```bash
# Create Python virtual environment
python -m venv backend/.venv

# Activate virtual environment
# Windows (PowerShell):
.\backend\.venv\Scripts\Activate.ps1
# macOS/Linux:
source backend/.venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run test suite
python backend/test_backend.py

# Start FastAPI server
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Production Deployment


Deploy the complete stack in a single command using Docker Compose:

```bash
# Build and run containers
docker-compose up --build -d
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`

To stop containers:
```bash
docker-compose down
```

---

## 🧪 Verification & Testing

Run full backend unit/integration tests:
```bash
python backend/test_backend.py
```

Run frontend production build verification:
```bash
cd frontend
npm run build
```

---

## 📜 Environment Variables

Copy `.env.example` to `.env` and fill in your variables:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./fitx.db` |
| `SECRET_KEY` | JWT Secret Key | (Set secure key for prod) |
| `GEMINI_API_KEY` | Google Gemini API key | Optional (uses fallback) |
| `NEXT_PUBLIC_API_URL` | Frontend API Host URL | `http://localhost:8000/api/v1` |
