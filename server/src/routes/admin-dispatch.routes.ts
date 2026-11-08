import { Router } from "express";

import {
  getAdminDispatchesController,
  getAdminEligibleDispatchOrdersController,
  assignAdminDispatchController,
  updateAdminDispatchStatusController,
} from "../controllers/admin-dispatch.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// All dispatch management routes require administrator access.
router.use(requireAdmin);

// GET /api/v1/admin/dispatch
router.get("/", getAdminDispatchesController);

// GET /api/v1/admin/dispatch/eligible-orders
router.get("/eligible-orders", getAdminEligibleDispatchOrdersController);

// POST /api/v1/admin/dispatch/assign
router.post("/assign", assignAdminDispatchController);

// PATCH /api/v1/admin/dispatch/:dispatchId/status
router.patch("/:dispatchId/status", updateAdminDispatchStatusController);

export default router;
