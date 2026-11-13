import type { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";

// ============================================
// TRUSTED ORIGIN VALIDATION
// ============================================

const expectedOrigin = process.env.CLIENT_URL?.replace(/\/$/, "");

export function requireTrustedOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const origin = req.get("origin");

  if (!expectedOrigin || !origin || origin !== expectedOrigin) {
    res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
    return;
  }

  next();
}

// ============================================
// CSRF TOKEN VALIDATION
// ============================================

export function requireCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const cookieToken = req.cookies?.["ogim_csrf"];
  const headerToken = req.get("x-csrf-token");

  if (
    typeof cookieToken !== "string" ||
    typeof headerToken !== "string" ||
    !/^[a-f0-9]{64}$/i.test(cookieToken) ||
    !/^[a-f0-9]{64}$/i.test(headerToken)
  ) {
    res.status(403).json({
      success: false,
      message: "CSRF validation failed.",
    });
    return;
  }

  const cookieBuffer = Buffer.from(cookieToken, "hex");
  const headerBuffer = Buffer.from(headerToken, "hex");

  if (
    cookieBuffer.length !== headerBuffer.length ||
    !timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    res.status(403).json({
      success: false,
      message: "CSRF validation failed.",
    });
    return;
  }

  next();
}
