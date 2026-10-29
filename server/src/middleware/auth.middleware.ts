import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthTokenPayload extends JwtPayload {
  role?: string;
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured.");

    res.status(500).json({
      success: false,
      message: "Authentication is not configured correctly.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      (decoded as AuthTokenPayload).role !== "admin"
    ) {
      res.status(403).json({
        success: false,
        message: "Administrator access required.",
      });
      return;
    }

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}
