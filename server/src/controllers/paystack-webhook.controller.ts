import type { Request, Response } from "express";

import { createHmac, timingSafeEqual, createHash } from "node:crypto";

import { env } from "../config/env.js";
import Payment from "../models/Payment.js";
import PaystackWebhookEvent from "../models/PaystackWebhookEvent.js";
import { verifyOrderPayment } from "../services/payment-verification.service.js";

interface PaystackWebhookPayload {
  event: string;
  data?: {
    id?: number;
    reference?: string;
    transaction_reference?: string;
    refund_reference?: string | null;
    amount?: string | number;
    currency?: string;
    status?: string;
  };
}

type RefundEventStatus =
  | "pending"
  | "processing"
  | "processed"
  | "failed"
  | "needs-attention";

const WEBHOOK_STALE_AFTER_MS = 5 * 60 * 1000;

const REFUND_EVENTS = [
  "refund.pending",
  "refund.processing",
  "refund.processed",
  "refund.failed",
  "refund.needs-attention",
];

// ============================================
// SIGNATURE VALIDATION
// ============================================

function isValidPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const expectedSignature = createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (!/^[a-fA-F0-9]{128}$/.test(signature)) {
    return false;
  }

  const received = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (received.length !== expected.length || received.length === 0) {
    return false;
  }

  return timingSafeEqual(received, expected);
}

// ============================================
// EVENT IDENTIFICATION
// ============================================

function getEventKey(payload: PaystackWebhookPayload): string {
  const data = payload.data;

  // Refund events have their own refund reference.
  // Each refund lifecycle event gets a separate event key.
  if (payload.event.startsWith("refund.")) {
    const refundReference = data?.refund_reference;
    const transactionReference = data?.transaction_reference;
    const amount = data?.amount;

    if (
      typeof refundReference === "string" &&
      refundReference.trim().length > 0
    ) {
      return `${payload.event}:${refundReference}`;
    }

    if (
      typeof transactionReference === "string" &&
      transactionReference.trim().length > 0
    ) {
      return `${payload.event}:${transactionReference}:${amount ?? "unknown"}`;
    }
  }

  const transactionId = data?.id;

  if (transactionId !== undefined) {
    return `${payload.event}:${transactionId}`;
  }

  const fallbackHash = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  return `${payload.event}:${fallbackHash}`;
}

// ============================================
// DUPLICATE KEY ERROR CHECK
// ============================================

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

// ============================================
// REFUND EVENT HELPERS
// ============================================

function getRefundEventStatus(event: string): RefundEventStatus | null {
  switch (event) {
    case "refund.pending":
      return "pending";

    case "refund.processing":
      return "processing";

    case "refund.processed":
      return "processed";

    case "refund.failed":
      return "failed";

    case "refund.needs-attention":
      return "needs-attention";

    default:
      return null;
  }
}

/**
 * Updates the local refund record using Paystack's
 * authenticated refund webhook notification.
 *
 * Never allows an older event to reverse a completed
 * refund or change a completed refund into a failed one.
 */
