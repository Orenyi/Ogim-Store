import type { Request, Response } from "express";

import type { AdminAuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  getAdminTrackingOrders,
  getAdminTrackingOrderById,
  updateAdminTracking,
} from "../services/admin-tracking.service.js";

import type {
  TrackingQuery,
  TrackingStatus,
} from "../services/admin-tracking.service.js";

// ============================================
// ERROR HANDLER
// ============================================

function sendError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
): void {
  const err = error as Error & {
    statusCode?: number;
  };

  const statusCode = typeof err?.statusCode === "number" ? err.statusCode : 500;

  if (statusCode >= 500) {
    console.error(fallbackMessage, error);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode < 500 && err?.message ? err.message : fallbackMessage,
  });
}

// ============================================
// GET ADMIN TRACKING ORDERS
// GET /api/v1/admin/tracking
// ============================================

export async function getAdminTrackingOrdersController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const query: TrackingQuery = {
      search: typeof req.query.search === "string" ? req.query.search : "",
      status:
        typeof req.query.status === "string" &&
        ["processing", "dispatched", "in_transit", "delivered"].includes(
          req.query.status,
        )
          ? (req.query.status as TrackingStatus)
          : "all",
      partner: typeof req.query.partner === "string" ? req.query.partner : "",
      startDate:
        typeof req.query.startDate === "string" ? req.query.startDate : "",
      endDate: typeof req.query.endDate === "string" ? req.query.endDate : "",
      page: typeof req.query.page === "string" ? Number(req.query.page) : 1,
      limit: typeof req.query.limit === "string" ? Number(req.query.limit) : 10,
    } as const;

    const data = await getAdminTrackingOrders(query);

    res.status(200).json({
      success: true,
      message: "Tracking orders retrieved successfully.",
      data,
    });
  } catch (error) {
    sendError(res, error, "Unable to retrieve tracking orders.");
  }
}

// ============================================
// GET SINGLE ADMIN TRACKING ORDER
// GET /api/v1/admin/tracking/:orderId
// ============================================

export async function getAdminTrackingOrderByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const orderId = req.params.orderId;

    if (!orderId || typeof orderId !== "string") {
      res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
      return;
    }

    const order = await getAdminTrackingOrderById(orderId);

    res.status(200).json({
      success: true,
      message: "Tracking order retrieved successfully.",
      data: { order },
    });
  } catch (error) {
    sendError(res, error, "Unable to retrieve the tracking order.");
  }
}

// ============================================
// UPDATE ADMIN TRACKING
// PATCH /api/v1/admin/tracking/:orderId
// ============================================

export async function updateAdminTrackingController(
  req: AdminAuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const orderId = req.params.orderId;

    if (!orderId || typeof orderId !== "string") {
      res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
      return;
    }

    const adminId = req.authAdmin?.userId;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Administrator authentication required.",
      });
      return;
    }

    const { status, note, trackingNumber, deliveryPartner } = req.body ?? {};

    const order = await updateAdminTracking(
      {
        orderId,
        status,
        note,
        trackingNumber,
        deliveryPartner,
      },
      adminId,
    );

    res.status(200).json({
      success: true,
      message: "Tracking information updated successfully.",
      data: { order },
    });
  } catch (error) {
    sendError(res, error, "Unable to update tracking information.");
  }
}
