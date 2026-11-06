import type { Request, Response } from "express";
import mongoose from "mongoose";

import ProductModel from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadImageBuffer } from "../services/cloudinary.service.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const LOW_STOCK_THRESHOLD = 10;
const PRODUCT_IMAGE_FOLDER = "ogim-store/products";

// ============================================
// HELPERS
// ============================================

function getInventoryStatus(quantity: number): string {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function removeCloudinaryImages(publicIds: string[]): Promise<void> {
  await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      }),
    ),
  );
}

// ============================================
// PUBLIC STOREFRONT
// ============================================

/**
 * GET /api/v1/products
 * Return published products with filtering and pagination.
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
      const search = escapeRegex(req.query.search.trim().slice(0, 100));

      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error("getBrands error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve brands.",
    });
  }
}

// ============================================
// ADMIN INVENTORY
// ============================================

/**
 * GET /api/v1/products/admin/inventory
 *
 * Return all products for the admin inventory page.
 * Includes published, draft and archived products.
 */
export async function getAdminInventory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const page = Number(req.query.page ?? DEFAULT_PAGE);
    const limit = Number(req.query.limit ?? 5);

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

    const filter: Record<string, unknown> = {};

    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const search = escapeRegex(req.query.search.trim().slice(0, 100));

      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (
      typeof req.query.category === "string" &&
      req.query.category.trim() &&
      req.query.category.trim().toLowerCase() !== "all"
    ) {
      filter.brand = req.query.category.trim();
    }

    const requestedStatus =
      typeof req.query.status === "string"
        ? req.query.status.trim().toLowerCase()
        : "all";

    if (
      requestedStatus !== "all" &&
      !["in_stock", "low_stock", "out_of_stock"].includes(requestedStatus)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid inventory status filter.",
        allowedStatuses: ["all", "in_stock", "low_stock", "out_of_stock"],
      });
      return;
    }

    if (requestedStatus === "out_of_stock") {
      filter.stockQuantity = { $lte: 0 };
    } else if (requestedStatus === "low_stock") {
      filter.stockQuantity = {
        $gt: 0,
        $lte: LOW_STOCK_THRESHOLD,
      };
    } else if (requestedStatus === "in_stock") {
      filter.stockQuantity = { $gt: LOW_STOCK_THRESHOLD };
    }

    const skip = (page - 1) * limit;

    const [products, total, summaryResult] = await Promise.all([
      ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ProductModel.countDocuments(filter),

      ProductModel.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            inStock: {
              $sum: {
                $cond: [{ $gt: ["$stockQuantity", LOW_STOCK_THRESHOLD] }, 1, 0],
              },
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$stockQuantity", 0] },
                      { $lte: ["$stockQuantity", LOW_STOCK_THRESHOLD] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            outOfStock: {
              $sum: {
                $cond: [{ $lte: ["$stockQuantity", 0] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const summary = summaryResult[0] ?? {
      totalProducts: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    };

    res.status(200).json({
      success: true,
      data: products,
      summary: {
        totalProducts: summary.totalProducts,
        inStock: summary.inStock,
        lowStock: summary.lowStock,
        outOfStock: summary.outOfStock,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("getAdminInventory error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve admin inventory.",
    });
  }
}

// ============================================
// CREATE PRODUCT
// ============================================

/**
 * POST /api/v1/products
 * Create and immediately publish a product.
 */
export async function createProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const product = await ProductModel.create({
      ...req.body,
      status: "published",
    });

    res.status(201).json({
      success: true,
      message: "Product created and published successfully.",
      data: product,
    });
  } catch (error) {
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
      const duplicateField = Object.keys(
        (
          error as mongoose.mongo.MongoServerError & {
            keyPattern?: Record<string, number>;
          }
        ).keyPattern ?? {},
      )[0];

      res.status(409).json({
        success: false,
        message:
          duplicateField === "sku"
            ? "A product with this SKU already exists."
            : "A product with this slug already exists.",
        field: duplicateField ?? "unknown",
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

// ============================================
// UPDATE PRODUCT
// ============================================

/**
 * PATCH /api/v1/products/:id
 * Update an existing product.
 */
export async function updateProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
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

    const {
      _id,
      id: ignoredId,
      createdAt,
      updatedAt,
      __v,
      ...updates
    } = req.body;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No editable fields were provided.",
      });
      return;
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        returnDocument: "after",
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
  } catch (error) {
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
      const duplicateField = Object.keys(
        (
          error as mongoose.mongo.MongoServerError & {
            keyPattern?: Record<string, number>;
          }
        ).keyPattern ?? {},
      )[0];

      res.status(409).json({
        success: false,
        message:
          duplicateField === "sku"
            ? "A product with this SKU already exists."
            : "A product with this slug already exists.",
        field: duplicateField ?? "unknown",
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

// ============================================
// UPDATE PRODUCT STOCK
// ============================================

/**
 * PATCH /api/v1/products/:id/stock
 *
 * Set the new total available stock quantity.
 * This does not increment or decrement the existing quantity.
 */
export async function updateProductStock(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body as {
      stockQuantity?: number;
    };

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
      return;
    }

    if (
      typeof stockQuantity !== "number" ||
      !Number.isInteger(stockQuantity) ||
      !Number.isFinite(stockQuantity) ||
      stockQuantity < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative whole number.",
      });
      return;
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { stockQuantity } },
      {
        returnDocument: "after",
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
      message: "Product stock updated successfully.",
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        stockQuantity: product.stockQuantity,
        inStock: product.stockQuantity > 0,
        inventoryStatus: getInventoryStatus(product.stockQuantity),
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error("updateProductStock error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update product stock.",
    });
  }
}

// ============================================
// ARCHIVE PRODUCT
// ============================================

/**
 * DELETE /api/v1/products/:id
 * Archive a product rather than permanently deleting it.
 */
export async function archiveProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
      return;
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { status: "archived" } },
      {
        returnDocument: "after",
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
      message: "Product archived successfully.",
    });
  } catch (error) {
    console.error("archiveProduct error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to archive product.",
    });
  }
}

// ============================================
// CLOUDINARY IMAGE UPLOAD FOR EXISTING PRODUCT
// ============================================

/**
 * POST /api/v1/products/:id/images
 *
 * Upload additional images and attach them to an existing product.
 */
export async function addProductImages(
  req: Request,
  res: Response,
): Promise<void> {
  const uploadedPublicIds: string[] = [];

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
      return;
    }

    const files = req.files;

    if (!Array.isArray(files) || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "Select at least one image to upload.",
      });
      return;
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    if (product.images.length + files.length > 10) {
      res.status(400).json({
        success: false,
        message: `This product can have at most 10 images. It currently has ${product.images.length}.`,
      });
      return;
    }

    const newImages: {
      url: string;
      publicId: string;
      alt: string;
    }[] = [];

    for (const file of files) {
      const uploaded = await uploadImageBuffer(
        file.buffer,
        PRODUCT_IMAGE_FOLDER,
      );

      uploadedPublicIds.push(uploaded.publicId);

      newImages.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        alt: `${product.name} product image`,
      });
    }

    product.images.push(...newImages);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product images uploaded successfully.",
      data: {
        productId: product.id,
        images: product.images,
      },
    });
  } catch (error) {
    console.error("addProductImages error:", error);

    await removeCloudinaryImages(uploadedPublicIds);

    res.status(500).json({
      success: false,
      message: "Unable to upload product images.",
    });
  }
}

