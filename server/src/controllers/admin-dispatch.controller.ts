import type { Request, Response } from "express";

import {
  AdminDispatchError,
  getAdminDispatches,
  getAdminEligibleDispatchOrders,
  assignAdminDispatch,
  updateAdminDispatchStatus,
} from "../services/admin-dispatch.service.js";

import type {
  AdminDispatchQuery,
  AssignDispatchInput,
} from "../services/admin-dispatch.service.js";

import type { DispatchStatus, DeliveryPartner } from "../models/Dispatch.js";

// ============================================
// HELPERS
// ============================================

function getAdminId(req: Request): string | null {
  const user = (req as any).user;

  const adminId = user?.id ?? user?._id ?? user?.userId;

  return typeof adminId === "string" ? adminId : null;
}

function getString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }

  return fallback;
}

function getNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sendError(res: Response, error: unknown) {
  if (error instanceof AdminDispatchError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error && error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error && error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid dispatch or order reference.",
    });
  }

  console.error("Admin dispatch error:", error);

  return res.status(500).json({
    success: false,
    message: "An unexpected dispatch error occurred.",
  });
}

// ============================================
// GET DISPATCHES
// ============================================

export async function getAdminDispatchesController(
  req: Request,
  res: Response,
) {
  try {
    const query: AdminDispatchQuery = {
      search: getString(req.query.search),
      status: getString(req.query.status, "all") as DispatchStatus | "all",
      partner: getString(req.query.partner, "all") as DeliveryPartner | "all",
      startDate: getString(req.query.startDate),
      endDate: getString(req.query.endDate),
      page: getNumber(req.query.page, 1),
      limit: getNumber(req.query.limit, 5),
    };

    const result = await getAdminDispatches(query);

    return res.status(200).json({
      success: true,
      message: "Dispatch records retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// GET ELIGIBLE ORDERS FOR DISPATCH
// ============================================

export async function getAdminEligibleDispatchOrdersController(
  req: Request,
  res: Response,
) {
  try {
    const search = getString(req.query.search);

    const orders = await getAdminEligibleDispatchOrders(search);

    return res.status(200).json({
      success: true,
      message: "Eligible orders retrieved successfully.",
      data: {
        orders,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// ASSIGN DISPATCH
// ============================================

export async function assignAdminDispatchController(
  req: Request,
  res: Response,
) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const input: AssignDispatchInput = {
      orderId: getString(req.body.orderId),
      deliveryPartner: getString(req.body.deliveryPartner) as DeliveryPartner,
      trackingNumber: getString(req.body.trackingNumber),
      estimatedDelivery: getString(req.body.estimatedDelivery),
    };

    if (
      !input.orderId ||
      !input.deliveryPartner ||
      !input.trackingNumber ||
      !input.estimatedDelivery
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order, delivery partner, tracking number and estimated delivery are required.",
      });
    }

    const result = await assignAdminDispatch(input, adminId);

    return res.status(201).json({
      success: true,
      message: "Dispatch assigned successfully.",
      data: {
        dispatch: result,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// UPDATE DISPATCH STATUS
// ============================================

export async function updateAdminDispatchStatusController(
  req: Request,
  res: Response,
) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const dispatchId = getString(req.params.dispatchId);
    const status = getString(req.body.status) as DispatchStatus;

    const note = getString(req.body.note);

    if (!dispatchId || !status) {
      return res.status(400).json({
        success: false,
        message: "Dispatch ID and new status are required.",
      });
    }

    const result = await updateAdminDispatchStatus(
      dispatchId,
      status,
      adminId,
      note,
    );

    return res.status(200).json({
      success: true,
      message: "Dispatch status updated successfully.",
      data: {
        dispatch: result,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}
