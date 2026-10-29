const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new Error(
      `Expected JSON from ${API_BASE_URL}${endpoint}. Check your API URL and backend port.`,
    );
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result as T;
}
