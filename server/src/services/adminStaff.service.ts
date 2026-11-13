import { createHash, randomBytes } from "node:crypto";
import { Types } from "mongoose";

import AdminInvitation from "../models/AdminInvitation.js";
import AdminRole, { ADMIN_PERMISSIONS } from "../models/AdminRole.js";
import User from "../models/User.js";

import { sendStaffInvitationEmail } from "./email.service.js";
import { createStaffInvitedNotifications } from "./admin-notification.service.js";
import { env } from "../config/env.js";

// ==================================================
// TYPES
// ==================================================

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export interface CreateStaffInvitationInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  roleId: string;
}

export interface GetAdminStaffOptions {
  search?: string;
  status?: "active" | "disabled";
  roleId?: string;
  page?: number;
  limit?: number;
}

export interface UpdateStaffRoleInput {
  roleId: string;
}

export type StaffAccountStatus = "active" | "disabled";

interface StaffManagementActor {
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
}

export class AdminStaffError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminStaffError";
    this.statusCode = statusCode;
  }
}

// ==================================================
// CONSTANTS
// ==================================================

const INVITATION_EXPIRY_HOURS = 24;
const MAX_PAGE_SIZE = 100;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==================================================
// GENERAL HELPERS
// ==================================================

function validateObjectId(value: string, fieldName: string): void {
  if (!Types.ObjectId.isValid(value)) {
    throw new AdminStaffError(`Invalid ${fieldName}.`, 400);
  }
}

function validateAdminId(adminId: string): Types.ObjectId {
  validateObjectId(adminId, "administrator ID");
  return new Types.ObjectId(adminId);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): string {
  const normalized = normalizeEmail(email);

  if (normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
    throw new AdminStaffError("Please provide a valid email address.");
  }

  return normalized;
}

function validateFullName(fullName: string): string {
  const normalized = fullName.trim().replace(/\s+/g, " ");

  if (normalized.length < 2 || normalized.length > 100) {
    throw new AdminStaffError(
      "Full name must be between 2 and 100 characters.",
    );
  }

  return normalized;
}

function validatePhoneNumber(phoneNumber?: string): string | undefined {
  if (phoneNumber === undefined || phoneNumber.trim() === "") {
    return undefined;
  }

  const normalized = phoneNumber.trim();

  if (normalized.length > 30) {
    throw new AdminStaffError("Phone number is too long.");
  }

  return normalized;
}

function validatePagination(page?: number, limit?: number) {
  const safePage = Number.isInteger(page) && page! > 0 ? page! : 1;

  const safeLimit =
    Number.isInteger(limit) && limit! > 0
      ? Math.min(limit!, MAX_PAGE_SIZE)
      : 20;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateInvitationToken(): string {
  return randomBytes(32).toString("hex");
}

function getInvitationExpiry(): Date {
  return new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);
}

function buildInvitationUrl(token: string): string {
  const clientUrl = new URL(env.CLIENT_URL);

  return `${clientUrl.origin}/admin/accept-invitation?token=${encodeURIComponent(token)}`;
}

// ==================================================
// PERMISSION VALIDATION
// ==================================================

function validatePermissions(permissions: string[]): AdminPermission[] {
  if (!Array.isArray(permissions)) {
    throw new AdminStaffError(
      "The assigned role contains invalid permissions.",
      403,
    );
  }

  const validPermissions = permissions.filter(
    (permission): permission is AdminPermission =>
      (ADMIN_PERMISSIONS as readonly string[]).includes(permission),
  );

  if (validPermissions.length !== permissions.length) {
    throw new AdminStaffError(
      "The assigned role contains an unsupported permission.",
      403,
    );
  }

  return validPermissions;
}

// ==================================================
// STAFF MANAGEMENT AUTHORIZATION
// ==================================================

