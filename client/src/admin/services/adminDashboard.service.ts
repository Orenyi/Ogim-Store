import { apiRequest } from "../../lib/api";

import { dashboardMock } from "../data/dashboard.mock";

import type { AdminDashboardResponse } from "../types/dashboard.types";

const USE_DASHBOARD_MOCKS = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  if (USE_DASHBOARD_MOCKS) {
    // Simulate an asynchronous API response during UI development.
    return Promise.resolve(dashboardMock);
  }

  return apiRequest<AdminDashboardResponse>("/admin/dashboard/summary");
}
