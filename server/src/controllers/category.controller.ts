import type { Request, Response } from "express";
import mongoose from "mongoose";

import CategoryModel from "../models/Category.js";
import ProductModel from "../models/product.model.js";

// ============================================
// HELPERS
// ============================================

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof mongoose.mongo.MongoServerError && error.code === 11000
  );
}

function getDuplicateField(error: unknown): string | undefined {
  if (!isDuplicateKeyError(error)) {
    return undefined;
  }

  return Object.keys(
    (
      error as mongoose.mongo.MongoServerError & {
        keyPattern?: Record<string, number>;
      }
    ).keyPattern ?? {},
  )[0];
}

// ============================================
// PUBLIC CATEGORY LISTING
// ============================================

/**
 * GET /api/v1/categories
 *
 * Return active categories for the storefront.
 */
export async function getCategories(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const categories = await CategoryModel.find({
      status: "active",
    })
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: unknown) {
    console.error("getCategories error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve categories.",
    });
  }
}

// ============================================
// PUBLIC CATEGORY DETAILS
// ============================================

/**
 * GET /api/v1/categories/:slug
 *
 * Retrieve one active category by its slug.
 */
export async function getCategoryBySlug(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const slug = req.params.slug;

    if (typeof slug !== "string" || !slug.trim()) {
      res.status(400).json({
        success: false,
        message: "A valid category slug is required.",
      });
      return;
    }

    const category = await CategoryModel.findOne({
      slug: slug.trim().toLowerCase(),
      status: "active",
    }).lean();

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: unknown) {
    console.error("getCategoryBySlug error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve this category.",
    });
  }
}

// ============================================
// ADMIN CATEGORY LISTING
// ============================================

/**
 * GET /api/v1/categories/admin/all
 *
 * Return active and archived categories for administration.
 */
export async function getAdminCategories(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const categories = await CategoryModel.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: unknown) {
    console.error("getAdminCategories error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve admin categories.",
    });
  }
}

// ============================================
// CREATE CATEGORY
// ============================================

/**
 * POST /api/v1/categories
 *
 * Create a new category.
 */
export async function createCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const category = await CategoryModel.create(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: "Category validation failed.",
        errors: Object.values(error.errors).map((item) => item.message),
      });
      return;
    }

    if (isDuplicateKeyError(error)) {
      const duplicateField = getDuplicateField(error);

      res.status(409).json({
        success: false,
        message:
          duplicateField === "slug"
            ? "A category with this slug already exists."
            : "A category with this information already exists.",
        field: duplicateField ?? "unknown",
      });
      return;
    }

    console.error("createCategory error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create category.",
    });
  }
}

// ============================================
// UPDATE CATEGORY
// ============================================

/**
 * PATCH /api/v1/categories/:id
 *
 * Update an existing category.
 */
export async function updateCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
      return;
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
      return;
    }

    const category = await CategoryModel.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: "Category validation failed.",
        errors: Object.values(error.errors).map((item) => item.message),
      });
      return;
    }

    if (isDuplicateKeyError(error)) {
      const duplicateField = getDuplicateField(error);

      res.status(409).json({
        success: false,
        message:
          duplicateField === "slug"
            ? "Another category already uses this slug."
            : "A category with this information already exists.",
        field: duplicateField ?? "unknown",
      });
      return;
    }

    console.error("updateCategory error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update category.",
    });
  }
}

// ============================================
// ARCHIVE CATEGORY
// ============================================

/**
 * DELETE /api/v1/categories/:id
 *
 * Archive a category instead of permanently deleting it.
 *
 * Categories assigned to products cannot be archived.
 */
export async function archiveCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
      return;
    }

    const category = await CategoryModel.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found.",
      });
      return;
    }

    if (category.status === "archived") {
      res.status(200).json({
        success: true,
        message: "Category is already archived.",
        data: category,
      });
      return;
    }

    const assignedProducts = await ProductModel.exists({
      categoryId: category._id,
    });

    if (assignedProducts) {
      res.status(409).json({
        success: false,
        message:
          "This category is assigned to one or more products. Reassign those products before archiving the category.",
      });
      return;
    }

    category.status = "archived";

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category archived successfully.",
      data: category,
    });
  } catch (error: unknown) {
    console.error("archiveCategory error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to archive category.",
    });
  }
}
