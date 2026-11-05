import { demoRevenueReports } from "../data/revenue.mock";
import type {
  RevenueDateRange,
  RevenuePeriod,
  RevenueReport,
} from "../types/revenue.types";

const USE_DEMO_DATA = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

function getCustomReport(range: RevenueDateRange): RevenueReport {
  const report = demoRevenueReports.custom;

  if (!range.startDate || !range.endDate) {
    return report;
  }

  // Custom range needs a backend aggregation to return accurate data.
  // Keep the response empty rather than presenting unrelated figures.
  return {
    ...report,
    chart: [],
    categories: [],
    topProducts: [],
    recentOrders: [],
  };
}

export async function getAdminRevenueReport(
  range: RevenueDateRange,
): Promise<RevenueReport> {
  if (!USE_DEMO_DATA) {
    throw new Error("Revenue reports API has not been connected yet.");
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  if (range.period === "custom") {
    return getCustomReport(range);
  }

  return structuredClone(demoRevenueReports[range.period as RevenuePeriod]);
}
