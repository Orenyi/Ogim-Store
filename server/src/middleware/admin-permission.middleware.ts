import type { NextFunction, Response } from "express";

import mongoose from "mongoose";

import User from "../models/User.js";
import AdminRole, { ADMIN_PERMISSIONS } from "../models/AdminRole.js";

import type { AdminAuthenticatedRequest } from "./auth.middleware.js";

// ============================================
// TYPES
// ============================================

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

// ============================================
// PERMISSION MIDDLEWARE
// ============================================

export function requireAdminPermission(permission: AdminPermission) {
  return async (
    req: AdminAuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // ----------------------------------------
      // 1. Validate requested permission
      // ----------------------------------------

      if (!(ADMIN_PERMISSIONS as readonly string[]).includes(permission)) {
        res.status(403).json({
          success: false,
          message: "Invalid administrator permission.",
        });
        return;
      }

      // ----------------------------------------
      // 2. Verify authenticated administrator
      // ----------------------------------------

      const adminId = req.authAdmin?.userId;

      if (!adminId || !mongoose.isValidObjectId(adminId)) {
        res.status(401).json({
          success: false,
          message: "Administrator authentication required.",
        });
        return;
      }

      // ----------------------------------------
      // 3. Recheck administrator account
      // ----------------------------------------

      const admin = await User.findOne({
        _id: adminId,
        role: "admin",
        status: "active",
        deletedAt: null,
      })
        .select("_id adminType adminRoleId")
        .lean();

      if (!admin) {
        res.status(403).json({
          success: false,
          message: "Administrator account is unavailable.",
        });
        return;
      }

      // ----------------------------------------
      // 4. Super Admin access
      // ----------------------------------------

      if (admin.adminType === "super_admin") {
        next();
        return;
      }

      // ----------------------------------------
      // 5. Only staff accounts continue
      // ----------------------------------------

      if (admin.adminType !== "staff") {
        res.status(403).json({
          success: false,
          message: "Your administrator account is not authorized.",
        });
        return;
      }

      // ----------------------------------------
      // 6. Staff must have an assigned role
      // ----------------------------------------

      if (!admin.adminRoleId) {
        res.status(403).json({
          success: false,
          message: "Your staff account has no assigned administrator role.",
        });
        return;
      }

      // ----------------------------------------
      // 7. Retrieve assigned role
      // ----------------------------------------

      const assignedRole = await AdminRole.findOne({
        _id: admin.adminRoleId,
        isProtected: false,
        key: { $ne: "administrator" },
      })
        .select("permissions")
        .lean();

      if (!assignedRole) {
        res.status(403).json({
          success: false,
          message: "Your assigned administrator role is unavailable.",
        });
        return;
      }

      // ----------------------------------------
      // 8. Check requested permission
      // ----------------------------------------

      const permissions = assignedRole.permissions;

      if (!Array.isArray(permissions) || !permissions.includes(permission)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
          requiredPermission: permission,
        });
        return;
      }

      // ----------------------------------------
      // 9. Permission granted
      // ----------------------------------------

      next();
    } catch (error) {
      console.error("Admin permission middleware failed:", error);

      res.status(500).json({
        success: false,
        message: "Unable to verify administrator permissions.",
      });
    }
  };
}
