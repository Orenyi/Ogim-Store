import { Router } from "express";

import { getAdminDashboardSummaryController } from "../controllers/admin-dashboard.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";
import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

router.use(requireAdmin);

// ============================================
// DASHBOARD ROUTES
// ============================================

// GET /api/v1/admin/dashboard/summary
router.get(
  "/summary",
  requireAdminPermission("reports.view"),
  getAdminDashboardSummaryController,
);

export default router;
