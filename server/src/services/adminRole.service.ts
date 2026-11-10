import { Types } from "mongoose";

import AdminRole, {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_COLORS,
  ADMIN_ROLE_KEYS,
} from "../models/AdminRole.js";

import User from "../models/User.js";

// ============================================
// TYPES
// ============================================

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export type AdminRoleColor = (typeof ADMIN_ROLE_COLORS)[number];

export type AdminRoleKey = (typeof ADMIN_ROLE_KEYS)[number];

export interface CreateAdminRoleInput {
  name: string;
  description: string;
  color: AdminRoleColor;
  permissions: AdminPermission[];
}

export interface UpdateAdminRoleInput {
  name?: string;
  description?: string;
  color?: AdminRoleColor;
  permissions?: AdminPermission[];
}

export interface AdminRoleResponse {
  id: string;
  key: AdminRoleKey;
  name: string;
  description: string;
  color: AdminRoleColor;
  permissions: AdminPermission[];
  staffCount: number;
  isSystem: boolean;
}

interface RoleManagementActor {
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
}

export class AdminRoleError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminRoleError";
    this.statusCode = statusCode;
  }
}

// ============================================
// HELPERS
// ============================================

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateObjectId(value: string, label: string): void {
  if (!Types.ObjectId.isValid(value)) {
    throw new AdminRoleError(`Invalid ${label}.`);
  }
}

function validateAdminId(adminId: string): Types.ObjectId {
  validateObjectId(adminId, "administrator ID");
  return new Types.ObjectId(adminId);
}

function normalizeRoleName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function validateRoleName(name: string): string {
  const normalizedName = normalizeRoleName(name);

  if (normalizedName.length < 2) {
    throw new AdminRoleError("Role name must contain at least 2 characters.");
  }

  if (normalizedName.length > 60) {
    throw new AdminRoleError("Role name cannot exceed 60 characters.");
  }

  return normalizedName;
}

function validateRoleDescription(description: string): string {
  const normalizedDescription = description.trim();

  if (normalizedDescription.length > 250) {
    throw new AdminRoleError("Role description cannot exceed 250 characters.");
  }

  return normalizedDescription;
}

function validateRoleColor(color: string): AdminRoleColor {
  if (!ADMIN_ROLE_COLORS.includes(color as AdminRoleColor)) {
    throw new AdminRoleError("Invalid role color.");
  }

  return color as AdminRoleColor;
}

function validatePermissions(permissions: string[]): AdminPermission[] {
  if (!Array.isArray(permissions)) {
    throw new AdminRoleError("Role permissions must be an array.");
  }

  const uniquePermissions = [...new Set(permissions)];

  if (uniquePermissions.length !== permissions.length) {
    throw new AdminRoleError("A role cannot contain duplicate permissions.");
  }

  const invalidPermissions = uniquePermissions.filter(
    (permission) => !ADMIN_PERMISSIONS.includes(permission as AdminPermission),
  );

  if (invalidPermissions.length > 0) {
    throw new AdminRoleError(
      `Invalid permissions: ${invalidPermissions.join(", ")}.`,
    );
  }

  return uniquePermissions as AdminPermission[];
}

// ============================================
// ROLE MANAGEMENT AUTHORIZATION
// ============================================

/**
 * Retrieves the current administrator's role and permissions.
 *
 * Super Admin receives all permissions.
 * Staff receives only permissions from their assigned role.
 */
async function getRoleManagementActor(
  adminId: string,
): Promise<RoleManagementActor> {
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
    throw new AdminRoleError("Administrator account is unavailable.", 403);
  }

  // Super Admin has full access to role management.
  if (admin.adminType === "super_admin") {
    return {
      isSuperAdmin: true,
      permissions: [...ADMIN_PERMISSIONS],
    };
  }

  // Only staff administrators can continue.
  if (admin.adminType !== "staff") {
    throw new AdminRoleError(
      "Your administrator account is not authorized.",
      403,
    );
  }

  if (!admin.adminRoleId) {
    throw new AdminRoleError(
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
    throw new AdminRoleError(
      "Your assigned administrator role is unavailable.",
      403,
    );
  }

  const permissions = validatePermissions(assignedRole.permissions ?? []);

  if (!permissions.includes("staff.manage")) {
    throw new AdminRoleError(
      "You do not have permission to manage administrator roles.",
      403,
    );
  }

  return {
    isSuperAdmin: false,
    permissions,
  };
}

