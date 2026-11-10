import { Router } from "express";

import {
  getAdminDispatchesController,
  getAdminEligibleDispatchOrdersController,
  assignAdminDispatchController,
  updateAdminDispatchStatusController,
} from "../controllers/admin-dispatch.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

router.use(requireAdmin);

// ============================================
// DISPATCH MANAGEMENT
// ============================================

// GET /api/v1/admin/dispatch
// View dispatch records.
router.get(
  "/",
  requireAdminPermission("dispatch.view"),
  getAdminDispatchesController,
);

// GET /api/v1/admin/dispatch/eligible-orders
// View orders eligible for dispatch assignment.
router.get(
  "/eligible-orders",
  requireAdminPermission("dispatch.view"),
  getAdminEligibleDispatchOrdersController,
);

// POST /api/v1/admin/dispatch/assign
// Assign an order to a dispatch rider.
router.post(
  "/assign",
  requireAdminPermission("dispatch.manage"),
  assignAdminDispatchController,
);

// PATCH /api/v1/admin/dispatch/:dispatchId/status
// Update dispatch status.
router.patch(
  "/:dispatchId/status",
  requireAdminPermission("dispatch.manage"),
  updateAdminDispatchStatusController,
);

export default router;
