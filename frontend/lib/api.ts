const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer dev_token_user_1",
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}, returning local fallback data`, error);
    return null;
  }
}

export const fitxAPI = {
  getProfile: () => fetchFromAPI("/users/profile"),
  generateAdaptivePlan: (signals: any) =>
    fetchFromAPI("/adaptive-plan/generate", { method: "POST", body: JSON.stringify(signals) }),
  getRecoveryScore: (data: any) =>
    fetchFromAPI("/recovery/score", { method: "POST", body: JSON.stringify(data) }),
  calculateOverload: (data: any) =>
    fetchFromAPI("/progressive-overload/calculate", { method: "POST", body: JSON.stringify(data) }),
  predictFatigue: (recoveryScore: number = 75) =>
    fetchFromAPI(`/fatigue/predict?recovery_score=${recoveryScore}`),
  generateMealPlan: (req: any) =>
    fetchFromAPI("/meal-planner/generate", { method: "POST", body: JSON.stringify(req) }),
  generateGroceryList: () => fetchFromAPI("/grocery/generate"),
  sendCoachChat: (msg: string, context: any = {}) =>
    fetchFromAPI("/coach/chat", {
      method: "POST",
      body: JSON.stringify({ user_id: 1, message: msg, context }),
    }),
  getWeeklySummary: () => fetchFromAPI("/analytics/weekly-summary"),
  getExerciseGraph: () => fetchFromAPI("/exercise-graph"),
  getMicroWorkout: (mins: number = 15) =>
    fetchFromAPI("/streak/micro-workout", {
      method: "POST",
      body: JSON.stringify({ available_minutes: mins }),
    }),
  getEvents: (startDate: string, endDate: string) =>
    fetchFromAPI(`/workout/events?start_date=${startDate}&end_date=${endDate}`),
  getCalendarAssignments: (startDate: string, endDate: string) =>
    fetchFromAPI(`/workout/calendar/assignments?start_date=${startDate}&end_date=${endDate}`),
  assignCalendarWorkout: (payload: any) =>
    fetchFromAPI("/workout/calendar/assign", { method: "POST", body: JSON.stringify(payload) }),
  updateDayWorkout: (plannedDate: string, payload: any) =>
    fetchFromAPI(`/workout/calendar/day/${plannedDate}`, { method: "PUT", body: JSON.stringify(payload) }),
  performDayAction: (plannedDate: string, action: string, targetDate?: string, payload?: any) =>
    fetchFromAPI(`/workout/calendar/day/${plannedDate}/action`, { method: "POST", body: JSON.stringify({ action, target_date: targetDate, ...payload }) }),
  deleteDayAssignment: (plannedDate: string) =>
    fetchFromAPI(`/workout/calendar/day/${plannedDate}`, { method: "DELETE" }),
  getDayHistory: (plannedDate: string) =>
    fetchFromAPI(`/workout/calendar/day/${plannedDate}/history`),
  getPlans: () => fetchFromAPI("/workout/plans"),

  createPlan: (plan: any) => fetchFromAPI("/workout/plans", { method: "POST", body: JSON.stringify(plan) }),
  updatePlan: (id: number, plan: any) => fetchFromAPI(`/workout/plans/${id}`, { method: "PUT", body: JSON.stringify(plan) }),
  getExercises: (query: string, muscle: string, equipment: string, difficulty: string | null) => {
    let url = `/workout/exercises/search?`;
    if (query) url += `query=${query}&`;
    if (muscle) url += `muscle=${muscle}&`;
    if (equipment) url += `equipment=${equipment}&`;
    if (difficulty) url += `difficulty=${difficulty}`;
    return fetchFromAPI(url);
  },
  agentChat: (msg: string) =>
    fetchFromAPI("/workout/intelligence/agent-chat", {
      method: "POST",
      body: JSON.stringify({ message: msg }),
    }),
  startWorkout: (name: string, temporalEventId?: string) =>
    fetchFromAPI("/workout/start", { method: "POST", body: JSON.stringify({ name, temporal_event_id: temporalEventId }) }),
  getActiveSession: () => fetchFromAPI("/workout/active"),
  pauseSession: (sessionId: number) =>
    fetchFromAPI("/workout/pause", { method: "POST", body: JSON.stringify({ session_id: sessionId }) }),
  resumeSession: (sessionId: number) =>
    fetchFromAPI("/workout/resume", { method: "POST", body: JSON.stringify({ session_id: sessionId }) }),
  cancelSession: (sessionId: number, reason: string = "User cancelled") =>
    fetchFromAPI("/workout/cancel", { method: "POST", body: JSON.stringify({ session_id: sessionId, reason }) }),
  logSet: (payload: any) =>
    fetchFromAPI("/workout/log-set", { method: "POST", body: JSON.stringify(payload) }),
  skipSet: (sessionId: number, exerciseName: string, setNumber: number, reason: string) =>
    fetchFromAPI("/workout/skip-set", { method: "POST", body: JSON.stringify({ session_id: sessionId, exercise_name: exerciseName, set_number: setNumber, reason }) }),
  skipExercise: (sessionId: number, exerciseName: string, reason: string) =>
    fetchFromAPI("/workout/skip-exercise", { method: "POST", body: JSON.stringify({ session_id: sessionId, exercise_name: exerciseName, reason }) }),
  completeSession: (sessionId: number, notes: string = "") =>
    fetchFromAPI(`/workout/complete?session_id=${sessionId}&notes=${encodeURIComponent(notes)}`, { method: "POST" }),
  submitReport: (payload: any) =>
    fetchFromAPI("/workout/performance-report", { method: "POST", body: JSON.stringify(payload) }),
  getPlateCalculator: (targetWeightKg: number, barbellWeightKg: number = 20) =>
    fetchFromAPI(`/workout/plate-calculator?target_weight_kg=${targetWeightKg}&barbell_weight_kg=${barbellWeightKg}`),
  getWarmupProtocol: (exerciseName: string, workingWeightKg: number) =>
    fetchFromAPI(`/workout/warmup-protocol?exercise_name=${encodeURIComponent(exerciseName)}&working_weight_kg=${workingWeightKg}`),
  proposeAIPlanDiff: (requestType: string, currentExercises: any[]) =>
    fetchFromAPI("/workout/intelligence/propose-plan-diff", { method: "POST", body: JSON.stringify({ request_type: requestType, current_exercises: currentExercises }) }),
  applyAIPlanDiff: (planId: number, diffData: any) =>
    fetchFromAPI("/workout/intelligence/apply-plan-diff", { method: "POST", body: JSON.stringify({ plan_id: planId, diff_data: diffData }) }),
};

