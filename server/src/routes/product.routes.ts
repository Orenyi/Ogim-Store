import { Router } from "express";

import {
  archiveProduct,
  addProductImages,
  createProduct,
  deleteAdminProductImage,
  getAdminInventory,
  getProductBySlug,
  getProducts,
  updateProduct,
  updateProductStock,
  uploadProductImagesToCloudinary,
} from "../controllers/product.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validation.js";

import { uploadProductImages } from "../middleware/upload.middleware.js";

const router = Router();

// ============================================
// ADMIN INVENTORY
// ============================================

router.get("/admin/inventory", requireAdmin, getAdminInventory);

router.patch("/:id/stock", requireAdmin, updateProductStock);

// ============================================
// ADMIN CLOUDINARY IMAGE MANAGEMENT
// ============================================

// Upload images before a product is created.
router.post(
  "/admin/images",
  requireAdmin,
  uploadProductImages.array("images", 5),
  uploadProductImagesToCloudinary,
);

// Delete an uploaded Cloudinary image before product creation.
router.delete("/admin/images", requireAdmin, deleteAdminProductImage);

// Upload additional images to an existing product.
router.post(
  "/:id/images",
  requireAdmin,
  uploadProductImages.array("images", 10),
  addProductImages,
);

// ============================================
// PUBLIC STOREFRONT
// ============================================

router.get("/", getProducts);

router.get("/:slug", getProductBySlug);

// ============================================
// ADMIN PRODUCT MANAGEMENT
// ============================================

router.post(
  "/",
  requireAdmin,
  validateBody(createProductSchema),
  createProduct,
);

router.patch(
  "/:id",
  requireAdmin,
  validateBody(updateProductSchema),
  updateProduct,
);

router.delete("/:id", requireAdmin, archiveProduct);

export default router;
