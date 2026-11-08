import { Router } from "express";

import { requireAdmin } from "../middleware/auth.middleware.js";

import {
  getAdminTrackingOrdersController,
  getAdminTrackingOrderByIdController,
  updateAdminTrackingController,
} from "../controllers/admin-tracking.controller.js";

const router = Router();

// All tracking management endpoints require administrator authentication.
router.use(requireAdmin);

// GET /api/v1/admin/tracking
router.get("/", getAdminTrackingOrdersController);

// GET /api/v1/admin/tracking/:orderId
router.get("/:orderId", getAdminTrackingOrderByIdController);

// PATCH /api/v1/admin/tracking/:orderId
router.patch("/:orderId", updateAdminTrackingController);

export default router;
