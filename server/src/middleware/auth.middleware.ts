import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";

export interface AdminAuthenticatedRequest extends Request {
  authAdmin?: {
    userId: string;
    role: "admin";
  };
}

export async function requireAdmin(
  req: AdminAuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.["ogim_access"];
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    console.error("JWT_SECRET is missing or incorrectly configured.");

    res.status(500).json({
      success: false,
      message: "Authentication is not configured correctly.",
    });
    return;
  }

  if (typeof token !== "string") {
    res.status(401).json({
      success: false,
      message: "Administrator authentication required.",
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
      (decoded as JwtPayload).role !== "admin" ||
      typeof (decoded as JwtPayload).sub !== "string"
    ) {
      res.status(403).json({
        success: false,
        message: "Administrator access required.",
      });
      return;
    }

    const userId = (decoded as JwtPayload).sub as string;

    if (!mongoose.isValidObjectId(userId)) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
      return;
    }

    const admin = await User.findOne({
      _id: userId,
      role: "admin",
      status: "active",
      deletedAt: null,
    })
      .select("_id role")
      .lean();

    if (!admin) {
      res.status(403).json({
        success: false,
        message: "Administrator account is unavailable.",
      });
      return;
    }

    req.authAdmin = {
      userId,
      role: "admin",
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

    console.error("Admin authentication middleware failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify administrator authentication.",
    });
  }
}

// Keep the existing import name used by Inventory routes.
