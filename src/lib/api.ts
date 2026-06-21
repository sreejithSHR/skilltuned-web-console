import { ApiResponse } from "@/types";

// API routes are served by the same Next.js process — always use a relative path.
const BASE_URL = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cc_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      return {
        error:
          errorBody.message || errorBody.error || `Request failed (${res.status})`,
      };
    }

    const data = await res.json();
    return { data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

export default api;
