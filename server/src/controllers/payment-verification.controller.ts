import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/customer-auth.middleware.js";

import {
  PaymentVerificationError,
  verifyOrderPayment,
} from "../services/payment-verification.service.js";

export async function verifyPayment(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.authUser!.userId;
    const orderId = req.params.orderId;

    const reference = req.body?.reference;

    if (typeof orderId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
      return;
    }

    if (typeof reference !== "string" || reference.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Payment reference is required.",
      });
      return;
    }

    const result = await verifyOrderPayment(userId, orderId, reference);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof PaymentVerificationError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Payment verification controller error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while verifying your payment.",
    });
  }
}
