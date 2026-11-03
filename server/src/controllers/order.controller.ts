import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/customer-auth.middleware.js";

import {
  OrderServiceError,
  createPendingOrder,
  cancelPendingOrder,
  getCustomerOrders,
  getCustomerOrderById,
} from "../services/order.service.js";

// ============================================
// ERROR HANDLING
// ============================================

function getErrorResponse(error: unknown) {
  if (error instanceof OrderServiceError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  console.error("Order controller error:", error);

  return {
    statusCode: 500,
    message: "Something went wrong while processing your order.",
  };
}

// ============================================
// GET /api/v1/orders
// GET AUTHENTICATED CUSTOMER ORDERS
// ============================================

export async function getOrders(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;

    const orders = await getCustomerOrders(userId);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      data: {
        orders,
        total: orders.length,
      },
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
// GET /api/v1/orders/:orderId
// GET ONE CUSTOMER ORDER
// ============================================

export async function getOrderById(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;
    const orderId = req.params.orderId;

    if (typeof orderId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
      return;
    }

    const order = await getCustomerOrderById(userId, orderId);

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully.",
      data: {
        order,
      },
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
// POST /api/v1/orders
// CREATE PENDING ORDER
// ============================================

export async function createOrder(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;

    const order = await createPendingOrder(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Your order has been created successfully.",
      data: {
        order,
        reservationExpiresAt: order.reservationExpiresAt,
      },
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
// POST /api/v1/orders/:orderId/cancel
// CANCEL PENDING ORDER
// ============================================

export async function cancelOrder(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;
    const orderId = req.params.orderId;

    if (typeof orderId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
      return;
    }

    const order = await cancelPendingOrder(userId, orderId);

    res.status(200).json({
      success: true,
      message: "Your order has been cancelled successfully.",
      data: order,
    });
  } catch (error: unknown) {
    const result = getErrorResponse(error);

    res.status(result.statusCode).json({
      success: false,
      message: result.message,
    });
  }
}