/**
 * Ensures the administrator can grant every requested permission.
 *
 * Super Admin can grant all defined permissions.
 * Staff can only grant permissions they already possess.
 */
function ensureCanDelegatePermissions(
  actor: RoleManagementActor,
  permissions: AdminPermission[],
): void {
  if (actor.isSuperAdmin) {
    return;
  }

  const unauthorizedPermissions = permissions.filter(
    (permission) => !actor.permissions.includes(permission),
  );

  if (unauthorizedPermissions.length > 0) {
    throw new AdminRoleError(
      "You cannot grant permissions that are not assigned to your own administrator role.",
      403,
    );
  }
}

/**
 * Prevents staff from modifying or deleting roles that contain
 * permissions beyond their own authority.
 */
function ensureRoleWithinAuthority(
  role: any,
  actor: RoleManagementActor,
): void {
  if (actor.isSuperAdmin) {
    return;
  }

  const rolePermissions = validatePermissions(role.permissions ?? []);

  ensureCanDelegatePermissions(actor, rolePermissions);
}

// ============================================
// ROLE RESPONSE MAPPING
// ============================================

function mapAdminRole(role: any, staffCount: number): AdminRoleResponse {
  return {
    id: role._id.toString(),
    key: role.key,
    name: role.name,
    description: role.description ?? "",
    color: role.color,
    permissions: role.permissions ?? [],
    staffCount,
    isSystem: role.isSystem,
  };
}

// ============================================
// STAFF COUNT
// ============================================

async function getStaffCount(roleId: Types.ObjectId): Promise<number> {
  return User.countDocuments({
    role: "admin",
    adminType: "staff",
    adminRoleId: roleId,
    deletedAt: null,
  });
}

// ============================================
// UNIQUE ROLE NAME
// ============================================

async function ensureUniqueRoleName(
  name: string,
  excludeRoleId?: Types.ObjectId,
): Promise<void> {
  const filter: Record<string, any> = {
    name: new RegExp(`^${escapeRegex(name)}$`, "i"),
  };

  if (excludeRoleId) {
    filter._id = { $ne: excludeRoleId };
  }

  const existingRole = await AdminRole.exists(filter);

  if (existingRole) {
    throw new AdminRoleError("A role with this name already exists.", 409);
  }
}

// ============================================
// FIND ROLE
// ============================================

async function findRoleOrThrow(roleId: string): Promise<any> {
  validateObjectId(roleId, "role ID");

  const role = await AdminRole.findById(roleId);

  if (!role) {
    throw new AdminRoleError("Role could not be found.", 404);
  }

  return role;
}

// ============================================
// PROTECTED ROLE VALIDATION
// ============================================

function ensureRoleCanBeEdited(role: any): void {
  if (role.isProtected || role.key === "administrator") {
    throw new AdminRoleError(
      "The administrator role is protected and cannot be modified.",
      403,
    );
  }
}

// ============================================
// GET ALL ROLES
// ============================================

export async function getAdminRoles(): Promise<AdminRoleResponse[]> {
  const roles = await AdminRole.find().sort({ isSystem: -1, name: 1 }).lean();

  if (roles.length === 0) {
    return [];
  }

  const roleIds = roles.map((role) => role._id);

  const staffCounts = await User.aggregate([
    {
      $match: {
        role: "admin",
        adminType: "staff",
        deletedAt: null,
        adminRoleId: { $in: roleIds },
      },
    },
    {
      $group: {
        _id: "$adminRoleId",
        count: { $sum: 1 },
      },
    },
  ]);

  const staffCountMap = new Map<string, number>(
    staffCounts.map((item) => [item._id.toString(), item.count]),
  );

  return roles.map((role) =>
    mapAdminRole(role, staffCountMap.get(role._id.toString()) ?? 0),
  );
}

