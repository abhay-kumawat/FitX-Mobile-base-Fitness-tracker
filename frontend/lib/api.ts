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
};
