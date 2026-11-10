import { apiRequest } from "../../lib/api";

import type {
  AdminStaff,
  CreateRoleInput,
  CreateStaffInput,
  StaffQuery,
  StaffResponse,
  StaffRole,
  StaffSummary,
  StaffPermission,
} from "../types/staff.types";

// -----------------------------------------------------------------------------
// API response types
// -----------------------------------------------------------------------------

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

interface BackendStaff {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  status: "active" | "disabled";
  role: {
    id: string;
    name: string;
    key: StaffRole["key"];
    color: StaffRole["color"];
    permissions: StaffPermission[];
  } | null;
  createdAt: string;
  updatedAt?: string;
}

interface BackendStaffList {
  staff: BackendStaff[];
  pagination: BackendPagination;
}

interface BackendRole {
  id: string;
  key: StaffRole["key"];
  name: string;
  description: string;
  color: StaffRole["color"];
  permissions: StaffPermission[];
  staffCount: number;
  isSystem: boolean;
}

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "revoked"
  | "failed";

export interface AdminStaffInvitation {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  role: {
    id: string;
    name: string;
    key: StaffRole["key"];
    color: StaffRole["color"];
  } | null;
  status: InvitationStatus;
  emailStatus: "not_sent" | "sent" | "failed";
  emailId: string | null;
  emailSentAt: string | null;
  lastEmailAttemptAt: string | null;
  emailAttemptCount: number;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

export interface StaffInvitationQuery {
  search?: string;
  status?: InvitationStatus | "all";
  page?: number;
  limit?: number;
}

export interface StaffInvitationResponse {
  invitations: AdminStaffInvitation[];
  pagination: BackendPagination;
}

interface BackendInvitationList {
  invitations: AdminStaffInvitation[];
  pagination: BackendPagination;
}

interface InvitationMutationResult {
  invitation: AdminStaffInvitation;
  delivery?: {
    sent: boolean;
    emailId?: string | null;
    message?: string;
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const STAFF_ENDPOINT = "/admin/staff";
const ROLES_ENDPOINT = "/admin/roles";
const INVITATIONS_ENDPOINT = "/admin/staff/invitations";

function makeInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toFrontendStatus(
  status: BackendStaff["status"],
): AdminStaff["status"] {
  return status === "disabled" ? "inactive" : "active";
}

function toBackendStatus(status: AdminStaff["status"]): BackendStaff["status"] {
  return status === "inactive" ? "disabled" : "active";
}

function mapStaffRecord(record: BackendStaff): AdminStaff {
  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    phoneNumber: record.phoneNumber ?? "",
    initials: makeInitials(record.fullName),
    roleId: record.role?.id ?? "",
    status: toFrontendStatus(record.status),
    lastLoginAt: null,
    createdAt: record.createdAt,
  };
}

function mapRoleRecord(record: BackendRole): StaffRole {
  return {
    id: record.id,
    key: record.key,
    name: record.name,
    description: record.description,
    color: record.color,
    permissions: record.permissions,
    staffCount: record.staffCount,
    isSystem: record.isSystem,
  };
}

function buildQueryString(
  values: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

function getResponseData<T>(response: ApiEnvelope<T>): T {
  if (!response.success) {
    throw new Error(response.message || "The request was unsuccessful.");
  }

  return response.data;
}

async function fetchStaffList(
  query: Record<string, string | number | undefined>,
): Promise<BackendStaffList> {
  const response = await apiRequest<ApiEnvelope<BackendStaffList>>(
    `${STAFF_ENDPOINT}${buildQueryString(query)}`,
  );

  return getResponseData(response);
}

async function fetchStaffCount(
  status?: "active" | "disabled",
): Promise<number> {
  const response = await fetchStaffList({
    status,
    page: 1,
    limit: 1,
  });

  return response.pagination.total;
}

// -----------------------------------------------------------------------------
// Staff listing
// -----------------------------------------------------------------------------

export async function getAdminStaff(query: StaffQuery): Promise<StaffResponse> {
  const backendQuery: Record<string, string | number | undefined> = {
    search: query.search.trim() || undefined,
    roleId: query.roleId !== "all" ? query.roleId : undefined,
    status: query.status === "all" ? undefined : toBackendStatus(query.status),
    page: query.page,
    limit: query.limit,
  };

  const [staffResult, totalStaff, activeStaff, inactiveStaff, roles] =
    await Promise.all([
      fetchStaffList(backendQuery),
      fetchStaffCount(),
      fetchStaffCount("active"),
      fetchStaffCount("disabled"),
      getAdminRoles(),
    ]);

  const summary: StaffSummary = {
    totalStaff,
    totalRoles: roles.length,
    activeStaff,
    inactiveStaff,
  };

  return {
    staff: staffResult.staff.map(mapStaffRecord),
    summary,
    pagination: {
      page: staffResult.pagination.page,
      limit: staffResult.pagination.limit,
      total: staffResult.pagination.total,
      totalPages: Math.max(1, staffResult.pagination.totalPages),
    },
  };
}

// -----------------------------------------------------------------------------
// Staff details and role assignment
// -----------------------------------------------------------------------------

export async function getAdminStaffById(staffId: string): Promise<AdminStaff> {
  const response = await apiRequest<ApiEnvelope<{ staff: BackendStaff }>>(
    `${STAFF_ENDPOINT}/${encodeURIComponent(staffId)}`,
  );

  return mapStaffRecord(getResponseData(response).staff);
}

/**
 * Existing staff can have their assigned role changed.
 * Personal details are not editable through the current backend endpoint.
 */
export async function updateAdminStaff(
  staffId: string,
  input: CreateStaffInput,
): Promise<AdminStaff> {
  const response = await apiRequest<ApiEnvelope<{ staff: BackendStaff }>>(
    `${STAFF_ENDPOINT}/${encodeURIComponent(staffId)}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({
        roleId: input.roleId,
      }),
    },
  );

  return mapStaffRecord(getResponseData(response).staff);
}

// -----------------------------------------------------------------------------
// Staff status
// -----------------------------------------------------------------------------

export async function updateAdminStaffStatus(
  staffId: string,
  status: AdminStaff["status"],
): Promise<AdminStaff> {
  const response = await apiRequest<ApiEnvelope<{ staff: BackendStaff }>>(
    `${STAFF_ENDPOINT}/${encodeURIComponent(staffId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: toBackendStatus(status),
      }),
    },
  );

  return mapStaffRecord(getResponseData(response).staff);
}

// -----------------------------------------------------------------------------
// Staff invitations
// -----------------------------------------------------------------------------

/**
 * Sends an invitation email instead of creating a staff account directly.
 * The account is created only after the recipient accepts the invitation.
 */
export async function createAdminStaff(
  input: CreateStaffInput,
): Promise<AdminStaffInvitation> {
  const response = await apiRequest<ApiEnvelope<InvitationMutationResult>>(
    INVITATIONS_ENDPOINT,
    {
      method: "POST",
      body: JSON.stringify({
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phoneNumber: input.phoneNumber.trim() || undefined,
        roleId: input.roleId,
      }),
    },
  );

  return getResponseData(response).invitation;
}

export async function getAdminStaffInvitations(
  query: StaffInvitationQuery = {},
): Promise<StaffInvitationResponse> {
  const response = await apiRequest<ApiEnvelope<BackendInvitationList>>(
    `${INVITATIONS_ENDPOINT}${buildQueryString({
      search: query.search?.trim() || undefined,
      status: query.status === "all" ? undefined : query.status,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    })}`,
  );

  return getResponseData(response);
}

export async function resendAdminStaffInvitation(
  invitationId: string,
): Promise<AdminStaffInvitation> {
  const response = await apiRequest<ApiEnvelope<InvitationMutationResult>>(
    `${INVITATIONS_ENDPOINT}/${encodeURIComponent(invitationId)}/resend`,
    {
      method: "POST",
    },
  );

  return getResponseData(response).invitation;
}

export async function revokeAdminStaffInvitation(
  invitationId: string,
): Promise<{
  id: string;
  email: string;
  status: InvitationStatus;
  revokedAt: string;
}> {
  const response = await apiRequest<
    ApiEnvelope<{
      id: string;
      email: string;
      status: InvitationStatus;
      revokedAt: string;
    }>
  >(`${INVITATIONS_ENDPOINT}/${encodeURIComponent(invitationId)}/revoke`, {
    method: "POST",
  });

  return getResponseData(response);
}

// -----------------------------------------------------------------------------
// Role management
// -----------------------------------------------------------------------------

export async function getAdminRoles(): Promise<StaffRole[]> {
  const response =
    await apiRequest<ApiEnvelope<BackendRole[] | { roles: BackendRole[] }>>(
      ROLES_ENDPOINT,
    );

  const data = getResponseData(response);
  const records = Array.isArray(data) ? data : data.roles;

  return records.map(mapRoleRecord);
}

export async function getAdminRoleById(roleId: string): Promise<StaffRole> {
  const response = await apiRequest<
    ApiEnvelope<{ role: BackendRole } | BackendRole>
  >(`${ROLES_ENDPOINT}/${encodeURIComponent(roleId)}`);

  const data = getResponseData(response);
  const record = "role" in data ? data.role : data;

  return mapRoleRecord(record);
}

export async function createAdminRole(
  input: CreateRoleInput,
): Promise<StaffRole> {
  const response = await apiRequest<
    ApiEnvelope<{ role: BackendRole } | BackendRole>
  >(ROLES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      name: input.name.trim(),
      description: input.description.trim(),
      color: input.color,
      permissions: input.permissions,
    }),
  });

  const data = getResponseData(response);
  const record = "role" in data ? data.role : data;

  return mapRoleRecord(record);
}

export async function updateAdminRole(
  roleId: string,
  input: CreateRoleInput,
): Promise<StaffRole> {
  const response = await apiRequest<
    ApiEnvelope<{ role: BackendRole } | BackendRole>
  >(`${ROLES_ENDPOINT}/${encodeURIComponent(roleId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: input.name.trim(),
      description: input.description.trim(),
      color: input.color,
      permissions: input.permissions,
    }),
  });

  const data = getResponseData(response);
  const record = "role" in data ? data.role : data;

  return mapRoleRecord(record);
}

export async function deleteAdminRole(
  roleId: string,
): Promise<{ id: string; message: string }> {
  const response = await apiRequest<
    ApiEnvelope<{ id: string; message: string }>
  >(`${ROLES_ENDPOINT}/${encodeURIComponent(roleId)}`, {
    method: "DELETE",
  });

  return getResponseData(response);
}