async function getStaffManagementActor(
  adminId: string,
): Promise<StaffManagementActor> {
  const adminObjectId = validateAdminId(adminId);

  const admin = await User.findOne({
    _id: adminObjectId,
    role: "admin",
    status: "active",
    deletedAt: null,
  })
    .select("_id adminType adminRoleId")
    .lean();

  if (!admin) {
    throw new AdminStaffError("Administrator account is unavailable.", 403);
  }

  if (admin.adminType === "super_admin") {
    return {
      isSuperAdmin: true,
      permissions: [...ADMIN_PERMISSIONS],
    };
  }

  if (admin.adminType !== "staff") {
    throw new AdminStaffError(
      "Your administrator account is not authorized.",
      403,
    );
  }

  if (!admin.adminRoleId) {
    throw new AdminStaffError(
      "Your staff account has no assigned administrator role.",
      403,
    );
  }

  const assignedRole = await AdminRole.findOne({
    _id: admin.adminRoleId,
    isProtected: false,
    key: { $ne: "administrator" },
  })
    .select("permissions")
    .lean();

  if (!assignedRole) {
    throw new AdminStaffError(
      "Your assigned administrator role is unavailable.",
      403,
    );
  }

  const permissions = validatePermissions(assignedRole.permissions ?? []);

  if (!permissions.includes("staff.manage")) {
    throw new AdminStaffError(
      "You do not have permission to manage staff members.",
      403,
    );
  }

  return {
    isSuperAdmin: false,
    permissions,
  };
}

function ensureCanAssignRole(
  actor: StaffManagementActor,
  rolePermissions: AdminPermission[],
): void {
  if (actor.isSuperAdmin) {
    return;
  }

  const actorPermissions = new Set(actor.permissions);

  const unauthorizedPermissions = rolePermissions.filter(
    (permission) => !actorPermissions.has(permission),
  );

  if (unauthorizedPermissions.length > 0) {
    throw new AdminStaffError(
      "You cannot assign a role containing permissions that are not assigned to your own administrator role.",
      403,
    );
  }
}

// ==================================================
// ROLE VALIDATION
// ==================================================

async function findAssignableRole(roleId: string, actor: StaffManagementActor) {
  validateObjectId(roleId, "role ID");

  const role = await AdminRole.findById(roleId);

  if (!role) {
    throw new AdminStaffError("Administrator role not found.", 404);
  }

  if (role.key === "administrator" || role.isProtected) {
    throw new AdminStaffError(
      "This protected administrator role cannot be assigned to staff.",
      403,
    );
  }

  const permissions = validatePermissions(role.permissions ?? []);

  ensureCanAssignRole(actor, permissions);

  return role;
}

// ==================================================
// STAFF VALIDATION
// ==================================================

async function findStaffOrThrow(staffId: string) {
  validateObjectId(staffId, "staff ID");

  const staff = await User.findOne({
    _id: staffId,
    role: "admin",
    adminType: "staff",
    deletedAt: null,
  });

  if (!staff) {
    throw new AdminStaffError("Staff account not found.", 404);
  }

  return staff;
}

function preventSelfManagement(staffId: string, adminId: string): void {
  const normalizedStaffId = new Types.ObjectId(staffId).toString();
  const normalizedAdminId = new Types.ObjectId(adminId).toString();

  if (normalizedStaffId === normalizedAdminId) {
    throw new AdminStaffError("You cannot modify your own staff account.", 403);
  }
}

// ==================================================
// STAFF RESPONSE MAPPING
// ==================================================

