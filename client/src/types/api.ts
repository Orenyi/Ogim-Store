export interface ApiErrorPayload {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface HealthResponse {
  status: string;
  message?: string;
  timestamp?: string;
}
