import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";

import {
  getCurrentUser,
  loginCustomer,
  loginWithGoogle,
  registerCustomer,
  revokeRefreshToken,
  rotateRefreshToken,
  requestPasswordReset,
  resetCustomerPassword,
} from "../services/auth.service.js";

import type { AuthenticatedRequest } from "../middleware/customer-auth.middleware.js";

import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.validation.js";

const isProduction = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/api/v1/auth",
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

function setSessionCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe = false,
): void {
  const refreshDays = rememberMe ? 30 : 1;

  res.cookie("ogim_access", accessToken, {
    ...accessCookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("ogim_refresh", refreshToken, {
    ...refreshCookieOptions,
    maxAge: refreshDays * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookies(res: Response): void {
  res.clearCookie("ogim_access", accessCookieOptions);
  res.clearCookie("ogim_refresh", refreshCookieOptions);
}

function userAgent(req: Request): string | undefined {
  return req.get("user-agent");
}

function validationError(res: Response, error: unknown): void {
  if (typeof error === "object" && error !== null && "issues" in error) {
    res.status(400).json({
      success: false,
      message: "Please check the submitted details.",
      errors: (error as { issues: unknown }).issues,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
  });
}

export function getCsrfToken(_req: Request, res: Response): void {
  const token = randomBytes(32).toString("hex");

  res.cookie("ogim_csrf", token, {
    ...csrfCookieOptions,
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    csrfToken: token,
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    validationError(res, parsed.error);
    return;
  }

  try {
    const session = await registerCustomer(parsed.data, userAgent(req));

    setSessionCookies(
      res,
      session.accessToken,
      session.refreshToken,
      session.rememberMe,
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: session.user,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "An account with those details may already exist.",
      });
      return;
    }

    console.error("Registration failed:", error);

    res.status(400).json({
      success: false,
      message: "Unable to create the account with those details.",
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Enter a valid email address and password.",
    });
    return;
  }

  try {
    const session = await loginCustomer(
      parsed.data,
      userAgent(req),
      parsed.data.rememberMe,
    );

    setSessionCookies(
      res,
      session.accessToken,
      session.refreshToken,
      session.rememberMe,
    );

    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      user: session.user,
    });
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.["ogim_refresh"];

  if (typeof refreshToken !== "string") {
    clearSessionCookies(res);

    res.status(401).json({
      success: false,
      message: "Please sign in again.",
    });
    return;
  }

  try {
    const session = await rotateRefreshToken(refreshToken, userAgent(req));

    setSessionCookies(
      res,
      session.accessToken,
      session.refreshToken,
      session.rememberMe,
    );

    res.status(200).json({
      success: true,
      user: session.user,
    });
  } catch {
    clearSessionCookies(res);

    res.status(401).json({
      success: false,
      message: "Your session has expired. Please sign in again.",
    });
  }
}

export async function me(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  try {
    const user = await getCurrentUser(req.authUser.userId);

    res.status(200).json({
      success: true,
      user,
    });
  } catch {
    clearSessionCookies(res);

    res.status(401).json({
      success: false,
      message: "Please sign in again.",
    });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    await revokeRefreshToken(req.cookies?.["ogim_refresh"]);
  } catch (error) {
    console.error("Session revocation failed:", error);
  }

  clearSessionCookies(res);
  res.clearCookie("ogim_csrf", csrfCookieOptions);

  res.status(200).json({
    success: true,
    message: "Signed out successfully.",
  });
}

export async function googleLogin(req: Request, res: Response): Promise<void> {
  const parsed = googleLoginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "A valid Google credential is required.",
      errors: parsed.error.issues,
    });
    return;
  }

  try {
    const result = await loginWithGoogle(
      parsed.data.credential,
      userAgent(req),
      parsed.data.acceptedTerms,
      parsed.data.phoneNumber,
    );

    if (result.onboardingRequired) {
      res.status(200).json({
        success: true,
        onboardingRequired: true,
        user: {
          fullName: result.fullName,
          email: result.email,
        },
      });
      return;
    }

    setSessionCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.rememberMe,
    );

    res.status(200).json({
      success: true,
      onboardingRequired: false,
      user: result.user,
    });
  } catch (error) {
    const message =
      error instanceof Error &&
      error.message.startsWith("An account with this email")
        ? error.message
        : "Unable to sign in with Google.";

    res.status(401).json({
      success: false,
      message,
    });
  }
}

/**
 * Request a password-reset email.
 *
 * Always returns the same success message for valid email input,
 * regardless of whether an eligible account exists.
 */
export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    validationError(res, parsed.error);
    return;
  }

  try {
    await requestPasswordReset(parsed.data);

    res.status(200).json({
      success: true,
      message:
        "If an account exists with that email address, you will receive a password reset link shortly.",
    });
  } catch (error) {
    console.error("Forgot password request failed:", error);

    res.status(500).json({
      success: false,
      message:
        "Unable to process your request right now. Please try again later.",
    });
  }
}

/**
 * Submit a new password using a valid reset token.
 */
export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    validationError(res, parsed.error);
    return;
  }

  try {
    await resetCustomerPassword(parsed.data);

    // Remove any browser session cookies as an additional precaution.
    clearSessionCookies(res);

    res.status(200).json({
      success: true,
      message:
        "Your password has been changed successfully. Please sign in with your new password.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "This password reset link is invalid or has expired.") {
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    console.error("Password reset failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to reset your password right now. Please try again.",
    });
  }
}
