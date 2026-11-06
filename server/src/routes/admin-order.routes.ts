import { Router } from "express";

import {
  getAdminOrderByIdController,
  getAdminOrdersController,
  updateAdminOrderStatusController,
} from "../controllers/admin-order.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// All admin order endpoints require an authenticated admin.
router.use(requireAdmin);

// GET /api/v1/admin/orders
router.get("/", getAdminOrdersController);

// GET /api/v1/admin/orders/:orderId
router.get("/:orderId", getAdminOrderByIdController);

// PATCH /api/v1/admin/orders/:orderId/status
router.patch("/:orderId/status", updateAdminOrderStatusController);

export default router;
