import { Router } from "express";

import {
  archiveProduct,
  createProduct,
  getProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validation.js";

const router = Router();

// Public storefront routes
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// Admin-only catalogue management with request validation
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
