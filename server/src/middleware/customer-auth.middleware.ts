import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";

export interface AuthenticatedRequest extends Request {
  authUser?: {
    userId: string;
    role: "customer" | "admin";
  };
}

export async function requireCustomerAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
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

    const payload = decoded as JwtPayload;
    const userId = payload.sub as string;
    const tokenRole = payload.role as "customer" | "admin";

    if (!mongoose.isValidObjectId(userId)) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
      return;
    }

    // Verify that the account still exists and is active.
    const user = await User.findOne({
      _id: userId,
      status: "active",
      deletedAt: null,
    })
      .select("_id role")
      .lean();

    if (!user || user.role !== tokenRole) {
      res.status(401).json({
        success: false,
        message: "Your account is unavailable. Please sign in again.",
      });
      return;
    }

    req.authUser = {
      userId,
      role: tokenRole,
    };

    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
      return;
    }

    console.error("Authentication middleware failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify your authentication.",
    });
  }
}
