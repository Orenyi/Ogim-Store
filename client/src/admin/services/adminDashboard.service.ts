import { apiRequest } from "../../lib/api";

import type { AdminDashboardResponse } from "../types/dashboard.types";

// ============================================
// API RESPONSE TYPE
// ============================================

interface AdminDashboardApiResponse {
  success: boolean;
  message: string;
  data: AdminDashboardResponse;
}

// ============================================
// GET ADMIN DASHBOARD SUMMARY
// ============================================

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await apiRequest<AdminDashboardApiResponse>(
    "/admin/dashboard/summary",
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to retrieve dashboard data.");
  }

  return response.data;
}