async function processRefundWebhook(
  payload: PaystackWebhookPayload,
): Promise<void> {
  const data = payload.data;

  const transactionReference = data?.transaction_reference;

  if (
    typeof transactionReference !== "string" ||
    transactionReference.trim().length === 0
  ) {
    throw new Error(
      "Paystack refund event does not contain a valid transaction reference.",
    );
  }

  const eventStatus = getRefundEventStatus(payload.event);

  if (!eventStatus) {
    throw new Error(`Unsupported Paystack refund event: ${payload.event}`);
  }

  const normalizedReference = transactionReference.trim();

  const payment = await Payment.findOne({
    reference: normalizedReference,
    gateway: "paystack",
  });

  if (!payment) {
    throw new Error(
      `No payment record found for refund transaction ${normalizedReference}.`,
    );
  }

  if (payment.status !== "success") {
    throw new Error(
      `Refund event received for a payment that is not locally successful: ${normalizedReference}.`,
    );
  }

  const receivedAmount = Number(data?.amount);

  if (!Number.isSafeInteger(receivedAmount) || receivedAmount <= 0) {
    throw new Error("Paystack refund event contains an invalid refund amount.");
  }

  if (
    !Number.isInteger(payment.refundAmount) ||
    payment.refundAmount !== receivedAmount
  ) {
    throw new Error(
      `Refund amount mismatch for ${normalizedReference}. Expected ${payment.refundAmount} kobo but received ${receivedAmount} kobo.`,
    );
  }

  const receivedCurrency = data?.currency?.toUpperCase();

  if (!receivedCurrency || receivedCurrency !== payment.currency) {
    throw new Error(`Refund currency mismatch for ${normalizedReference}.`);
  }

  const refundProviderId =
    typeof data?.refund_reference === "string" &&
    data.refund_reference.trim().length > 0
      ? data.refund_reference.trim()
      : undefined;

  const now = new Date();

  // --------------------------------------------
  // REFUND PENDING
  // --------------------------------------------

  if (eventStatus === "pending") {
    await Payment.updateOne(
      {
        _id: payment._id,
        refundStatus: "processing",
      },
      {
        $set: {
          refundStatus: "pending",
          refundUpdatedAt: now,
          ...(refundProviderId ? { refundProviderId } : {}),
        },
      },
    );

    return;
  }

  // --------------------------------------------
  // REFUND PROCESSING
  // --------------------------------------------

  if (eventStatus === "processing") {
    await Payment.updateOne(
      {
        _id: payment._id,
        refundStatus: {
          $in: ["pending", "processing"],
        },
      },
      {
        $set: {
          refundStatus: "processing",
          refundUpdatedAt: now,
          ...(refundProviderId ? { refundProviderId } : {}),
        },
      },
    );

    return;
  }

  // --------------------------------------------
  // REFUND NEEDS ATTENTION
  // --------------------------------------------

  if (eventStatus === "needs-attention") {
    await Payment.updateOne(
      {
        _id: payment._id,
        refundStatus: {
          $in: ["pending", "processing"],
        },
      },
      {
        $set: {
          refundStatus: "processing",
          refundFailureReason:
            "Paystack requires customer bank account details before this refund can continue.",
          refundUpdatedAt: now,
          ...(refundProviderId ? { refundProviderId } : {}),
        },
      },
    );

    return;
  }

  // --------------------------------------------
  // REFUND PROCESSED
  // --------------------------------------------

  if (eventStatus === "processed") {
    const result = await Payment.updateOne(
      {
        _id: payment._id,
        refundStatus: {
          $in: ["pending", "processing", "success"],
        },
      },
      {
        $set: {
          refundStatus: "success",
          refundProcessedAt: now,
          refundUpdatedAt: now,
          refundFailureReason: null,
          ...(refundProviderId ? { refundProviderId } : {}),
        },
      },
    );

    if (result.matchedCount === 0) {
      const latestPayment = await Payment.findById(payment._id);

      if (latestPayment?.refundStatus !== "success") {
        throw new Error(
          "Refund could not be marked as successfully processed.",
        );
      }
    }

    return;
  }

  // --------------------------------------------
  // REFUND FAILED
  // --------------------------------------------

  if (eventStatus === "failed") {
    const result = await Payment.updateOne(
      {
        _id: payment._id,
        refundStatus: {
          $in: ["pending", "processing", "failed"],
        },
      },
      {
        $set: {
          refundStatus: "failed",
          refundFailureReason:
            "Paystack reported that this refund could not be processed. The original payment remains successful.",
          refundUpdatedAt: now,
          ...(refundProviderId ? { refundProviderId } : {}),
        },
      },
    );

    if (result.matchedCount === 0) {
      const latestPayment = await Payment.findById(payment._id);

      if (latestPayment?.refundStatus !== "success") {
        throw new Error("Refund failure status could not be recorded.");
      }
    }
  }
}

// ============================================
// WEBHOOK HANDLER
// ============================================

