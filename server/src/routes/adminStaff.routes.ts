import { Router } from "express";

import {
  getAdminStaffController,
  getAdminStaffByIdController,
  createStaffInvitationController,
  getStaffInvitationsController,
  updateStaffRoleController,
  updateStaffStatusController,
  revokeStaffInvitationController,
  resendStaffInvitationController,
} from "../controllers/adminStaff.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

// All staff routes require an authenticated, active administrator.
router.use(requireAdmin);

// ============================================
// STAFF INVITATIONS
// ============================================

// GET /api/v1/admin/staff/invitations
router.get(
  "/invitations",
  requireAdminPermission("staff.view"),
  getStaffInvitationsController,
);

// POST /api/v1/admin/staff/invitations
router.post(
  "/invitations",
  requireAdminPermission("staff.manage"),
  createStaffInvitationController,
);

// POST /api/v1/admin/staff/invitations/:invitationId/resend
router.post(
  "/invitations/:invitationId/resend",
  requireAdminPermission("staff.manage"),
  resendStaffInvitationController,
);

// POST /api/v1/admin/staff/invitations/:invitationId/revoke
router.post(
  "/invitations/:invitationId/revoke",
  requireAdminPermission("staff.manage"),
  revokeStaffInvitationController,
);

// ============================================
// STAFF MANAGEMENT
// ============================================

// GET /api/v1/admin/staff
router.get("/", requireAdminPermission("staff.view"), getAdminStaffController);

// GET /api/v1/admin/staff/:staffId
router.get(
  "/:staffId",
  requireAdminPermission("staff.view"),
  getAdminStaffByIdController,
);

// PATCH /api/v1/admin/staff/:staffId/role
router.patch(
  "/:staffId/role",
  requireAdminPermission("staff.manage"),
  updateStaffRoleController,
);

// PATCH /api/v1/admin/staff/:staffId/status
router.patch(
  "/:staffId/status",
  requireAdminPermission("staff.manage"),
  updateStaffStatusController,
);

export default router;
