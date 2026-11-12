import { apiRequest } from "../../lib/api";

import type { RevenueDateRange, RevenueReport } from "../types/revenue.types";

// ============================================
// API RESPONSE TYPES
// ============================================

interface AdminRevenueReportResponse {
  success: boolean;
  message: string;
  data: RevenueReport;
}

// ============================================
// GET ADMIN REVENUE REPORT
// ============================================

export async function getAdminRevenueReport(
  range: RevenueDateRange,
): Promise<RevenueReport> {
  const params = new URLSearchParams();

  params.set("period", range.period);

  if (range.period === "custom") {
    if (!range.startDate || !range.endDate) {
      throw new Error(
        "Both start and end dates are required for a custom revenue report.",
      );
    }

    params.set("startDate", range.startDate);
    params.set("endDate", range.endDate);
  }

  const response = await apiRequest<AdminRevenueReportResponse>(
    `/admin/revenue?${params.toString()}`,
  );

  if (!response.success || !response.data) {
    throw new Error(
      response.message || "Unable to retrieve the revenue report.",
    );
  }

  return response.data;
}
