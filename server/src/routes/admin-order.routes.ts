import { Router } from "express";

import {
  getAdminOrderByIdController,
  getAdminOrdersController,
  updateAdminOrderStatusController,
} from "../controllers/admin-order.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

router.use(requireAdmin);

// ============================================
// ORDER MANAGEMENT
// ============================================

// GET /api/v1/admin/orders
router.get(
  "/",
  requireAdminPermission("orders.view"),
  getAdminOrdersController,
);

// GET /api/v1/admin/orders/:orderId
router.get(
  "/:orderId",
  requireAdminPermission("orders.view"),
  getAdminOrderByIdController,
);

// PATCH /api/v1/admin/orders/:orderId/status
router.patch(
  "/:orderId/status",
  requireAdminPermission("orders.manage"),
  updateAdminOrderStatusController,
);

export default router;
