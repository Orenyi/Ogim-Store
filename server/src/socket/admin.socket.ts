import type { Server as HTTPServer } from "node:http";
import { Server } from "socket.io";
import jwt, { type JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

import { env } from "../config/env.js";
import User from "../models/User.js";

// ============================================
// SOCKET TYPES
// ============================================

interface AdminSocketData {
  adminId?: string;
}

export interface AdminNotificationPayload {
  id: string;
  type: "purchase_paid" | "staff_invited" | "staff_joined";
  title: string;
  message: string;
  entityType: "order" | "staff" | "invitation";
  entityId: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface AdminNotificationReadPayload {
  notificationId: string;
  unreadCount: number;
}

export interface AdminNotificationsReadAllPayload {
  unreadCount: number;
  modifiedCount: number;
}

interface AdminServerToClientEvents {
  "admin:notification": (notification: AdminNotificationPayload) => void;

  "admin:notification-read": (payload: AdminNotificationReadPayload) => void;

  "admin:notifications-read-all": (
    payload: AdminNotificationsReadAllPayload,
  ) => void;
}

interface AdminClientToServerEvents {
  // No client-triggered notification actions are exposed.
}

interface AdminInterServerEvents {}

type AdminSocketServer = Server<
  AdminClientToServerEvents,
  AdminServerToClientEvents,
  AdminInterServerEvents,
  AdminSocketData
>;

let adminIO: AdminSocketServer | null = null;

// ============================================
// PRODUCTION ORIGIN
// ============================================

const allowedOrigin = env.CLIENT_URL.replace(/\/$/, "");

// ============================================
// COOKIE HELPERS
// ============================================

function getCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex).trim();

    if (name !== cookieName) {
      continue;
    }

    const value = cookie.slice(separatorIndex + 1).trim();

    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }

  return null;
}

// ============================================
// SOCKET AUTHENTICATION
// ============================================

async function authenticateAdminSocket(
  cookieHeader: string | undefined,
): Promise<string> {
  const token = getCookieValue(cookieHeader, "ogim_access");
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("Authentication is not configured correctly.");
  }

  if (!token) {
    throw new Error("Administrator authentication required.");
  }

  const decoded = jwt.verify(token, secret, {
    issuer: "ogim-store-api",
    audience: "ogim-store-client",
  });

  if (
    typeof decoded === "string" ||
    (decoded as JwtPayload).type !== "access" ||
    (decoded as JwtPayload).role !== "admin" ||
    typeof (decoded as JwtPayload).sub !== "string"
  ) {
    throw new Error("Administrator access required.");
  }

  const adminId = (decoded as JwtPayload).sub as string;

  if (!mongoose.isValidObjectId(adminId)) {
    throw new Error("Invalid or expired authentication token.");
  }

  const admin = await User.findOne({
    _id: adminId,
    role: "admin",
    status: "active",
    deletedAt: null,
  })
    .select("_id")
    .lean();

  if (!admin) {
    throw new Error("Administrator account is unavailable.");
  }

  return adminId;
}

// ============================================
// INITIALIZE ADMIN SOCKET SERVER
// ============================================

export function initializeAdminSocket(
  httpServer: HTTPServer,
): AdminSocketServer {
  if (adminIO) {
    throw new Error("Admin Socket.IO server has already been initialized.");
  }

  adminIO = new Server<
    AdminClientToServerEvents,
    AdminServerToClientEvents,
    AdminInterServerEvents,
    AdminSocketData
  >(httpServer, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
      methods: ["GET", "POST"],
    },

    allowRequest: (request, callback) => {
      const requestOrigin = request.headers.origin;

      if (requestOrigin !== allowedOrigin) {
        callback("Origin not allowed.", false);
        return;
      }

      callback(null, true);
    },
  });

  // Authenticate every administrator connection.
  adminIO.use(async (socket, next) => {
    try {
      const adminId = await authenticateAdminSocket(
        socket.handshake.headers.cookie,
      );

      socket.data.adminId = adminId;

      next();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Administrator authentication failed.";

      next(new Error(message));
    }
  });

  // Assign each authenticated administrator a private room.
  adminIO.on("connection", (socket) => {
    const adminId = socket.data.adminId;

    if (!adminId) {
      socket.disconnect(true);
      return;
    }

    const room = `admin:${adminId}`;

    void socket.join(room);

    console.log(`Admin Socket.IO connected: ${adminId}`);

    socket.on("disconnect", (reason) => {
      console.log(
        `Admin Socket.IO disconnected: ${adminId}. Reason: ${reason}`,
      );
    });
  });

  console.log("Admin Socket.IO server initialized.");

  return adminIO;
}

// ============================================
// GET SOCKET SERVER INSTANCE
// ============================================

export function getAdminSocket(): AdminSocketServer {
  if (!adminIO) {
    throw new Error("Admin Socket.IO server has not been initialized.");
  }

  return adminIO;
}
