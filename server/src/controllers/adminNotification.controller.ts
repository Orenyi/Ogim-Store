import type { Request, Response } from "express";

import type { AdminAuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  AdminNotificationError,
  getAdminNotifications,
  getAdminUnreadNotificationCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "../services/admin-notification.service.js";

function getAdminId(req: Request): string {
  const adminId = (req as AdminAuthenticatedRequest).authAdmin?.userId;

  if (!adminId) {
    throw new AdminNotificationError(
      "Administrator authentication is required.",
      401,
    );
  }

  return adminId;
}

function getNotificationId(req: Request): string {
  const notificationId = req.params.notificationId;

  if (typeof notificationId !== "string" || notificationId.trim() === "") {
    throw new AdminNotificationError("Invalid notification ID.", 400);
  }

  return notificationId;
}

function parsePositiveInteger(
  value: unknown,
  fallback: number,
  maximum?: number,
): number {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return maximum ? Math.min(parsed, maximum) : parsed;
}

function parseBoolean(value: unknown): boolean {
  return value === "true" || value === "1";
}

function handleControllerError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
): void {
  if (error instanceof AdminNotificationError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.error("[Admin Notifications] Controller error:", error);

  res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
}

/**
 * GET /api/v1/admin/notifications
 *
 * Retrieve the authenticated administrator's notifications.
 *
 * Query parameters:
 * - page: page number (default: 1)
 * - limit: records per page (default: 20, maximum: 50)
 * - unreadOnly: true to retrieve unread notifications only
 */
export async function getNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const adminId = getAdminId(req);

    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 20, 50);
    const unreadOnly = parseBoolean(req.query.unreadOnly);

    const result = await getAdminNotifications(adminId, {
      page,
      limit,
      unreadOnly,
    });

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully.",
      data: result,
    });
  } catch (error: unknown) {
    handleControllerError(res, error, "Unable to retrieve notifications.");
  }
}

/**
 * GET /api/v1/admin/notifications/unread-count
 *
 * Retrieve the authenticated administrator's unread notification count.
 */
export async function getUnreadNotificationCount(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const adminId = getAdminId(req);

    const unreadCount = await getAdminUnreadNotificationCount(adminId);

    res.status(200).json({
      success: true,
      message: "Unread notification count retrieved successfully.",
      data: {
        unreadCount,
      },
    });
  } catch (error: unknown) {
    handleControllerError(
      res,
      error,
      "Unable to retrieve unread notification count.",
    );
  }
}

/**
 * PATCH /api/v1/admin/notifications/:notificationId/read
 *
 * Mark one of the authenticated administrator's notifications as read.
 */
export async function markNotificationAsRead(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const notificationId = getNotificationId(req);

    const result = await markAdminNotificationAsRead(adminId, notificationId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        notification: result.notification,
        unreadCount: result.unreadCount,
      },
    });
  } catch (error: unknown) {
    handleControllerError(res, error, "Unable to mark notification as read.");
  }
}

/**
 * PATCH /api/v1/admin/notifications/read-all
 *
 * Mark all of the authenticated administrator's unread notifications as read.
 */
export async function markAllNotificationsAsRead(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const adminId = getAdminId(req);

    const result = await markAllAdminNotificationsAsRead(adminId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        modifiedCount: result.modifiedCount,
        unreadCount: result.unreadCount,
      },
    });
  } catch (error: unknown) {
    handleControllerError(
      res,
      error,
      "Unable to mark all notifications as read.",
    );
  }
}
