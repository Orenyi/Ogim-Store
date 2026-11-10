import type { Request, Response } from "express";

import {
  AdminStaffError,
  getAdminStaff,
  getAdminStaffById,
  createStaffInvitation,
  getStaffInvitations,
  updateStaffRole,
  updateStaffStatus,
  revokeStaffInvitation,
  resendStaffInvitation,
} from "../services/adminStaff.service.js";

import type {
  CreateStaffInvitationInput,
  GetAdminStaffOptions,
  UpdateStaffRoleInput,
  StaffAccountStatus,
} from "../services/adminStaff.service.js";

// ============================================
// CONSTANTS
// ============================================

const STAFF_STATUSES = ["active", "disabled"] as const;

const INVITATION_STATUSES = [
  "pending",
  "accepted",
  "expired",
  "revoked",
  "failed",
] as const;

// ============================================
// HELPERS
// ============================================

function getAdminId(req: Request): string | null {
  const authAdmin = (req as any).authAdmin;

  const adminId = authAdmin?.userId;

  return typeof adminId === "string" ? adminId : null;
}

function getString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }

  return fallback;
}

function getOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed || undefined;
}

function getPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== "string" && typeof value !== "number") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function sendError(res: Response, error: unknown) {
  if (error instanceof AdminStaffError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error && error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error && error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid staff or invitation reference.",
    });
  }

  console.error("Admin staff error:", error);

  return res.status(500).json({
    success: false,
    message: "An unexpected staff management error occurred.",
  });
}

// ============================================
// GET ALL STAFF
// ============================================

export async function getAdminStaffController(req: Request, res: Response) {
  try {
    const statusValue = getString(req.query.status);

    if (
      statusValue &&
      !STAFF_STATUSES.includes(statusValue as (typeof STAFF_STATUSES)[number])
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff account status.",
      });
    }

    const options: GetAdminStaffOptions = {
      search: getOptionalString(req.query.search),
      status: statusValue ? (statusValue as StaffAccountStatus) : undefined,
      roleId: getOptionalString(req.query.roleId),
      page: getPositiveInteger(req.query.page, 1),
      limit: getPositiveInteger(req.query.limit, 20),
    };

    const result = await getAdminStaff(options);

    return res.status(200).json({
      success: true,
      message: "Staff members retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// GET SINGLE STAFF MEMBER
// ============================================

export async function getAdminStaffByIdController(req: Request, res: Response) {
  try {
    const staffId = getString(req.params.staffId);

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff ID is required.",
      });
    }

    const staff = await getAdminStaffById(staffId);

    return res.status(200).json({
      success: true,
      message: "Staff member retrieved successfully.",
      data: {
        staff,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// CREATE STAFF INVITATION
// ============================================

export async function createStaffInvitationController(
  req: Request,
  res: Response,
) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const input: CreateStaffInvitationInput = {
      fullName: getString(req.body.fullName),
      email: getString(req.body.email),
      phoneNumber: getOptionalString(req.body.phoneNumber),
      roleId: getString(req.body.roleId),
    };

    if (!input.fullName || !input.email || !input.roleId) {
      return res.status(400).json({
        success: false,
        message: "Full name, email address and staff role are required.",
      });
    }

    const result = await createStaffInvitation(input, adminId);

    return res.status(201).json({
      success: true,
      message: "Staff invitation created successfully.",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// GET STAFF INVITATIONS
// ============================================

export async function getStaffInvitationsController(
  req: Request,
  res: Response,
) {
  try {
    const statusValue = getString(req.query.status);

    if (
      statusValue &&
      !INVITATION_STATUSES.includes(
        statusValue as (typeof INVITATION_STATUSES)[number],
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid invitation status.",
      });
    }

    const result = await getStaffInvitations({
      status: statusValue
        ? (statusValue as (typeof INVITATION_STATUSES)[number])
        : undefined,
      search: getOptionalString(req.query.search),
      page: getPositiveInteger(req.query.page, 1),
      limit: getPositiveInteger(req.query.limit, 20),
    });

    return res.status(200).json({
      success: true,
      message: "Staff invitations retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// UPDATE STAFF ROLE
// ============================================

export async function updateStaffRoleController(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const staffId = getString(req.params.staffId);

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff ID is required.",
      });
    }

    const input: UpdateStaffRoleInput = {
      roleId: getString(req.body.roleId),
    };

    if (!input.roleId) {
      return res.status(400).json({
        success: false,
        message: "A staff role is required.",
      });
    }

    const staff = await updateStaffRole(staffId, input, adminId);

    return res.status(200).json({
      success: true,
      message: "Staff role updated successfully.",
      data: {
        staff,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// UPDATE STAFF ACCOUNT STATUS
// ============================================

export async function updateStaffStatusController(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const staffId = getString(req.params.staffId);

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff ID is required.",
      });
    }

    const status = getString(req.body.status);

    if (!STAFF_STATUSES.includes(status as (typeof STAFF_STATUSES)[number])) {
      return res.status(400).json({
        success: false,
        message: "Status must be either active or disabled.",
      });
    }

    const staff = await updateStaffStatus(
      staffId,
      status as StaffAccountStatus,
      adminId,
    );

    return res.status(200).json({
      success: true,
      message: "Staff account status updated successfully.",
      data: {
        staff,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// REVOKE STAFF INVITATION
// ============================================

export async function revokeStaffInvitationController(
  req: Request,
  res: Response,
) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const invitationId = getString(req.params.invitationId);

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required.",
      });
    }

    const result = await revokeStaffInvitation(invitationId, adminId);

    return res.status(200).json({
      success: true,
      message: "Staff invitation revoked successfully.",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// RESEND STAFF INVITATION
// ============================================

export async function resendStaffInvitationController(
  req: Request,
  res: Response,
) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const invitationId = getString(req.params.invitationId);

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "Invitation ID is required.",
      });
    }

    const result = await resendStaffInvitation(invitationId, adminId);

    return res.status(200).json({
      success: true,
      message: "Staff invitation email sent successfully.",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}