export async function handlePaystackWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  // ============================================
  // 1. VALIDATE RAW BODY
  // ============================================

  const rawBody = req.body;

  if (!Buffer.isBuffer(rawBody)) {
    res.status(400).json({
      message: "Invalid webhook request body.",
    });
    return;
  }

  // ============================================
  // 2. VALIDATE PAYSTACK SIGNATURE
  // ============================================

  const signature = req.get("x-paystack-signature");

  if (!signature || !isValidPaystackSignature(rawBody, signature)) {
    res.status(401).json({
      message: "Invalid Paystack webhook signature.",
    });
    return;
  }

  // ============================================
  // 3. PARSE WEBHOOK PAYLOAD
  // ============================================

  let payload: PaystackWebhookPayload;

  try {
    payload = JSON.parse(rawBody.toString("utf8")) as PaystackWebhookPayload;
  } catch {
    res.status(400).json({
      message: "Invalid Paystack webhook JSON payload.",
    });
    return;
  }

  if (
    !payload ||
    typeof payload.event !== "string" ||
    payload.event.trim().length === 0
  ) {
    res.status(400).json({
      message: "Webhook event is missing or invalid.",
    });
    return;
  }

  // ============================================
  // 4. PREPARE EVENT INFORMATION
  // ============================================

  const reference =
    payload.data?.reference ?? payload.data?.transaction_reference;

  const transactionId = payload.data?.id;

  const eventKey = getEventKey(payload);

  const payloadHash = createHash("sha256").update(rawBody).digest("hex");

  const staleProcessingTime = new Date(Date.now() - WEBHOOK_STALE_AFTER_MS);

  // ============================================
  // 5. FIND OR CREATE WEBHOOK EVENT
  // ============================================

  let eventRecord = await PaystackWebhookEvent.findOne({
    eventKey,
  });

  if (!eventRecord) {
    try {
      eventRecord = await PaystackWebhookEvent.create({
        eventKey,
        event: payload.event,
        reference,
        transactionId,
        payloadHash,
        status: "received",
        processingAttempts: 0,
      });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        eventRecord = await PaystackWebhookEvent.findOne({
          eventKey,
        });
      } else {
        console.error("Paystack webhook event creation failed:", error);

        res.status(500).json({
          message: "Unable to record webhook event.",
        });
        return;
      }
    }
  }

  if (!eventRecord) {
    res.status(500).json({
      message: "Unable to retrieve webhook event.",
    });
    return;
  }

  // ============================================
  // 6. HANDLE ALREADY PROCESSED EVENTS
  // ============================================

  if (eventRecord.status === "processed") {
    res.status(200).json({
      received: true,
      message: "Webhook already processed.",
    });
    return;
  }

  // ============================================
  // 7. HANDLE CURRENTLY PROCESSING EVENTS
  // ============================================

  if (eventRecord.status === "processing") {
    const processingStartedAt = eventRecord.processingStartedAt;

    const isStillBeingProcessed =
      processingStartedAt instanceof Date &&
      processingStartedAt.getTime() > staleProcessingTime.getTime();

    if (isStillBeingProcessed) {
      res.status(200).json({
        received: true,
        message: "Webhook is already being processed.",
      });
      return;
    }
  }

  // ============================================
  // 8. CLAIM EVENT ATOMICALLY
  // ============================================

  const claimedEvent = await PaystackWebhookEvent.findOneAndUpdate(
    {
      _id: eventRecord._id,
      $or: [
        { status: "received" },
        { status: "failed" },
        {
          status: "processing",
          $or: [
            {
              processingStartedAt: {
                $lt: staleProcessingTime,
              },
            },
            {
              processingStartedAt: {
                $exists: false,
              },
            },
          ],
        },
      ],
    },
    {
      $set: {
        status: "processing",
        processingStartedAt: new Date(),
        payloadHash,
      },
      $inc: {
        processingAttempts: 1,
      },
      $unset: {
        failureReason: 1,
      },
    },
    { new: true },
  );

  if (!claimedEvent) {
    res.status(200).json({
      received: true,
      message: "Webhook is already being processed.",
    });
    return;
  }

  // ============================================
  // 9. PROCESS EVENT
  // ============================================

  try {
    // --------------------------------------------
    // TRANSACTION EVENTS
    // --------------------------------------------

    if (
      payload.event === "charge.success" ||
      payload.event === "charge.failed"
    ) {
      if (typeof reference !== "string" || reference.trim().length === 0) {
        throw new Error(
          "Paystack charge event does not contain a valid reference.",
        );
      }

      const normalizedReference = reference.trim();

      const payment = await Payment.findOne({
        reference: normalizedReference,
        gateway: "paystack",
      });

      if (!payment) {
        throw new Error(
          `No payment record found for reference ${normalizedReference}.`,
        );
      }

      // Always verify directly with Paystack.
      const verification = await verifyOrderPayment(
        payment.userId.toString(),
        payment.orderId.toString(),
        normalizedReference,
      );

      if (
        payload.event === "charge.success" &&
        verification.paymentStatus !== "success"
      ) {
        throw new Error(
          `Paystack has not yet confirmed successful payment for ${normalizedReference}. Webhook will be retried.`,
        );
      }

      if (
        payload.event === "charge.failed" &&
        !["success", "failed", "abandoned", "expired"].includes(
          verification.paymentStatus,
        )
      ) {
        throw new Error(
          `Paystack has not yet confirmed the final status for ${normalizedReference}. Webhook will be retried.`,
        );
      }
    }

    // --------------------------------------------
    // REFUND EVENTS
    // --------------------------------------------
    else if (REFUND_EVENTS.includes(payload.event)) {
      await processRefundWebhook(payload);
    }

    // --------------------------------------------
    // UNKNOWN EVENTS
    // --------------------------------------------
    else {
      // We have validated the signature and recorded the event.
      // Ignore unrelated event types instead of repeatedly
      // asking Paystack to resend events this application
      // does not currently handle.
      console.info(
        `Ignoring unsupported Paystack webhook event: ${payload.event}`,
      );
    }

    // ============================================
    // 10. MARK EVENT AS PROCESSED
    // ============================================

    const processedResult = await PaystackWebhookEvent.updateOne(
      {
        _id: claimedEvent._id,
        status: "processing",
      },
      {
        $set: {
          status: "processed",
          processedAt: new Date(),
        },
        $unset: {
          processingStartedAt: 1,
          failureReason: 1,
        },
      },
    );

    if (processedResult.modifiedCount !== 1) {
      throw new Error("Webhook event could not be marked as processed.");
    }

    res.status(200).json({
      received: true,
      message: "Webhook processed successfully.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown webhook processing error.";

    // ============================================
    // 11. MARK EVENT AS FAILED FOR RETRY
    // ============================================

    await PaystackWebhookEvent.updateOne(
      {
        _id: claimedEvent._id,
        status: "processing",
      },
      {
        $set: {
          status: "failed",
          failureReason: message,
        },
        $unset: {
          processingStartedAt: 1,
        },
      },
    );

    console.error("Paystack webhook processing failed:", error);

    res.status(500).json({
      message: "Webhook processing failed. Retry required.",
    });
  }
}