// ============================================
// CLOUDINARY IMAGE UPLOAD BEFORE PRODUCT CREATION
// ============================================

/**
 * POST /api/v1/products/admin/images
 *
 * Upload images before a product is created.
 * Returns Cloudinary metadata for the frontend.
 */
export async function uploadProductImagesToCloudinary(
  req: Request,
  res: Response,
): Promise<void> {
  const uploadedPublicIds: string[] = [];

  try {
    const files = req.files;

    if (!Array.isArray(files) || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "Select at least one image to upload.",
      });
      return;
    }

    if (files.length > 5) {
      res.status(400).json({
        success: false,
        message: "You can upload a maximum of five images at a time.",
      });
      return;
    }

    const images: {
      url: string;
      publicId: string;
      alt: string;
    }[] = [];

    for (const file of files) {
      const uploaded = await uploadImageBuffer(
        file.buffer,
        PRODUCT_IMAGE_FOLDER,
      );

      uploadedPublicIds.push(uploaded.publicId);

      images.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        alt: file.originalname.replace(/\.[^/.]+$/, "") || "Product image",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product images uploaded successfully.",
      data: images,
    });
  } catch (error) {
    console.error("uploadProductImagesToCloudinary error:", error);

    await removeCloudinaryImages(uploadedPublicIds);

    res.status(500).json({
      success: false,
      message: "Unable to upload product images.",
    });
  }
}

// ============================================
// DELETE TEMPORARY CLOUDINARY PRODUCT IMAGES
// ============================================

/**
 * DELETE /api/v1/products/admin/images
 *
 * Delete images uploaded before product creation.
 *
 * Images already attached to a saved product cannot be deleted
 * through this temporary-image endpoint.
 */
export async function deleteAdminProductImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { publicIds } = req.body as {
      publicIds?: unknown;
    };

    if (
      !Array.isArray(publicIds) ||
      publicIds.length === 0 ||
      publicIds.length > 5 ||
      !publicIds.every(
        (id) =>
          typeof id === "string" && id.startsWith(`${PRODUCT_IMAGE_FOLDER}/`),
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Provide valid Ogim product image references.",
      });
      return;
    }

    const uniquePublicIds = [...new Set(publicIds as string[])];

    // Prevent deleting images already attached to saved products.
    const attachedProduct = await ProductModel.exists({
      "images.publicId": { $in: uniquePublicIds },
    });

    if (attachedProduct) {
      res.status(409).json({
        success: false,
        message: "One or more images are already attached to a saved product.",
      });
      return;
    }

    const results = await Promise.all(
      uniquePublicIds.map(async (publicId) => {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });

        return {
          publicId,
          success: result.result === "ok" || result.result === "not found",
        };
      }),
    );

    const failed = results.filter((result) => !result.success);

    if (failed.length > 0) {
      res.status(502).json({
        success: false,
        message: "Some product images could not be deleted.",
        data: results,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product images deleted successfully.",
      data: results,
    });
  } catch (error) {
    console.error("deleteAdminProductImage error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete product images.",
    });
  }
}