// ============================================
// GET SINGLE ROLE
// ============================================

export async function getAdminRoleById(
  roleId: string,
): Promise<AdminRoleResponse> {
  const role = await findRoleOrThrow(roleId);

  const staffCount = await getStaffCount(role._id);

  return mapAdminRole(role, staffCount);
}

// ============================================
// CREATE CUSTOM ROLE
// ============================================

export async function createAdminRole(
  input: CreateAdminRoleInput,
  adminId: string,
): Promise<AdminRoleResponse> {
  const createdBy = validateAdminId(adminId);

  // Verify the administrator is allowed to manage roles.
  const actor = await getRoleManagementActor(adminId);

  const name = validateRoleName(input.name);

  const description = validateRoleDescription(input.description ?? "");

  const color = validateRoleColor(input.color);

  const permissions = validatePermissions(input.permissions);

  // Prevent staff from granting permissions they do not possess.
  ensureCanDelegatePermissions(actor, permissions);

  await ensureUniqueRoleName(name);

  const role = await AdminRole.create({
    key: "custom",
    name,
    description,
    color,
    permissions,

    // Custom roles can never become system or protected roles
    // through a client request.
    isSystem: false,
    isProtected: false,

    createdBy,
    updatedBy: createdBy,
  });

  return mapAdminRole(role, 0);
}

// ============================================
// UPDATE ROLE
// ============================================

export async function updateAdminRole(
  roleId: string,
  input: UpdateAdminRoleInput,
  adminId: string,
): Promise<AdminRoleResponse> {
  const updatedBy = validateAdminId(adminId);

  // Verify the administrator is allowed to manage roles.
  const actor = await getRoleManagementActor(adminId);

  const role = await findRoleOrThrow(roleId);

  ensureRoleCanBeEdited(role);

  // Staff cannot modify a role containing permissions
  // outside their own authority.
  ensureRoleWithinAuthority(role, actor);

  if (
    input.name === undefined &&
    input.description === undefined &&
    input.color === undefined &&
    input.permissions === undefined
  ) {
    throw new AdminRoleError("Provide at least one role field to update.");
  }

  if (input.name !== undefined) {
    const name = validateRoleName(input.name);

    await ensureUniqueRoleName(name, role._id);

    role.name = name;
  }

  if (input.description !== undefined) {
    role.description = validateRoleDescription(input.description);
  }

  if (input.color !== undefined) {
    role.color = validateRoleColor(input.color);
  }

  if (input.permissions !== undefined) {
    const permissions = validatePermissions(input.permissions);

    // Prevent staff from adding permissions they do not possess.
    ensureCanDelegatePermissions(actor, permissions);

    role.permissions = permissions;
  }

  role.updatedBy = updatedBy;

  await role.save();

  const staffCount = await getStaffCount(role._id);

  return mapAdminRole(role, staffCount);
}

// ============================================
// DELETE ROLE
// ============================================

export async function deleteAdminRole(
  roleId: string,
  adminId: string,
): Promise<{ id: string; message: string }> {
  validateAdminId(adminId);

  // Verify the administrator is allowed to manage roles.
  const actor = await getRoleManagementActor(adminId);

  const role = await findRoleOrThrow(roleId);

  // System roles must never be deleted.
  if (role.isSystem || role.key !== "custom") {
    throw new AdminRoleError("System roles cannot be deleted.", 403);
  }

  if (role.isProtected) {
    throw new AdminRoleError("Protected roles cannot be deleted.", 403);
  }

  // Staff cannot delete roles containing permissions
  // beyond their own authority.
  ensureRoleWithinAuthority(role, actor);

  const assignedStaffCount = await getStaffCount(role._id);

  if (assignedStaffCount > 0) {
    throw new AdminRoleError(
      `This role is assigned to ${assignedStaffCount} staff member(s). Reassign them before deleting the role.`,
      409,
    );
  }

  await AdminRole.deleteOne({
    _id: role._id,
    isSystem: false,
    isProtected: false,
    key: "custom",
  });

  return {
    id: role._id.toString(),
    message: "Role deleted successfully.",
  };
}
