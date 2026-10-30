import { Router } from "express";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
} from "../controllers/cart.controller.js";

import { requireCustomerAuth } from "../middleware/customer-auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";

import {
  addCartItemSchema,
  updateCartItemSchema,
  mergeGuestCartSchema,
} from "../validators/cart.validation.js";

const router = Router();

// All cart endpoints require an authenticated customer.
router.use(requireCustomerAuth);

// GET /api/v1/cart
router.get("/", getCart);

// POST /api/v1/cart/merge
router.post("/merge", validateBody(mergeGuestCartSchema), mergeGuestCart);

// POST /api/v1/cart/items
router.post("/items", validateBody(addCartItemSchema), addCartItem);

// PATCH /api/v1/cart/items/:productId
router.patch(
  "/items/:productId",
  validateBody(updateCartItemSchema),
  updateCartItem,
);

// DELETE /api/v1/cart/items/:productId
router.delete("/items/:productId", removeCartItem);

// DELETE /api/v1/cart
router.delete("/", clearCart);

export default router;
