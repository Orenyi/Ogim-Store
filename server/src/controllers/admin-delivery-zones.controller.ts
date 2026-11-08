import type { Request, Response } from "express";

import {
  AdminDeliveryZoneError,
  createAdminDeliveryZone,
  deleteAdminDeliveryZone,
  getAdminDeliveryZones,
  toggleAdminDeliveryZone,
  updateAdminDeliveryZone,
} from "../services/admin-delivery-zones.service.js";

// ============================================
// PARAMETER HELPER
// ============================================

function getZoneId(req: Request): string {
  const zoneId = req.params.zoneId;

  return Array.isArray(zoneId) ? zoneId[0] : zoneId;
}

// ============================================
// GET DELIVERY ZONES
// ============================================

export async function getAdminDeliveryZonesController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const result = await getAdminDeliveryZones({
      search: typeof req.query.search === "string" ? req.query.search : "",
      state: typeof req.query.state === "string" ? req.query.state : "all",
      status:
        req.query.status === "active" || req.query.status === "inactive"
          ? req.query.status
          : "all",
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    });

    res.status(200).json({
      success: true,
      message: "Delivery zones retrieved successfully.",
      data: result,
    });
  } catch (error) {
    handleDeliveryZoneError(res, error);
  }
}

// ============================================
// CREATE DELIVERY ZONE
// ============================================

export async function createAdminDeliveryZoneController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const zone = await createAdminDeliveryZone(req.body);

    res.status(201).json({
      success: true,
      message: "Delivery zone created successfully.",
      data: { zone },
    });
  } catch (error) {
    handleDeliveryZoneError(res, error);
  }
}

// ============================================
// UPDATE DELIVERY ZONE
// ============================================

export async function updateAdminDeliveryZoneController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const zone = await updateAdminDeliveryZone(getZoneId(req), req.body);

    res.status(200).json({
      success: true,
      message: "Delivery zone updated successfully.",
      data: { zone },
    });
  } catch (error) {
    handleDeliveryZoneError(res, error);
  }
}

// ============================================
// TOGGLE DELIVERY ZONE STATUS
// ============================================

export async function toggleAdminDeliveryZoneController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const zone = await toggleAdminDeliveryZone(getZoneId(req));

    res.status(200).json({
      success: true,
      message: "Delivery zone status updated successfully.",
      data: { zone },
    });
  } catch (error) {
    handleDeliveryZoneError(res, error);
  }
}

// ============================================
// DELETE DELIVERY ZONE
// ============================================

export async function deleteAdminDeliveryZoneController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    await deleteAdminDeliveryZone(getZoneId(req));

    res.status(200).json({
      success: true,
      message: "Delivery zone deleted successfully.",
      data: null,
    });
  } catch (error) {
    handleDeliveryZoneError(res, error);
  }
}

// ============================================
// ERROR HANDLER
// ============================================

function handleDeliveryZoneError(res: Response, error: unknown): void {
  if (error instanceof AdminDeliveryZoneError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: null,
    });

    return;
  }

  console.error("Admin delivery zones error:", error);

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred while processing delivery zones.",
    data: null,
  });
}
