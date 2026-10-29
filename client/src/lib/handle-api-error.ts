import { ApiError } from "./api";

export interface ErrorToast {
  error: (message: string, duration?: number) => void;
}

interface HandleApiErrorOptions {
  fallbackMessage?: string;
  toast?: ErrorToast;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return "Unable to connect to the server. Check your connection and try again.";
    }

    if (error.status === 401) {
      return "Your session may have expired. Please sign in again.";
    }

    if (error.status === 403) {
      return "You don't have permission to perform this action.";
    }

    if (error.status === 404) {
      return error.message || "The requested resource was not found.";
    }

    if (error.status >= 500) {
      return "Something went wrong on our server. Please try again shortly.";
    }

    return error.message || fallbackMessage;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return "The request was cancelled.";
  }

  return fallbackMessage;
}

export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions = {},
): string {
  const message = getApiErrorMessage(error, options.fallbackMessage);

  options.toast?.error(message);

  return message;
}
