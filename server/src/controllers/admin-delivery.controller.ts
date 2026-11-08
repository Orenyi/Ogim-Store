import type { Response } from "express";

import type { AdminAuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  AdminDeliveryServiceError,
  getAdminDeliveryFees,
  createAdminDeliveryFee,
  updateAdminDeliveryFee,
  toggleAdminDeliveryFee,
  duplicateAdminDeliveryFee,
  deleteAdminDeliveryFee,
  type AdminDeliveryFeeStatus,
} from "../services/admin-delivery.service.js";

// ============================================
// ERROR HANDLING
// ============================================

function getErrorResponse(error: unknown) {
  if (error instanceof AdminDeliveryServiceError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  console.error("Admin delivery controller error:", error);

  return {
    statusCode: 500,
    message: "Something went wrong while processing delivery settings.",
  };
}

// ============================================
// GET /api/v1/admin/delivery/fees
// GET DELIVERY FEES
// ============================================

export async function getAdminDeliveryFeesController(
  req: AdminAuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const requestedStatus =
      typeof req.query.status === "string" ? req.query.status : "all";

    const status: AdminDeliveryFeeStatus | "all" = [
      "all",
      "active",
      "inactive",
    ].includes(requestedStatus)
      ? (requestedStatus as AdminDeliveryFeeStatus | "all")
      : "all";

    const result = await getAdminDeliveryFees({
      search: typeof req.query.search === "string" ? req.query.search : "",
      state: typeof req.query.state === "string" ? req.query.state : "all",
      status,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 8,
    });

    res.status(200).json({
      success: true,
      message: "Delivery fees retrieved successfully.",
      data: result,
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// POST /api/v1/admin/delivery/fees
// CREATE DELIVERY FEE
// ============================================

export async function createAdminDeliveryFeeController(
  req: AdminAuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const fee = await createAdminDeliveryFee(req.body);

    res.status(201).json({
      success: true,
      message: "Delivery fee created successfully.",
      data: { fee },
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// PATCH /api/v1/admin/delivery/fees/:feeId
// UPDATE DELIVERY FEE
// ============================================

export async function updateAdminDeliveryFeeController(
  req: AdminAuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const feeId = req.params.feeId;

    if (typeof feeId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid delivery fee ID.",
      });
      return;
    }

    const fee = await updateAdminDeliveryFee(feeId, req.body);

    res.status(200).json({
      success: true,
      message: "Delivery fee updated successfully.",
      data: { fee },
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// PATCH /api/v1/admin/delivery/fees/:feeId/toggle
// TOGGLE DELIVERY FEE STATUS
// ============================================

export async function toggleAdminDeliveryFeeController(
  req: AdminAuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const feeId = req.params.feeId;

    if (typeof feeId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid delivery fee ID.",
      });
      return;
    }

    const fee = await toggleAdminDeliveryFee(feeId);

    res.status(200).json({
      success: true,
      message: "Delivery fee status updated successfully.",
      data: { fee },
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// POST /api/v1/admin/delivery/fees/:feeId/duplicate
// DUPLICATE DELIVERY FEE
// ============================================

export async function duplicateAdminDeliveryFeeController(
  req: AdminAuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const feeId = req.params.feeId;

    if (typeof feeId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid delivery fee ID.",
      });
      return;
    }

    const fee = await duplicateAdminDeliveryFee(feeId);

    res.status(201).json({
      success: true,
      message: "Delivery fee duplicated successfully.",
      data: { fee },
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// DELETE /api/v1/admin/delivery/fees/:feeId
// DELETE DELIVERY FEE
// ============================================

export async function deleteAdminDeliveryFeeController(
  req: AdminAuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const feeId = req.params.feeId;

    if (typeof feeId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid delivery fee ID.",
      });
      return;
    }

    await deleteAdminDeliveryFee(feeId);

    res.status(200).json({
      success: true,
      message: "Delivery fee deleted successfully.",
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}
