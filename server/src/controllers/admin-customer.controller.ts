import type { Request, Response } from "express";

import {
  CustomerServiceError,
  getCustomerById,
  getCustomerOrders,
  getCustomers,
  updateCustomerStatus,
} from "../services/admin-customer.service.js";

function sendControllerError(res: Response, error: unknown): void {
  if (error instanceof CustomerServiceError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.error("Admin customer controller error:", error);

  res.status(500).json({
    success: false,
    message: "An error occurred while processing the customer request.",
  });
}

function getQueryString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getQueryNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getRouteId(req: Request): string | null {
  const id = req.params.id;

  return typeof id === "string" ? id : null;
}

/**
 * GET /api/v1/admin/customers
 */
export async function getAdminCustomers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const rawStatus = getQueryString(req.query.status, "all");
    const rawHasOrders = getQueryString(req.query.hasOrders, "all");

    const status =
      rawStatus === "active" || rawStatus === "inactive" ? rawStatus : "all";

    const hasOrders =
      rawHasOrders === "yes" || rawHasOrders === "no" ? rawHasOrders : "all";

    const result = await getCustomers({
      search: getQueryString(req.query.search),
      status,
      hasOrders,
      page: getQueryNumber(req.query.page, 1),
      limit: getQueryNumber(req.query.limit, 10),
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
}

/**
 * GET /api/v1/admin/customers/:id
 */
export async function getAdminCustomerById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const customerId = getRouteId(req);

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "A valid customer ID is required.",
      });
      return;
    }

    const customer = await getCustomerById(customerId);

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
}

/**
 * GET /api/v1/admin/customers/:id/orders
 */
export async function getAdminCustomerOrders(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const customerId = getRouteId(req);

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "A valid customer ID is required.",
      });
      return;
    }

    const result = await getCustomerOrders(
      customerId,
      getQueryNumber(req.query.page, 1),
      getQueryNumber(req.query.limit, 10),
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
}

/**
 * PATCH /api/v1/admin/customers/:id/status
 */
export async function updateAdminCustomerStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const customerId = getRouteId(req);

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "A valid customer ID is required.",
      });
      return;
    }

    const status = req.body?.status;

    if (status !== "active" && status !== "inactive") {
      res.status(400).json({
        success: false,
        message: "Status must be either active or inactive.",
      });
      return;
    }

    const customer = await updateCustomerStatus(customerId, {
      status,
    });

    res.status(200).json({
      success: true,
      message: `Customer account ${status === "active" ? "activated" : "disabled"} successfully.`,
      data: customer,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
}
