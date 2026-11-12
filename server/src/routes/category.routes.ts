import { Router } from "express";

import {
  archiveCategory,
  createCategory,
  getAdminCategories,
  getCategories,
  getCategoryBySlug,
  updateCategory,
} from "../controllers/category.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validation.js";

const router = Router();

// ============================================
// PUBLIC CATEGORY ROUTES
// ============================================

// GET /api/v1/categories
// Retrieve all active categories.
router.get("/", getCategories);

// GET /api/v1/categories/:slug
// Retrieve one active category.
router.get("/:slug", getCategoryBySlug);

// ============================================
// ADMIN CATEGORY ROUTES
// ============================================

// GET /api/v1/categories/admin/all
// Retrieve active and archived categories.
router.get("/admin/all", requireAdmin, getAdminCategories);

// POST /api/v1/categories
// Create a new category.
router.post(
  "/",
  requireAdmin,
  validateBody(createCategorySchema),
  createCategory,
);

// PATCH /api/v1/categories/:id
// Update an existing category.
router.patch(
  "/:id",
  requireAdmin,
  validateBody(updateCategorySchema),
  updateCategory,
);

// DELETE /api/v1/categories/:id
// Archive a category.
router.delete("/:id", requireAdmin, archiveCategory);

export default router;
