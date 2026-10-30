import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  authUser?: {
    userId: string;
    role: "customer" | "admin";
  };
}

export function requireCustomerAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.["ogim_access"];
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    res.status(500).json({
      success: false,
      message: "Authentication is not configured correctly.",
    });
    return;
  }

  if (typeof token !== "string") {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: "ogim-store-api",
      audience: "ogim-store-client",
    });

    if (
      typeof decoded === "string" ||
      (decoded as JwtPayload).type !== "access" ||
      typeof (decoded as JwtPayload).sub !== "string" ||
      !["customer", "admin"].includes(String((decoded as JwtPayload).role))
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
      return;
    }

    req.authUser = {
      userId: (decoded as JwtPayload).sub as string,
      role: (decoded as JwtPayload).role as "customer" | "admin",
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}
