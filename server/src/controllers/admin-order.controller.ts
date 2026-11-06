import type { Request, Response } from "express";

import {
  AdminOrderServiceError,
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrderStatus,
} from "../services/admin-order.service.js";

import type {
  AdminFulfilmentStatus,
  AdminPaymentStatus,
} from "../services/admin-order.service.js";

import type { AdminAuthenticatedRequest } from "../middleware/auth.middleware.js";

const FULFILMENT_STATUSES: AdminFulfilmentStatus[] = [
  "pending_dispatch",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: AdminPaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

function sendControllerError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
): Response {
  if (error instanceof AdminOrderServiceError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error("[Admin Orders Controller]", error);

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
}

function getQueryString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function getQueryNumber(value: unknown, fallback: number): number {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

/**
 * GET /api/v1/admin/orders
 *
 * Retrieve paginated admin orders with optional filters.
 */
export async function getAdminOrdersController(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const page = getQueryNumber(req.query.page, 1);
    const limit = getQueryNumber(req.query.limit, 20);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const search = getQueryString(req.query.search);
    const fulfilmentStatus = getQueryString(req.query.fulfilmentStatus);
    const paymentStatus = getQueryString(req.query.paymentStatus);
    const startDate = getQueryString(req.query.startDate);
    const endDate = getQueryString(req.query.endDate);

    if (
      fulfilmentStatus &&
      fulfilmentStatus !== "all" &&
      !FULFILMENT_STATUSES.includes(fulfilmentStatus as AdminFulfilmentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid fulfilment status filter.",
      });
    }

    if (
      paymentStatus &&
      paymentStatus !== "all" &&
      !PAYMENT_STATUSES.includes(paymentStatus as AdminPaymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status filter.",
      });
    }

    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date.",
      });
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date.",
      });
    }

    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() > new Date(endDate).getTime()
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date.",
      });
    }

    const normalizedFulfilmentStatus = fulfilmentStatus as
      | AdminFulfilmentStatus
      | "all"
      | undefined;

    const normalizedPaymentStatus = paymentStatus as
      | AdminPaymentStatus
      | "all"
      | undefined;

    const result = await getAdminOrders({
      page,
      limit,
      search,
      fulfilmentStatus: normalizedFulfilmentStatus || "all",
      paymentStatus: normalizedPaymentStatus || "all",
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return sendControllerError(res, error, "Unable to retrieve admin orders.");
  }
}

/**
 * GET /api/v1/admin/orders/:orderId
 *
 * Retrieve a single order and its details.
 */
export async function getAdminOrderByIdController(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const orderId = req.params.orderId;

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid order ID is required.",
      });
    }

    const order = await getAdminOrderById(orderId);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return sendControllerError(res, error, "Unable to retrieve order details.");
  }
}

/**
 * PATCH /api/v1/admin/orders/:orderId/status
 *
 * Update an order's fulfilment status.
 * Payment status remains controlled by the payment system.
 */
export async function updateAdminOrderStatusController(
  req: AdminAuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const orderId = req.params.orderId;
    const adminId = req.authAdmin?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication is required.",
      });
    }

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid order ID is required.",
      });
    }

    const { status, note } = req.body ?? {};

    if (
      typeof status !== "string" ||
      !FULFILMENT_STATUSES.includes(status as AdminFulfilmentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid fulfilment status is required.",
      });
    }

    if (note !== undefined && typeof note !== "string") {
      return res.status(400).json({
        success: false,
        message: "The status note must be a string.",
      });
    }

    if (typeof note === "string" && note.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "The status note cannot exceed 500 characters.",
      });
    }

    const updatedOrder = await updateAdminOrderStatus(orderId, adminId, {
      status: status as AdminFulfilmentStatus,
      note: typeof note === "string" ? note.trim() : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Order fulfilment status updated successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    return sendControllerError(
      res,
      error,
      "Unable to update order fulfilment status.",
    );
  }
}
