import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/customer-auth.middleware.js";

import {
  CartServiceError,
  getCustomerCart,
  addCartItem as addCartItemService,
  updateCartItem as updateCartItemService,
  removeCartItem as removeCartItemService,
  clearCustomerCart,
  mergeGuestCart as mergeGuestCartService,
} from "../services/cart.service.js";

function getErrorResponse(error: unknown) {
  if (error instanceof CartServiceError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  console.error("Cart controller error:", error);

  return {
    statusCode: 500,
    message: "Something went wrong while processing your cart.",
  };
}

/**
 * Safely extracts the product ID from Express route parameters.
 */
function getProductId(req: AuthenticatedRequest): string {
  const productId = req.params.productId;

  if (typeof productId !== "string") {
    throw new CartServiceError("Invalid product ID.", 400);
  }

  return productId;
}

// ============================================
// GET /api/v1/cart
// ============================================

export async function getCart(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;

    const cart = await getCustomerCart(userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// POST /api/v1/cart/items
// ============================================

export async function addCartItem(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;
    const { productId, quantity } = req.body;

    const cart = await addCartItemService(userId, productId, quantity);

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully.",
      data: cart,
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// PATCH /api/v1/cart/items/:productId
// ============================================

export async function updateCartItem(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;
    const productId = getProductId(req);
    const { quantity } = req.body;

    const cart = await updateCartItemService(userId, productId, quantity);

    res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully.",
      data: cart,
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// DELETE /api/v1/cart/items/:productId
// ============================================

export async function removeCartItem(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;
    const productId = getProductId(req);

    const cart = await removeCartItemService(userId, productId);

    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully.",
      data: cart,
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// DELETE /api/v1/cart
// ============================================

export async function clearCart(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;

    const cart = await clearCustomerCart(userId);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      data: cart,
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}

// ============================================
// POST /api/v1/cart/merge
// ============================================

export async function mergeGuestCart(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;
    const { items } = req.body;

    const result = await mergeGuestCartService(userId, items);

    res.status(200).json({
      success: true,
      message: "Guest cart synchronization completed.",
      data: result.cart,
      rejectedItems: result.rejectedItems,
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}
