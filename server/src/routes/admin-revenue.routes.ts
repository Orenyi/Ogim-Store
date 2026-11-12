import { Router } from "express";

import { getAdminRevenueReportController } from "../controllers/admin-revenue.controller.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// All revenue report endpoints require an authenticated admin.
router.use(requireAdmin);

// Only admins with reports.view permission can access revenue reports.
router.get(
  "/",
  requireAdminPermission("reports.view"),
  getAdminRevenueReportController,
);

export default router;
