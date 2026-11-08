import type { Request, Response } from "express";

import {
  getAdminDeliverySettings,
  updateAdminDeliverySettings,
  AdminDeliverySettingsServiceError,
} from "../services/admin-delivery-settings.service.js";

import type { AdminDeliverySettingsInput } from "../services/admin-delivery-settings.service.js";

/**
 * GET /api/v1/admin/delivery/settings
 *
 * Retrieves the store's delivery configuration.
 * Creates default settings automatically if none exist.
 */
export async function getAdminDeliverySettingsController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const settings = await getAdminDeliverySettings();

    res.status(200).json({
      success: true,
      message: "Delivery settings retrieved successfully.",
      data: {
        settings,
      },
    });
  } catch (error) {
    const statusCode =
      error instanceof AdminDeliverySettingsServiceError
        ? error.statusCode
        : 500;

    res.status(statusCode).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve delivery settings.",
    });
  }
}

/**
 * PATCH /api/v1/admin/delivery/settings
 *
 * Updates the store's delivery configuration.
 */
export async function updateAdminDeliverySettingsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      res.status(400).json({
        success: false,
        message: "A valid delivery settings object is required.",
      });
      return;
    }

    const input = req.body as AdminDeliverySettingsInput;

    const settings = await updateAdminDeliverySettings(input);

    res.status(200).json({
      success: true,
      message: "Delivery settings updated successfully.",
      data: {
        settings,
      },
    });
  } catch (error) {
    const statusCode =
      error instanceof AdminDeliverySettingsServiceError
        ? error.statusCode
        : 500;

    res.status(statusCode).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update delivery settings.",
    });
  }
}
