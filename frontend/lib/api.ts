const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
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
};
