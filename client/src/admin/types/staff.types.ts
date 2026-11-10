export type StaffStatus = "active" | "inactive";

export type BackendStaffStatus = "active" | "disabled";

export type StaffRoleKey =
  | "administrator"
  | "operations"
  | "dispatch"
  | "inventory"
  | "sales"
  | "custom";

export type StaffPermission =
  | "dashboard.view"
  | "orders.view"
  | "orders.manage"
  | "products.view"
  | "products.manage"
  | "inventory.view"
  | "inventory.manage"
  | "customers.view"
  | "customers.manage"
  | "dispatch.view"
  | "dispatch.manage"
  | "delivery.manage"
  | "tracking.manage"
  | "reports.view"
  | "staff.view"
  | "staff.manage"
  | "settings.manage";

export type StaffRoleColor = "orange" | "blue" | "purple" | "green" | "yellow";

export interface StaffRole {
  id: string;
  key: StaffRoleKey;
  name: string;
  description: string;
  color: StaffRoleColor;
  permissions: StaffPermission[];
  staffCount: number;
  isSystem: boolean;
}

export interface AdminStaff {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  initials: string;
  roleId: string;
  status: StaffStatus;

  // The current backend does not return login history.
  lastLoginAt: string | null;

  createdAt: string;
}

export interface StaffSummary {
  totalStaff: number;
  totalRoles: number;
  activeStaff: number;
  inactiveStaff: number;
  growth?: number;
}

export interface StaffPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface StaffQuery {
  search: string;
  roleId: string;
  status: StaffStatus | "all";
  page: number;
  limit: number;
}

export interface StaffResponse {
  staff: AdminStaff[];
  summary: StaffSummary;
  pagination: StaffPagination;
}

// -----------------------------------------------------------------------------
// Staff invitation types
// -----------------------------------------------------------------------------

export type StaffInvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "revoked"
  | "failed";

export type InvitationEmailStatus = "not_sent" | "sent" | "failed";

export interface InvitationRole {
  id: string;
  name: string;
  key: StaffRoleKey;
  color: StaffRoleColor;
}

export interface AdminStaffInvitation {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;

  role: InvitationRole | null;

  status: StaffInvitationStatus;
  emailStatus: InvitationEmailStatus;

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
  status?: StaffInvitationStatus | "all";
  page?: number;
  limit?: number;
}

export interface StaffInvitationResponse {
  invitations: AdminStaffInvitation[];
  pagination: StaffPagination;
}

export interface CreateStaffInvitationInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  roleId: string;
}

// -----------------------------------------------------------------------------
// Staff and role inputs
// -----------------------------------------------------------------------------

/**
 * Used by the existing StaffModal.
 *
 * For new staff, the status field is not sent to the backend because
 * an invited person becomes active after accepting their invitation.
 *
 * For existing staff, the backend currently supports role changes only.
 */
export interface CreateStaffInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  status?: StaffStatus;
}

export interface UpdateStaffRoleInput {
  roleId: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  color: StaffRoleColor;
  permissions: StaffPermission[];
}

// -----------------------------------------------------------------------------
// Permission groups
// -----------------------------------------------------------------------------

export const STAFF_PERMISSION_GROUPS: {
  label: string;
  permissions: {
    key: StaffPermission;
    label: string;
  }[];
}[] = [
  {
    label: "Dashboard",
    permissions: [
      {
        key: "dashboard.view",
        label: "View dashboard",
      },
    ],
  },
  {
    label: "Orders",
    permissions: [
      {
        key: "orders.view",
        label: "View orders",
      },
      {
        key: "orders.manage",
        label: "Manage orders",
      },
    ],
  },
  {
    label: "Products",
    permissions: [
      {
        key: "products.view",
        label: "View products",
      },
      {
        key: "products.manage",
        label: "Manage products",
      },
    ],
  },
  {
    label: "Inventory",
    permissions: [
      {
        key: "inventory.view",
        label: "View inventory",
      },
      {
        key: "inventory.manage",
        label: "Manage inventory",
      },
    ],
  },
  {
    label: "Customers",
    permissions: [
      {
        key: "customers.view",
        label: "View customers",
      },
      {
        key: "customers.manage",
        label: "Manage customers",
      },
    ],
  },
  {
    label: "Fulfilment",
    permissions: [
      {
        key: "dispatch.view",
        label: "View dispatches",
      },
      {
        key: "dispatch.manage",
        label: "Manage dispatches",
      },
      {
        key: "delivery.manage",
        label: "Manage delivery fees",
      },
      {
        key: "tracking.manage",
        label: "Manage tracking",
      },
    ],
  },
  {
    label: "Reports",
    permissions: [
      {
        key: "reports.view",
        label: "View reports",
      },
    ],
  },
  {
    label: "Administration",
    permissions: [
      {
        key: "staff.view",
        label: "View staff",
      },
      {
        key: "staff.manage",
        label: "Manage staff and roles",
      },
      {
        key: "settings.manage",
        label: "Manage store settings",
      },
    ],
  },
];
