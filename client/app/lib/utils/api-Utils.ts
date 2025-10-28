export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
}

// Utility to get token from localStorage
export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || "";
  }
  return "";
}

export function getUserId() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId") || "";
  }
  return "";
}

// Helper for API requests
export async function apiRequest(
  path: string,
  method: string,
  body?: Record<string, unknown> | FormData
) {
  const url = `${getApiUrl()}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  let fetchBody: string | FormData | undefined;

  // Check if body is FormData
  if (body instanceof FormData) {
    // Don't set Content-Type header - browser will set it with boundary
    fetchBody = body;
  } else if (body) {
    // Regular JSON request
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: fetchBody,
    credentials: "include", // ✅ CRITICAL: Allow cookies to be sent and received
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
