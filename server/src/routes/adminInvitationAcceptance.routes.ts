import { Router } from "express";

import {
  validateStaffInvitationController,
  acceptStaffInvitationController,
} from "../controllers/adminInvitationAcceptance.controller.js";

import {
  invitationValidationRateLimit,
  invitationAcceptanceRateLimit,
} from "../middleware/auth-rate-limit.middleware.js";

import {
  requireCsrfToken,
  requireTrustedOrigin,
} from "../middleware/csrf.middleware.js";

const router = Router();

/**
 * Validate a staff invitation.
 *
 * POST /api/v1/admin/invitations/validate
 *
 * Public endpoint protected by:
 * - Trusted-origin validation
 * - CSRF protection
 * - Invitation validation rate limiting
 */
router.post(
  "/validate",
  requireTrustedOrigin,
  requireCsrfToken,
  invitationValidationRateLimit,
  validateStaffInvitationController,
);

/**
 * Accept a staff invitation and create the staff account.
 *
 * POST /api/v1/admin/invitations/accept
 *
 * Public endpoint protected by:
 * - Trusted-origin validation
 * - CSRF protection
 * - Invitation acceptance rate limiting
 */
router.post(
  "/accept",
  requireTrustedOrigin,
  requireCsrfToken,
  invitationAcceptanceRateLimit,
  acceptStaffInvitationController,
);

export default router;
