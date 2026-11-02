import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/customer-auth.middleware.js";

import {
  PaymentServiceError,
  initializeOrderPayment,
} from "../services/payment.service.js";

export async function initializePayment(
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

    const payment = await initializeOrderPayment(userId, orderId);

    res.status(200).json({
      success: true,
      message: "Payment initialized successfully.",
      data: payment,
    });
  } catch (error: unknown) {
    if (error instanceof PaymentServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Payment controller error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while initializing your payment.",
    });
  }
}
