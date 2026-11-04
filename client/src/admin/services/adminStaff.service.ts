import { demoRoles, demoStaff } from "../data/staff.mock";

import type {
  AdminStaff,
  CreateRoleInput,
  CreateStaffInput,
  StaffQuery,
  StaffResponse,
  StaffRole,
  StaffSummary,
} from "../types/staff.types";

const USE_DEMO_DATA = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

let staffRecords = structuredClone(demoStaff);
let roleRecords = structuredClone(demoRoles);

function ensureDemoMode() {
  if (!USE_DEMO_DATA) {
    throw new Error("Admin staff API has not been connected yet.");
  }
}

function makeInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getSummary(): StaffSummary {
  return {
    totalStaff: staffRecords.length,
    totalRoles: roleRecords.length,
    activeStaff: staffRecords.filter((item) => item.status === "active").length,
    inactiveStaff: staffRecords.filter((item) => item.status === "inactive")
      .length,
    growth: 9.1,
  };
}

function syncRoleCounts() {
  roleRecords = roleRecords.map((role) => ({
    ...role,
    staffCount: staffRecords.filter((staff) => staff.roleId === role.id).length,
  }));
}

export async function getAdminStaff(query: StaffQuery): Promise<StaffResponse> {
  ensureDemoMode();
  await new Promise((resolve) => setTimeout(resolve, 250));

  let filtered = [...staffRecords];

  if (query.search.trim()) {
    const search = query.search.trim().toLowerCase();

    filtered = filtered.filter((staff) =>
      [
        staff.fullName,
        staff.email,
        staff.phoneNumber,
        roleRecords.find((role) => role.id === staff.roleId)?.name ?? "",
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }

  if (query.roleId !== "all") {
    filtered = filtered.filter((staff) => staff.roleId === query.roleId);
  }

  if (query.status !== "all") {
    filtered = filtered.filter((staff) => staff.status === query.status);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (page - 1) * query.limit;

  return {
    staff: structuredClone(
      filtered.slice(startIndex, startIndex + query.limit),
    ),
    summary: getSummary(),
    pagination: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export async function getAdminRoles(): Promise<StaffRole[]> {
  ensureDemoMode();
  await new Promise((resolve) => setTimeout(resolve, 150));
  syncRoleCounts();
  return structuredClone(roleRecords);
}

export async function createAdminStaff(
  input: CreateStaffInput,
): Promise<AdminStaff> {
  ensureDemoMode();
  await new Promise((resolve) => setTimeout(resolve, 250));

  const email = input.email.trim().toLowerCase();

  if (staffRecords.some((staff) => staff.email.toLowerCase() === email)) {
    throw new Error("A staff account with this email already exists.");
  }

  if (!roleRecords.some((role) => role.id === input.roleId)) {
    throw new Error("Please select a valid staff role.");
  }

  const staff: AdminStaff = {
    id: `staff-${Date.now()}`,
    fullName: input.fullName.trim(),
    email,
    phoneNumber: input.phoneNumber.trim(),
    initials: makeInitials(input.fullName),
    roleId: input.roleId,
    status: input.status,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  };

  staffRecords = [staff, ...staffRecords];
  syncRoleCounts();

  return structuredClone(staff);
}

export async function updateAdminStaff(
  staffId: string,
  input: CreateStaffInput,
): Promise<AdminStaff> {
  ensureDemoMode();
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = staffRecords.findIndex((staff) => staff.id === staffId);

  if (index === -1) throw new Error("Staff member could not be found.");

  const email = input.email.trim().toLowerCase();

  if (
    staffRecords.some(
      (staff) => staff.id !== staffId && staff.email.toLowerCase() === email,
    )
  ) {
    throw new Error("Another staff account already uses this email.");
  }

  const updated: AdminStaff = {
    ...staffRecords[index],
    fullName: input.fullName.trim(),
    email,
    phoneNumber: input.phoneNumber.trim(),
    initials: makeInitials(input.fullName),
    roleId: input.roleId,
    status: input.status,
  };

  staffRecords[index] = updated;
  syncRoleCounts();

  return structuredClone(updated);
}

export async function updateAdminStaffStatus(
  staffId: string,
  status: AdminStaff["status"],
): Promise<AdminStaff> {
  ensureDemoMode();

  const index = staffRecords.findIndex((staff) => staff.id === staffId);

  if (index === -1) throw new Error("Staff member could not be found.");

  staffRecords[index] = {
    ...staffRecords[index],
    status,
  };

  return structuredClone(staffRecords[index]);
}

export async function createAdminRole(
  input: CreateRoleInput,
): Promise<StaffRole> {
  ensureDemoMode();

  const name = input.name.trim();

  if (
    roleRecords.some((role) => role.name.toLowerCase() === name.toLowerCase())
  ) {
    throw new Error("A role with this name already exists.");
  }

  const role: StaffRole = {
    id: `role-${Date.now()}`,
    key: "custom",
    name,
    description: input.description.trim(),
    color: input.color,
    permissions: [...input.permissions],
    staffCount: 0,
    isSystem: false,
  };

  roleRecords = [...roleRecords, role];

  return structuredClone(role);
}

export async function updateAdminRole(
  roleId: string,
  input: CreateRoleInput,
): Promise<StaffRole> {
  ensureDemoMode();

  const index = roleRecords.findIndex((role) => role.id === roleId);

  if (index === -1) throw new Error("Role could not be found.");

  if (
    roleRecords.some(
      (role) =>
        role.id !== roleId &&
        role.name.toLowerCase() === input.name.trim().toLowerCase(),
    )
  ) {
    throw new Error("Another role already uses this name.");
  }

  const updated: StaffRole = {
    ...roleRecords[index],
    name: input.name.trim(),
    description: input.description.trim(),
    color: input.color,
    permissions: [...input.permissions],
  };

  roleRecords[index] = updated;

  return structuredClone(updated);
}