async function mapStaffRecord(staff: {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  adminRoleId?: Types.ObjectId | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  let assignedRole = null;

  if (staff.adminRoleId) {
    const role = await AdminRole.findById(staff.adminRoleId)
      .select("name key color permissions")
      .lean();

    if (role) {
      assignedRole = {
        id: role._id.toString(),
        name: role.name,
        key: role.key,
        color: role.color,
        permissions: role.permissions,
      };
    }
  }

  return {
    id: staff._id.toString(),
    fullName: staff.fullName,
    email: staff.email,
    phoneNumber: staff.phoneNumber ?? null,
    status: staff.status,
    role: assignedRole,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  };
}

// ==================================================
// INVITATION RESPONSE MAPPING
// ==================================================

async function mapInvitationRecord(invitation: {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  roleId: Types.ObjectId;
  status: string;
  invitedBy: Types.ObjectId;
  expiresAt: Date;
  acceptedAt?: Date | null;
  revokedAt?: Date | null;
  failedAt?: Date | null;
  failureReason?: string | null;
  emailStatus: string;
  emailId?: string | null;
  emailSentAt?: Date | null;
  lastEmailAttemptAt?: Date | null;
  emailAttemptCount: number;
  createdAt: Date;
}) {
  const role = await AdminRole.findById(invitation.roleId)
    .select("name key color")
    .lean();

  return {
    id: invitation._id.toString(),
    email: invitation.email,
    fullName: invitation.fullName,
    phoneNumber: invitation.phoneNumber ?? null,

    role: role
      ? {
          id: role._id.toString(),
          name: role.name,
          key: role.key,
          color: role.color,
        }
      : null,

    status: invitation.status,
    emailStatus: invitation.emailStatus,
    emailId: invitation.emailId ?? null,
    emailSentAt: invitation.emailSentAt ?? null,
    lastEmailAttemptAt: invitation.lastEmailAttemptAt ?? null,
    emailAttemptCount: invitation.emailAttemptCount,

    invitedBy: invitation.invitedBy.toString(),
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt ?? null,
    revokedAt: invitation.revokedAt ?? null,
    failedAt: invitation.failedAt ?? null,

    createdAt: invitation.createdAt,
  };
}

// ==================================================
// INVITATION EMAIL DELIVERY
// ==================================================

async function deliverInvitationEmail(
  invitationId: Types.ObjectId,
  token: string,
  details: {
    email: string;
    fullName: string;
    roleName: string;
  },
) {
  const invitation = await AdminInvitation.findById(invitationId);

  if (!invitation) {
    throw new AdminStaffError("Invitation not found.", 404);
  }

  invitation.lastEmailAttemptAt = new Date();
  invitation.emailAttemptCount += 1;
  invitation.emailProvider = "gmail";

  await invitation.save();

  try {
    const emailResponse = await sendStaffInvitationEmail({
      to: details.email,
      fullName: details.fullName,
      roleName: details.roleName,
      invitationUrl: buildInvitationUrl(token),
      expiresIn: `${INVITATION_EXPIRY_HOURS} hours`,
    });

    if (!emailResponse?.id) {
      throw new Error("Gmail SMTP did not return an email message ID.");
    }

    invitation.emailProvider = "gmail";
    invitation.emailStatus = "sent";
    invitation.emailId = emailResponse.id;
    invitation.emailSentAt = new Date();
    invitation.failureReason = undefined;
    invitation.failedAt = null;

    await invitation.save();

    return {
      emailStatus: invitation.emailStatus,
      emailId: invitation.emailId,
      emailSentAt: invitation.emailSentAt,
    };
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : "Unknown email delivery error.";

    console.error("[Staff Invitation Email Error]", failureReason);

    invitation.status = "failed";
    invitation.emailStatus = "failed";
    invitation.failedAt = new Date();
    invitation.failureReason = failureReason.slice(0, 500);

    try {
      await invitation.save();
    } catch (saveError) {
      console.error(
        "[Staff Invitation Failure Record Error]",
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the failed invitation record.",
      );
    }

    throw new AdminStaffError(
      "The invitation was created, but the email could not be sent. You can retry the invitation after resolving the email delivery issue.",
      502,
    );
  }
}

// ==================================================
// STAFF INVITATION NOTIFICATION
// ==================================================

async function notifyAdminsOfStaffInvitation(details: {
  invitationId: string;
  invitedBy: string;
  inviteeName: string;
  inviteeEmail: string;
  roleName: string;
}): Promise<void> {
  try {
    await createStaffInvitedNotifications(details);
  } catch (error: unknown) {
    console.error(
      "[Admin Notifications] Failed to create staff invitation notifications:",
      error,
    );
  }
}

// ==================================================
// GET STAFF MEMBERS
// ==================================================

export async function getAdminStaff(options: GetAdminStaffOptions = {}) {
  const { page, limit, skip } = validatePagination(options.page, options.limit);

  const filter: Record<string, unknown> = {
    role: "admin",
    adminType: "staff",
    deletedAt: null,
  };

  if (options.status) {
    filter.status = options.status;
  }

  if (options.roleId) {
    validateObjectId(options.roleId, "role ID");
    filter.adminRoleId = new Types.ObjectId(options.roleId);
  }

  if (options.search?.trim()) {
    const searchRegex = new RegExp(escapeRegex(options.search.trim()), "i");

    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex },
    ];
  }

  const [staffMembers, total] = await Promise.all([
    User.find(filter)
      .select(
        "fullName email phoneNumber adminRoleId status createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  const data = await Promise.all(
    staffMembers.map((staff) => mapStaffRecord(staff)),
  );

  return {
    staff: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

// ==================================================
// GET STAFF MEMBER BY ID
// ==================================================

export async function getAdminStaffById(staffId: string) {
  const staff = await findStaffOrThrow(staffId);

  return mapStaffRecord({
    _id: staff._id,
    fullName: staff.fullName,
    email: staff.email,
    phoneNumber: staff.phoneNumber,
    adminRoleId: staff.adminRoleId,
    status: staff.status,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  });
}

// ==================================================
// CREATE STAFF INVITATION
// ==================================================

export async function createStaffInvitation(
  input: CreateStaffInvitationInput,
  adminId: string,
) {
  validateAdminId(adminId);

  const actor = await getStaffManagementActor(adminId);

  const fullName = validateFullName(input.fullName);
  const email = validateEmail(input.email);
  const phoneNumber = validatePhoneNumber(input.phoneNumber);

  const role = await findAssignableRole(input.roleId, actor);

  const existingUser = await User.findOne({ email }).select(
    "_id role adminType",
  );

  if (existingUser) {
    throw new AdminStaffError(
      "An account with this email address already exists.",
      409,
    );
  }

  const existingInvitation = await AdminInvitation.findOne({
    email,
    status: "pending",
  });

  if (existingInvitation) {
    if (existingInvitation.expiresAt <= new Date()) {
      existingInvitation.status = "expired";
      await existingInvitation.save();
    } else {
      throw new AdminStaffError(
        "There is already a pending invitation for this email address.",
        409,
      );
    }
  }

  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);

  const invitation = new AdminInvitation({
    email,
    fullName,
    phoneNumber,
    roleId: role._id,
    tokenHash,
    status: "pending",
    invitedBy: new Types.ObjectId(adminId),
    expiresAt: getInvitationExpiry(),
    emailProvider: "gmail",
    emailStatus: "not_sent",
    emailAttemptCount: 0,
  });

  await invitation.save();

  const delivery = await deliverInvitationEmail(invitation._id, token, {
    email,
    fullName,
    roleName: role.name,
  });

  const updatedInvitation = await AdminInvitation.findById(invitation._id);

  if (!updatedInvitation) {
    throw new AdminStaffError(
      "Invitation could not be retrieved after creation.",
      500,
    );
  }

  // Only create the notification after the email is confirmed as sent.
  if (
    delivery.emailStatus === "sent" &&
    updatedInvitation.emailStatus === "sent"
  ) {
    await notifyAdminsOfStaffInvitation({
      invitationId: updatedInvitation._id.toString(),
      invitedBy: adminId,
      inviteeName: fullName,
      inviteeEmail: email,
      roleName: role.name,
    });
  }

  return {
    invitation: await mapInvitationRecord(updatedInvitation),
    delivery,
  };
}

// ==================================================
// GET STAFF INVITATIONS
// ==================================================

export async function getStaffInvitations(options?: {
  status?: "pending" | "accepted" | "expired" | "revoked" | "failed";
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { page, limit, skip } = validatePagination(
    options?.page,
    options?.limit,
  );

  const filter: Record<string, unknown> = {};

  if (options?.status) {
    filter.status = options.status;
  }

  if (options?.search?.trim()) {
    const searchRegex = new RegExp(escapeRegex(options.search.trim()), "i");

    filter.$or = [{ fullName: searchRegex }, { email: searchRegex }];
  }

  const [invitations, total] = await Promise.all([
    AdminInvitation.find(filter)
      .select("-tokenHash -failureReason")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    AdminInvitation.countDocuments(filter),
  ]);

  const data = await Promise.all(
    invitations.map((invitation) => mapInvitationRecord(invitation)),
  );

  return {
    invitations: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

// ==================================================
// UPDATE STAFF ROLE
// ==================================================

export async function updateStaffRole(
  staffId: string,
  input: UpdateStaffRoleInput,
  adminId: string,
) {
  validateAdminId(adminId);
  validateObjectId(staffId, "staff ID");

  const actor = await getStaffManagementActor(adminId);

  preventSelfManagement(staffId, adminId);

  const staff = await findStaffOrThrow(staffId);

  const role = await findAssignableRole(input.roleId, actor);

  staff.adminRoleId = role._id;

  await staff.save();

  return mapStaffRecord({
    _id: staff._id,
    fullName: staff.fullName,
    email: staff.email,
    phoneNumber: staff.phoneNumber,
    adminRoleId: staff.adminRoleId,
    status: staff.status,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  });
}

// ==================================================
// UPDATE STAFF ACCOUNT STATUS
// ==================================================

export async function updateStaffStatus(
  staffId: string,
  status: StaffAccountStatus,
  adminId: string,
) {
  validateAdminId(adminId);

  validateObjectId(staffId, "staff ID");

  await getStaffManagementActor(adminId);

  preventSelfManagement(staffId, adminId);

  if (!["active", "disabled"].includes(status)) {
    throw new AdminStaffError("Invalid staff account status.");
  }

  const staff = await findStaffOrThrow(staffId);

  staff.status = status;

  await staff.save();

  return mapStaffRecord({
    _id: staff._id,
    fullName: staff.fullName,
    email: staff.email,
    phoneNumber: staff.phoneNumber,
    adminRoleId: staff.adminRoleId,
    status: staff.status,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  });
}

// ==================================================
// REVOKE STAFF INVITATION
// ==================================================

export async function revokeStaffInvitation(
  invitationId: string,
  adminId: string,
) {
  validateAdminId(adminId);

  validateObjectId(invitationId, "invitation ID");

  await getStaffManagementActor(adminId);

  const invitation = await AdminInvitation.findById(invitationId);

  if (!invitation) {
    throw new AdminStaffError("Invitation not found.", 404);
  }

  if (invitation.status !== "pending") {
    throw new AdminStaffError("Only pending invitations can be revoked.", 400);
  }

  invitation.status = "revoked";
  invitation.revokedAt = new Date();
  invitation.revokedBy = new Types.ObjectId(adminId);

  // Invalidate the invitation token immediately.
  invitation.tokenHash = hashInvitationToken(randomBytes(32).toString("hex"));

  await invitation.save();

  return {
    id: invitation._id.toString(),
    email: invitation.email,
    status: invitation.status,
    revokedAt: invitation.revokedAt,
  };
}

// ==================================================
// RESEND STAFF INVITATION
// ==================================================

export async function resendStaffInvitation(
  invitationId: string,
  adminId: string,
) {
  validateAdminId(adminId);

  validateObjectId(invitationId, "invitation ID");

  const actor = await getStaffManagementActor(adminId);

  const invitation = await AdminInvitation.findById(invitationId);

  if (!invitation) {
    throw new AdminStaffError("Invitation not found.", 404);
  }

  if (!["pending", "failed"].includes(invitation.status)) {
    throw new AdminStaffError("This invitation cannot be resent.", 400);
  }

  if (invitation.status === "pending" && invitation.expiresAt <= new Date()) {
    invitation.status = "expired";
    await invitation.save();

    throw new AdminStaffError(
      "This invitation has expired. It cannot be resent.",
      400,
    );
  }

  const role = await AdminRole.findById(invitation.roleId);

  if (!role) {
    throw new AdminStaffError(
      "The assigned administrator role no longer exists.",
      404,
    );
  }

  if (role.key === "administrator" || role.isProtected) {
    throw new AdminStaffError(
      "This protected administrator role cannot be assigned to staff.",
      403,
    );
  }

  const rolePermissions = validatePermissions(role.permissions ?? []);

  ensureCanAssignRole(actor, rolePermissions);

  const existingUser = await User.findOne({
    email: invitation.email,
  }).select("_id");

  if (existingUser) {
    throw new AdminStaffError(
      "An account with this email address already exists.",
      409,
    );
  }

  // Generate a completely new token.
  // The previous invitation link becomes invalid immediately.
  const token = generateInvitationToken();

  invitation.tokenHash = hashInvitationToken(token);
  invitation.status = "pending";
  invitation.expiresAt = getInvitationExpiry();
  invitation.failedAt = null;
  invitation.failureReason = undefined;
  invitation.emailProvider = "gmail";
  invitation.emailStatus = "not_sent";
  invitation.emailId = undefined;
  invitation.emailSentAt = null;

  await invitation.save();

  const delivery = await deliverInvitationEmail(invitation._id, token, {
    email: invitation.email,
    fullName: invitation.fullName,
    roleName: role.name,
  });

  const updatedInvitation = await AdminInvitation.findById(invitation._id);

  if (!updatedInvitation) {
    throw new AdminStaffError(
      "Invitation could not be retrieved after resending.",
      500,
    );
  }

  return {
    invitation: await mapInvitationRecord(updatedInvitation),
    delivery,
  };
}
