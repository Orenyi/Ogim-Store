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

const router = Router();

// All delivery administration routes require an authenticated admin.
router.use(requireAdmin);

// ============================================
// DELIVERY FEES
// ============================================

router.get("/fees", getAdminDeliveryFeesController);
router.post("/fees", createAdminDeliveryFeeController);
router.patch("/fees/:feeId", updateAdminDeliveryFeeController);
router.patch("/fees/:feeId/toggle", toggleAdminDeliveryFeeController);
router.post("/fees/:feeId/duplicate", duplicateAdminDeliveryFeeController);
router.delete("/fees/:feeId", deleteAdminDeliveryFeeController);

// ============================================
// DELIVERY SETTINGS
// ============================================

router.get("/settings", getAdminDeliverySettingsController);
router.patch("/settings", updateAdminDeliverySettingsController);

// ============================================
// DELIVERY ZONES
// ============================================

router.get("/zones", getAdminDeliveryZonesController);
router.post("/zones", createAdminDeliveryZoneController);
router.patch("/zones/:zoneId", updateAdminDeliveryZoneController);
router.patch("/zones/:zoneId/toggle", toggleAdminDeliveryZoneController);
router.delete("/zones/:zoneId", deleteAdminDeliveryZoneController);

export default router;
