const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let csrfToken: string | null = null;

interface ApiResponse {
  success?: boolean;
  message?: string;
  csrfToken?: string;
  errors?: unknown;
}

export interface AuthMessageResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  let result: ApiResponse;

  try {
    result = (await response.json()) as ApiResponse;
  } catch {
    throw new ApiError(
      "Unable to initialize secure session. Check the API URL and backend.",
      response.status,
    );
  }

  if (!response.ok || typeof result.csrfToken !== "string") {
    throw new ApiError(
      result.message || "Unable to initialize secure session.",
      response.status,
    );
  }

  csrfToken = result.csrfToken;

  return csrfToken;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);

  if (isMutation && !csrfToken) {
    await getCsrfToken();
  }

  const headers = new Headers(options?.headers);

  headers.set("Accept", "application/json");

  if (options?.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (isMutation && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new ApiError(
      `Expected JSON from ${API_BASE_URL}${endpoint}. Check your API URL and backend port.`,
      response.status,
    );
  }

  const result = (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new ApiError(
      result.message || "Something went wrong.",
      response.status,
      result.errors,
    );
  }

  return result as T;
}

// ============================================
// FORGOT PASSWORD
// ============================================

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<AuthMessageResponse> {
  return apiRequest<AuthMessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ============================================
// RESET PASSWORD
// ============================================

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<AuthMessageResponse> {
  return apiRequest<AuthMessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
