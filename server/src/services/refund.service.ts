import axios from "axios";
import Payment from "../models/Payment.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackRefundStatus =
  | "pending"
  | "processing"
  | "processed"
  | "failed"
  | "needs-attention";

interface PaystackRefundResponse {
  status: boolean;
  message: string;
  data?: {
    id?: number;
    transaction?: number | string;
    amount?: number;
    currency?: string;
    status?: PaystackRefundStatus;
  };
}

export class RefundServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "RefundServiceError";
    this.statusCode = statusCode;
  }
}

function getPaystackSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new RefundServiceError("Paystack secret key is not configured.", 500);
  }

  return secret;
}

function mapRefundStatus(
  status?: PaystackRefundStatus,
): "pending" | "processing" | "success" | "failed" {
  switch (status) {
    case "processed":
      return "success";

    case "processing":
    case "needs-attention":
      return "processing";

    case "failed":
      return "failed";

    case "pending":
    default:
      return "pending";
  }
}

/**
 * Initiates a refund for a payment already marked as requiring one.
 *
 * Safety:
 * - Only successful payments can be refunded.
 * - Only refundStatus === "required" can be claimed.
 * - The atomic claim prevents concurrent refund requests.
 * - Ambiguous network failures remain "processing".
 * - A second request cannot blindly submit the same refund again.
 */
export async function initiatePaymentRefund(paymentId: string) {
  if (!paymentId || !/^[a-f\d]{24}$/i.test(paymentId)) {
    throw new RefundServiceError("A valid payment ID is required.");
  }

  const now = new Date();

  // Atomically claim this refund before contacting Paystack.
  const payment = await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      status: "success",
      refundStatus: "required",
      refundAmount: { $exists: true, $gt: 0 },
    },
    {
      $set: {
        refundStatus: "processing",
        refundUpdatedAt: now,
        refundFailureReason: null,
      },
      $inc: {
        refundAttemptCount: 1,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!payment) {
    const existingPayment = await Payment.findById(paymentId);

    if (!existingPayment) {
      throw new RefundServiceError("Payment was not found.", 404);
    }

    if (existingPayment.status !== "success") {
      throw new RefundServiceError("Only successful payments can be refunded.");
    }

    if (existingPayment.refundStatus === "success") {
      return {
        success: true,
        message: "This payment has already been refunded.",
        refundStatus: "success",
        paymentId: existingPayment._id.toString(),
      };
    }

    if (
      existingPayment.refundStatus === "processing" ||
      existingPayment.refundStatus === "pending"
    ) {
      throw new RefundServiceError(
        "A refund request is already in progress. Reconcile its status before taking further action.",
        409,
      );
    }

    throw new RefundServiceError(
      `Payment cannot be refunded from its current refund status: ${existingPayment.refundStatus}.`,
      409,
    );
  }

  const refundAmount = payment.refundAmount;

  if (
    !Number.isInteger(refundAmount) ||
    refundAmount <= 0 ||
    refundAmount > payment.amount
  ) {
    await Payment.updateOne(
      { _id: payment._id, refundStatus: "processing" },
      {
        $set: {
          refundStatus: "failed",
          refundFailureReason: "Invalid refund amount.",
          refundUpdatedAt: new Date(),
        },
      },
    );

    throw new RefundServiceError("The refund amount is invalid.");
  }

  const secret = getPaystackSecret();

  try {
    const response = await axios.post<PaystackRefundResponse>(
      `${PAYSTACK_BASE_URL}/refund`,
      {
        transaction: payment.reference,
        amount: refundAmount,
        currency: payment.currency,
        customer_note: payment.refundReason || "Payment refund",
        merchant_note: `Ogim Store refund for payment ${payment._id}`,
      },
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    const result = response.data;

    if (!result.status || !result.data) {
      await Payment.updateOne(
        { _id: payment._id, refundStatus: "processing" },
        {
          $set: {
            refundStatus: "failed",
            refundFailureReason:
              result.message || "Paystack rejected the refund request.",
            refundUpdatedAt: new Date(),
          },
        },
      );

      throw new RefundServiceError(
        result.message || "Paystack could not initiate the refund.",
        502,
      );
    }

    const providerStatus = result.data.status;
    const localStatus = mapRefundStatus(providerStatus);

    await Payment.updateOne(
      {
        _id: payment._id,
        refundStatus: "processing",
      },
      {
        $set: {
          refundStatus: localStatus,
          refundProviderId: result.data.id?.toString(),
          refundUpdatedAt: new Date(),
          ...(localStatus === "success"
            ? { refundProcessedAt: new Date() }
            : {}),
          ...(localStatus === "failed"
            ? {
                refundFailureReason:
                  "Paystack reported that the refund failed.",
              }
            : {}),
        },
      },
    );

    return {
      success: true,
      message: result.message || "Refund request submitted to Paystack.",
      paymentId: payment._id.toString(),
      paymentReference: payment.reference,
      refundProviderId: result.data.id?.toString() || null,
      refundAmount,
      currency: payment.currency,
      refundStatus: localStatus,
    };
  } catch (error) {
    if (error instanceof RefundServiceError) {
      throw error;
    }

    if (axios.isAxiosError(error) && error.response) {
      const providerMessage =
        (error.response.data as { message?: string })?.message ||
        "Paystack rejected the refund request.";

      // A provider HTTP response was received. Record the rejection.
      await Payment.updateOne(
        { _id: payment._id, refundStatus: "processing" },
        {
          $set: {
            refundStatus: "failed",
            refundFailureReason: providerMessage,
            refundUpdatedAt: new Date(),
          },
        },
      );

      throw new RefundServiceError(providerMessage, 502);
    }

    // No reliable response was received.
    // The refund may have reached Paystack, so do not retry automatically.
    await Payment.updateOne(
      { _id: payment._id, refundStatus: "processing" },
      {
        $set: {
          refundFailureReason:
            "Refund outcome is uncertain. Check Paystack before retrying.",
          refundUpdatedAt: new Date(),
        },
      },
    );

    throw new RefundServiceError(
      "The refund outcome is uncertain. Check Paystack before attempting another refund.",
      503,
    );
  }
}
