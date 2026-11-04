export type StaffStatus = "active" | "inactive";

export type StaffRoleKey =
  | "administrator"
  | "operations"
  | "dispatch"
  | "inventory"
  | "sales";

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

export interface StaffRole {
  id: string;
  key: StaffRoleKey | "custom";
  name: string;
  description: string;
  color: "orange" | "blue" | "purple" | "green" | "yellow";
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  status: StaffStatus;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  color: StaffRole["color"];
  permissions: StaffPermission[];
}

export const STAFF_PERMISSION_GROUPS: {
  label: string;
  permissions: {
    key: StaffPermission;
    label: string;
  }[];
}[] = [
  {
    label: "Dashboard",
    permissions: [{ key: "dashboard.view", label: "View dashboard" }],
  },
  {
    label: "Orders",
    permissions: [
      { key: "orders.view", label: "View orders" },
      { key: "orders.manage", label: "Manage orders" },
    ],
  },
  {
    label: "Products",
    permissions: [
      { key: "products.view", label: "View products" },
      { key: "products.manage", label: "Manage products" },
    ],
  },
  {
    label: "Inventory",
    permissions: [
      { key: "inventory.view", label: "View inventory" },
      { key: "inventory.manage", label: "Manage inventory" },
    ],
  },
  {
    label: "Customers",
    permissions: [
      { key: "customers.view", label: "View customers" },
      { key: "customers.manage", label: "Manage customers" },
    ],
  },
  {
    label: "Fulfilment",
    permissions: [
      { key: "dispatch.view", label: "View dispatches" },
      { key: "dispatch.manage", label: "Manage dispatches" },
      { key: "delivery.manage", label: "Manage delivery fees" },
      { key: "tracking.manage", label: "Manage tracking" },
    ],
  },
  {
    label: "Reports",
    permissions: [{ key: "reports.view", label: "View reports" }],
  },
  {
    label: "Administration",
    permissions: [
      { key: "staff.view", label: "View staff" },
      { key: "staff.manage", label: "Manage staff and roles" },
      { key: "settings.manage", label: "Manage store settings" },
    ],
  },
];
