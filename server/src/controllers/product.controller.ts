import type { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred";
}

/**
 * GET /api/v1/products
 * Return published products with optional filtering and pagination.
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page ?? DEFAULT_PAGE);
    const limit = Number(req.query.limit ?? DEFAULT_LIMIT);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > MAX_LIMIT
    ) {
      res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100.",
      });
      return;
    }

    const filter: Record<string, unknown> = {
      status: "published",
    };

    if (typeof req.query.brand === "string" && req.query.brand.trim()) {
      filter.brand = req.query.brand.trim();
    }

    if (typeof req.query.condition === "string" && req.query.condition.trim()) {
      filter.condition = req.query.condition.trim();
    }

    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const search = req.query.search.trim().slice(0, 100);
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { brand: { $regex: escapedSearch, $options: "i" } },
        { model: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const minPrice =
      req.query.minPrice === undefined ? undefined : Number(req.query.minPrice);

    const maxPrice =
      req.query.maxPrice === undefined ? undefined : Number(req.query.maxPrice);

    if (
      (minPrice !== undefined &&
        (!Number.isFinite(minPrice) || minPrice < 0)) ||
      (maxPrice !== undefined &&
        (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
      (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
    ) {
      res.status(400).json({
        success: false,
        message: "Provide a valid minimum and maximum price range.",
      });
      return;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};

      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;

      filter.price = priceFilter;
    }

    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
    };

    const sortKey =
      typeof req.query.sort === "string" ? req.query.sort : "newest";

    if (!Object.hasOwn(sortOptions, sortKey)) {
      res.status(400).json({
        success: false,
        message: "Invalid sort option.",
        allowedSortOptions: Object.keys(sortOptions),
      });
      return;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort(sortOptions[sortKey])
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: unknown) {
    console.error("getProducts error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve products.",
    });
  }
}

/**
 * GET /api/v1/products/:slug
 * Retrieve one published product by its URL slug.
 */
export async function getProductBySlug(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const product = await ProductModel.findOne({
      slug: req.params.slug,
      status: "published",
    }).lean();

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: unknown) {
    console.error("getProductBySlug error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve this product.",
    });
  }
}

/**
 * GET /api/v1/brands
 * Return brands that currently have published products.
 */
export async function getBrands(_req: Request, res: Response): Promise<void> {
  try {
    const brands = await ProductModel.distinct("brand", {
      status: "published",
    });

    res.status(200).json({
      success: true,
      data: brands.sort((a, b) => String(a).localeCompare(String(b))),
    });
  } catch (error: unknown) {
    console.error("getBrands error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve brands.",
    });
  }
}

/**
 * POST /api/v1/products
 * Create a product. This route must be admin-protected.
 */
export async function createProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const product = await ProductModel.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: "Product validation failed.",
        errors: Object.values(error.errors).map((item) => item.message),
      });
      return;
    }

    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "A product with this slug already exists.",
      });
      return;
    }

    console.error("createProduct error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
}

/**
 * PATCH /api/v1/products/:id
 * Update an existing product. This route must be admin-protected.
 */
export async function updateProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID.",
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

    // Do not allow clients to override MongoDB-managed fields.
    const { _id, id, createdAt, updatedAt, __v, ...updates } = req.body;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No editable fields were provided.",
      });
      return;
    }

    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        success: false,
        message: "Product validation failed.",
        errors: Object.values(error.errors).map((item) => item.message),
      });
      return;
    }

    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "A product with this slug already exists.",
      });
      return;
    }

    console.error("updateProduct error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
}

/**
 * DELETE /api/v1/products/:id
 * Archive a product rather than permanently deleting it.
 */
export async function archiveProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
      return;
    }

    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "archived" } },
      { new: true, runValidators: true },
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product archived successfully.",
    });
  } catch (error: unknown) {
    console.error("archiveProduct error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to archive product.",
    });
  }
}
