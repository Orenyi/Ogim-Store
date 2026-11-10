import { Router } from "express";

import {
  getAdminRolesController,
  getAdminRoleByIdController,
  createAdminRoleController,
  updateAdminRoleController,
  deleteAdminRoleController,
} from "../controllers/adminRole.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

// All role routes require an authenticated, active administrator.
router.use(requireAdmin);

// ============================================
// ROLE MANAGEMENT
// ============================================

// GET /api/v1/admin/roles
router.get("/", requireAdminPermission("staff.view"), getAdminRolesController);

// GET /api/v1/admin/roles/:roleId
router.get(
  "/:roleId",
  requireAdminPermission("staff.view"),
  getAdminRoleByIdController,
);

// POST /api/v1/admin/roles
router.post(
  "/",
  requireAdminPermission("staff.manage"),
  createAdminRoleController,
);

// PATCH /api/v1/admin/roles/:roleId
router.patch(
  "/:roleId",
  requireAdminPermission("staff.manage"),
  updateAdminRoleController,
);

// DELETE /api/v1/admin/roles/:roleId
router.delete(
  "/:roleId",
  requireAdminPermission("staff.manage"),
  deleteAdminRoleController,
);

export default router;
