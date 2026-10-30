import type { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";

export function requireTrustedOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const origin = req.get("origin");
  const expectedOrigin = process.env.CLIENT_URL;

  if (!expectedOrigin || !origin || origin !== expectedOrigin) {
    res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
    return;
  }

  next();
}

export function requireCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const cookieToken = req.cookies?.["ogim_csrf"];
  const headerToken = req.get("x-csrf-token");

  if (typeof cookieToken !== "string" || typeof headerToken !== "string") {
    res.status(403).json({
      success: false,
      message: "CSRF validation failed.",
    });
    return;
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

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
