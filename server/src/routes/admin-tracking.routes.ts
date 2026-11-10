import { Router } from "express";

import { requireAdmin } from "../middleware/auth.middleware.js";

import {
  getAdminTrackingOrdersController,
  getAdminTrackingOrderByIdController,
  updateAdminTrackingController,
} from "../controllers/admin-tracking.controller.js";

import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

router.use(requireAdmin);

// ============================================
// ORDER TRACKING MANAGEMENT
// ============================================

// GET /api/v1/admin/tracking
router.get(
  "/",
  requireAdminPermission("tracking.manage"),
  getAdminTrackingOrdersController,
);

// GET /api/v1/admin/tracking/:orderId
router.get(
  "/:orderId",
  requireAdminPermission("tracking.manage"),
  getAdminTrackingOrderByIdController,
);

// PATCH /api/v1/admin/tracking/:orderId
router.patch(
  "/:orderId",
  requireAdminPermission("tracking.manage"),
  updateAdminTrackingController,
);

export default router;
