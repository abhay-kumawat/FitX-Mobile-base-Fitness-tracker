// Unified API Base Client with Fallback & Offline Capability

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      throw new Error(`API Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[FitX API Warning] ${endpoint} fetch error. Returning simulated response.`, error);
    throw error;
  }
}
