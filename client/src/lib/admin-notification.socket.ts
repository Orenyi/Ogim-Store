import { io, type Socket } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

function getSocketOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    throw new Error(
      "Invalid VITE_API_URL. A valid backend URL is required for notifications.",
    );
  }
}

export function createAdminNotificationSocket(): Socket {
  return io(getSocketOrigin(), {
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}
