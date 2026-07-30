import { fetchApi } from './apiBase';

export interface LogWorkoutSetPayload {
  session_id: number;
  exercise_name: str;
  set_number: number;
  set_type: "warmup" | "work" | "failure" | "dropset";
  planned_reps?: number;
  reps: number;
  target_weight_kg?: number;
  weight_kg: number;
  failure_reason?: string;
  rpe?: number;
  rir?: number;
  tempo?: string;
  rest_seconds?: number;
  actual_rest_seconds?: number;
  is_ai_modified?: boolean;
  is_manual_modified?: boolean;
  pain_level?: number;
  form_rating?: number;
  notes?: string;
}

export interface PerformanceReportPayload {
  session_id: number;
  pain_level: number;
  energy_level: number;
  form_confidence: number;
  difficulty_level: number;
  motivation_level: number;
  notes: string;
}

export async function startWorkoutSession(name: string, temporalEventId?: string) {
  return await fetchApi('/workout/start', {
    method: 'POST',
    body: JSON.stringify({ name, temporal_event_id: temporalEventId }),
  });
}

export async function getActiveWorkoutSession() {
  return await fetchApi('/workout/active');
}

export async function pauseWorkoutSession(sessionId: number) {
  return await fetchApi('/workout/pause', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export async function resumeWorkoutSession(sessionId: number) {
  return await fetchApi('/workout/resume', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export async function cancelWorkoutSession(sessionId: number, reason: string = "User cancelled") {
  return await fetchApi('/workout/cancel', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, reason }),
  });
}

export async function logWorkoutSet(payload: LogWorkoutSetPayload) {
  return await fetchApi('/workout/log-set', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function skipWorkoutSet(sessionId: number, exerciseName: string, setNumber: number, reason: string) {
  return await fetchApi('/workout/skip-set', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, exercise_name: exerciseName, set_number: setNumber, reason }),
  });
}

export async function skipWorkoutExercise(sessionId: number, exerciseName: string, reason: string) {
  return await fetchApi('/workout/skip-exercise', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, exercise_name: exerciseName, reason }),
  });
}

export async function completeWorkoutSession(sessionId: number, notes: string = "") {
  return await fetchApi(`/workout/complete?session_id=${sessionId}&notes=${encodeURIComponent(notes)}`, {
    method: 'POST',
  });
}

export async function submitPerformanceReport(payload: PerformanceReportPayload) {
  return await fetchApi('/workout/performance-report', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPlateCalculator(targetWeightKg: number = 100, barbellWeightKg: number = 20) {
  return await fetchApi(`/workout/plate-calculator?target_weight_kg=${targetWeightKg}&barbell_weight_kg=${barbellWeightKg}`);
}

export async function getWarmupProtocol(exerciseName: string, workingWeightKg: number) {
  return await fetchApi(`/workout/warmup-protocol?exercise_name=${encodeURIComponent(exerciseName)}&working_weight_kg=${workingWeightKg}`);
}

export async function proposeAIPlanDiff(requestType: string, currentExercises: any[]) {
  return await fetchApi('/workout/intelligence/propose-plan-diff', {
    method: 'POST',
    body: JSON.stringify({ request_type: requestType, current_exercises: currentExercises }),
  });
}

export async function applyAIPlanDiff(planId: number, diffData: any) {
  return await fetchApi('/workout/intelligence/apply-plan-diff', {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId, diff_data: diffData }),
  });
}
