import type { Request, Response, NextFunction } from "express";

import { getAdminDashboardSummary } from "../services/admin-dashboard.service.js";

// ============================================
// GET ADMIN DASHBOARD SUMMARY
// ============================================

export async function getAdminDashboardSummaryController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dashboard = await getAdminDashboardSummary();

    res.status(200).json({
      success: true,
      message: "Dashboard summary retrieved successfully.",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}
