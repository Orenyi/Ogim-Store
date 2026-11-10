import type { Request, Response } from "express";

import {
  acceptStaffInvitation,
  validateStaffInvitation,
  AdminInvitationAcceptanceError,
} from "../services/adminInvitationAcceptance.service.js";

function getErrorStatus(error: unknown): number {
  if (error instanceof AdminInvitationAcceptanceError) {
    return error.statusCode;
  }

  return 500;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AdminInvitationAcceptanceError) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Validate a staff invitation before displaying the acceptance form.
 *
 * POST /api/v1/admin/invitations/validate
 *
 * Request body:
 * {
 *   "token": "invitation-token"
 * }
 */
export async function validateStaffInvitationController(
  req: Request,
  res: Response,
): Promise<void> {
  const { token } = req.body ?? {};

  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    res.status(400).json({
      success: false,
      message: "A valid invitation token is required.",
    });
    return;
  }

  try {
    const invitation = await validateStaffInvitation(token);

    res.status(200).json({
      success: true,
      message: "Invitation is valid.",
      data: invitation,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);

    if (statusCode === 500) {
      console.error("Invitation validation failed:", error);
    }

    res.status(statusCode).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
}

/**
 * Accept a staff invitation and create the administrator account.
 *
 * POST /api/v1/admin/invitations/accept
 *
 * Request body:
 * {
 *   "token": "invitation-token",
 *   "password": "secure-password",
 *   "acceptedTerms": true
 * }
 */
export async function acceptStaffInvitationController(
  req: Request,
  res: Response,
): Promise<void> {
  const { token, password, acceptedTerms } = req.body ?? {};

  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    res.status(400).json({
      success: false,
      message: "A valid invitation token is required.",
    });
    return;
  }

  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({
      success: false,
      message: "Your password must contain at least 8 characters.",
    });
    return;
  }

  if (password.length > 128) {
    res.status(400).json({
      success: false,
      message: "Your password cannot exceed 128 characters.",
    });
    return;
  }

  if (acceptedTerms !== true) {
    res.status(400).json({
      success: false,
      message: "You must accept the terms and conditions.",
    });
    return;
  }

  try {
    const result = await acceptStaffInvitation({
      token,
      password,
      acceptedTerms,
    });

    res.status(201).json({
      success: true,
      message:
        "Your administrator account has been created successfully. You can now sign in.",
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);

    if (statusCode === 500) {
      console.error("Invitation acceptance failed:", error);
    }

    res.status(statusCode).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
}
