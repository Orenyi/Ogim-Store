import type { Request, Response } from "express";

import {
  AdminRoleError,
  getAdminRoles,
  getAdminRoleById,
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
} from "../services/adminRole.service.js";

import type {
  CreateAdminRoleInput,
  UpdateAdminRoleInput,
} from "../services/adminRole.service.js";

import { ADMIN_ROLE_COLORS, ADMIN_PERMISSIONS } from "../models/AdminRole.js";

// ============================================
// HELPERS
// ============================================

function getAdminId(req: Request): string | null {
  const authAdmin = (req as any).authAdmin;

  const adminId = authAdmin?.userId;

  return typeof adminId === "string" ? adminId : null;
}

function getString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }

  return fallback;
}

function sendError(res: Response, error: unknown) {
  if (error instanceof AdminRoleError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error && error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error && error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid role reference.",
    });
  }

  console.error("Admin role error:", error);

  return res.status(500).json({
    success: false,
    message: "An unexpected role management error occurred.",
  });
}

// ============================================
// GET ALL ROLES
// ============================================

export async function getAdminRolesController(req: Request, res: Response) {
  try {
    const roles = await getAdminRoles();

    return res.status(200).json({
      success: true,
      message: "Administrator roles retrieved successfully.",
      data: {
        roles,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// GET SINGLE ROLE
// ============================================

export async function getAdminRoleByIdController(req: Request, res: Response) {
  try {
    const roleId = getString(req.params.roleId);

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    const role = await getAdminRoleById(roleId);

    return res.status(200).json({
      success: true,
      message: "Administrator role retrieved successfully.",
      data: {
        role,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// CREATE CUSTOM ROLE
// ============================================

export async function createAdminRoleController(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const input: CreateAdminRoleInput = {
      name: getString(req.body.name),
      description: getString(req.body.description),
      color: getString(req.body.color) as CreateAdminRoleInput["color"],
      permissions: Array.isArray(req.body.permissions)
        ? req.body.permissions
        : [],
    };

    if (!input.name || !input.color) {
      return res.status(400).json({
        success: false,
        message: "Role name and color are required.",
      });
    }

    if (!ADMIN_ROLE_COLORS.includes(input.color)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role color.",
      });
    }

    if (!Array.isArray(input.permissions)) {
      return res.status(400).json({
        success: false,
        message: "Role permissions must be an array.",
      });
    }

    const invalidPermissions = input.permissions.filter(
      (permission) => !ADMIN_PERMISSIONS.includes(permission),
    );

    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more selected permissions are invalid.",
      });
    }

    const role = await createAdminRole(input, adminId);

    return res.status(201).json({
      success: true,
      message: "Custom role created successfully.",
      data: {
        role,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// UPDATE ROLE
// ============================================

export async function updateAdminRoleController(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const roleId = getString(req.params.roleId);

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    const input: UpdateAdminRoleInput = {};

    if (req.body.name !== undefined) {
      input.name = getString(req.body.name);
    }

    if (req.body.description !== undefined) {
      input.description = getString(req.body.description);
    }

    if (req.body.color !== undefined) {
      const color = getString(req.body.color);

      if (
        !ADMIN_ROLE_COLORS.includes(
          color as UpdateAdminRoleInput["color"] & string,
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid role color.",
        });
      }

      input.color = color as UpdateAdminRoleInput["color"];
    }

    if (req.body.permissions !== undefined) {
      if (!Array.isArray(req.body.permissions)) {
        return res.status(400).json({
          success: false,
          message: "Role permissions must be an array.",
        });
      }

      const invalidPermissions = req.body.permissions.filter(
        (permission: unknown) =>
          typeof permission !== "string" ||
          !ADMIN_PERMISSIONS.includes(
            permission as (typeof ADMIN_PERMISSIONS)[number],
          ),
      );

      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: "One or more selected permissions are invalid.",
        });
      }

      input.permissions = req.body.permissions;
    }

    if (Object.keys(input).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one role field to update.",
      });
    }

    const role = await updateAdminRole(roleId, input, adminId);

    return res.status(200).json({
      success: true,
      message: "Administrator role updated successfully.",
      data: {
        role,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// ============================================
// DELETE ROLE
// ============================================

export async function deleteAdminRoleController(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Administrator authentication is required.",
      });
    }

    const roleId = getString(req.params.roleId);

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    const result = await deleteAdminRole(roleId, adminId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}
