import { Router } from "express";

import {
  getAdminDeliveryFeesController,
  createAdminDeliveryFeeController,
  updateAdminDeliveryFeeController,
  toggleAdminDeliveryFeeController,
  duplicateAdminDeliveryFeeController,
  deleteAdminDeliveryFeeController,
} from "../controllers/admin-delivery.controller.js";

import {
  getAdminDeliverySettingsController,
  updateAdminDeliverySettingsController,
} from "../controllers/admin-delivery-settings.controller.js";

import {
  getAdminDeliveryZonesController,
  createAdminDeliveryZoneController,
  updateAdminDeliveryZoneController,
  toggleAdminDeliveryZoneController,
  deleteAdminDeliveryZoneController,
} from "../controllers/admin-delivery-zones.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

router.use(requireAdmin);

// ============================================
// DELIVERY FEES
// ============================================

// GET /api/v1/admin/delivery/fees
router.get(
  "/fees",
  requireAdminPermission("delivery.manage"),
  getAdminDeliveryFeesController,
);

// POST /api/v1/admin/delivery/fees
router.post(
  "/fees",
  requireAdminPermission("delivery.manage"),
  createAdminDeliveryFeeController,
);

// PATCH /api/v1/admin/delivery/fees/:feeId
router.patch(
  "/fees/:feeId",
  requireAdminPermission("delivery.manage"),
  updateAdminDeliveryFeeController,
);

// PATCH /api/v1/admin/delivery/fees/:feeId/toggle
router.patch(
  "/fees/:feeId/toggle",
  requireAdminPermission("delivery.manage"),
  toggleAdminDeliveryFeeController,
);

// POST /api/v1/admin/delivery/fees/:feeId/duplicate
router.post(
  "/fees/:feeId/duplicate",
  requireAdminPermission("delivery.manage"),
  duplicateAdminDeliveryFeeController,
);

// DELETE /api/v1/admin/delivery/fees/:feeId
router.delete(
  "/fees/:feeId",
  requireAdminPermission("delivery.manage"),
  deleteAdminDeliveryFeeController,
);

// ============================================
// DELIVERY SETTINGS
// ============================================

// GET /api/v1/admin/delivery/settings
router.get(
  "/settings",
  requireAdminPermission("delivery.manage"),
  getAdminDeliverySettingsController,
);

// PATCH /api/v1/admin/delivery/settings
router.patch(
  "/settings",
  requireAdminPermission("delivery.manage"),
  updateAdminDeliverySettingsController,
);

// ============================================
// DELIVERY ZONES
// ============================================

// GET /api/v1/admin/delivery/zones
router.get(
  "/zones",
  requireAdminPermission("delivery.manage"),
  getAdminDeliveryZonesController,
);

// POST /api/v1/admin/delivery/zones
router.post(
  "/zones",
  requireAdminPermission("delivery.manage"),
  createAdminDeliveryZoneController,
);

// PATCH /api/v1/admin/delivery/zones/:zoneId
router.patch(
  "/zones/:zoneId",
  requireAdminPermission("delivery.manage"),
  updateAdminDeliveryZoneController,
);

// PATCH /api/v1/admin/delivery/zones/:zoneId/toggle
router.patch(
  "/zones/:zoneId/toggle",
  requireAdminPermission("delivery.manage"),
  toggleAdminDeliveryZoneController,
);

// DELETE /api/v1/admin/delivery/zones/:zoneId
router.delete(
  "/zones/:zoneId",
  requireAdminPermission("delivery.manage"),
  deleteAdminDeliveryZoneController,
);

export default router;
