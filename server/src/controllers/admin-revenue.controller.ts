import type { Request, Response, NextFunction } from "express";

import {
  getAdminRevenueReport,
  type AdminRevenueQuery,
  type RevenuePeriod,
} from "../services/admin-revenue.service.js";

const REVENUE_PERIODS: RevenuePeriod[] = [
  "today",
  "this-week",
  "this-month",
  "last-month",
  "this-year",
  "custom",
];

function getQueryString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export async function getAdminRevenueReportController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const period = getQueryString(req.query.period);
    const startDate = getQueryString(req.query.startDate);
    const endDate = getQueryString(req.query.endDate);

    // Validate report period.
    if (!period || !REVENUE_PERIODS.includes(period as RevenuePeriod)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid report period. Choose today, this-week, this-month, last-month, this-year, or custom.",
      });
      return;
    }

    const revenuePeriod = period as RevenuePeriod;

    // Custom reports require both dates.
    if (revenuePeriod === "custom") {
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message:
            "Both startDate and endDate are required for a custom report.",
        });
        return;
      }

      if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
        res.status(400).json({
          success: false,
          message: "Dates must use the YYYY-MM-DD format and be valid dates.",
        });
        return;
      }

      if (startDate > endDate) {
        res.status(400).json({
          success: false,
          message: "startDate cannot be later than endDate.",
        });
        return;
      }
    }

    const query: AdminRevenueQuery = {
      period: revenuePeriod,
      ...(revenuePeriod === "custom" && {
        startDate,
        endDate,
      }),
    };

    const report = await getAdminRevenueReport(query);

    res.status(200).json({
      success: true,
      message: "Revenue report retrieved successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}
