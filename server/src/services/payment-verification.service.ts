import mongoose from "mongoose";

import { env } from "../config/env.js";
import OrderModel from "../models/Order.js";
import Payment from "../models/Payment.js";
import { createPurchasePaidNotifications } from "./admin-notification.service.js";

const PAYSTACK_API_URL = "https://api.paystack.co";

const RECHECKABLE_PAYMENT_STATUSES = [
  "initializing",
  "pending",
  "failed",
  "abandoned",
  "expired",
] as const;

// ============================================
// ERRORS
// ============================================

export class PaymentVerificationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "PaymentVerificationError";
    this.statusCode = statusCode;
  }
}

// ============================================
// PAYSTACK RESPONSE TYPES
// ============================================

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel?: string;
    transaction_date?: string;
  };
}

// ============================================
// ORDER RESPONSE TYPE
// ============================================

export interface VerifiedOrderSnapshot {
  _id: string;
  orderNumber: string;
  userId: string;

  items: {
    productId: string;
    name: string;
    slug: string;
    brand: string;
    model: string;
    condition: "brand-new" | "uk-used" | "refurbished";
    image: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];

  deliveryAddress: {
    fullName: string;
    email: string;
    phone: string;
    state: string;
    city: string;
    address: string;
    instructions?: string;
  };

  deliveryMethod: "standard" | "express" | "same-day";

  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: "NGN";

  status: "pending" | "confirmed" | "cancelled" | "expired" | "fulfilled";

  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  paidPaymentId: string | null;
  paymentReference: string | null;

  reservationExpiresAt: string;
  stockRestoredAt: string | null;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// PAYMENT VERIFICATION RESULT
// ============================================

export interface PaymentVerificationResult {
  verified: boolean;
  paymentStatus: string;
  orderStatus: string;
  orderId: string;
  orderNumber: string;
  reference: string;
  amount: number;
  currency: string;
  message: string;
  order: VerifiedOrderSnapshot;
}

// ============================================
// SERIALIZE ORDER FOR API RESPONSE
// ============================================

function serializeOrder(order: {
  toObject: () => Record<string, unknown>;
}): VerifiedOrderSnapshot {
  const data = order.toObject();

  const items = (data.items ?? []) as Array<Record<string, unknown>>;

  const deliveryAddress = (data.deliveryAddress ?? {}) as Record<
    string,
    unknown
  >;

  return {
    _id: String(data._id),
    orderNumber: String(data.orderNumber),
    userId: String(data.userId),

    items: items.map((item) => ({
      productId: String(item.productId),
      name: String(item.name),
      slug: String(item.slug),
      brand: String(item.brand),
      model: String(item.model),
      condition: item.condition as "brand-new" | "uk-used" | "refurbished",
      image: String(item.image ?? ""),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),

    deliveryAddress: {
      fullName: String(deliveryAddress.fullName ?? ""),
      email: String(deliveryAddress.email ?? ""),
      phone: String(deliveryAddress.phone ?? ""),
      state: String(deliveryAddress.state ?? ""),
      city: String(deliveryAddress.city ?? ""),
      address: String(deliveryAddress.address ?? ""),
      instructions: String(deliveryAddress.instructions ?? ""),
    },

    deliveryMethod: data.deliveryMethod as "standard" | "express" | "same-day",

    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.deliveryFee),
    total: Number(data.total),
    currency: data.currency as "NGN",

    status: data.status as VerifiedOrderSnapshot["status"],

    paymentStatus: data.paymentStatus as VerifiedOrderSnapshot["paymentStatus"],

    paidPaymentId: data.paidPaymentId ? String(data.paidPaymentId) : null,

    paymentReference: data.paymentReference
      ? String(data.paymentReference)
      : null,

    reservationExpiresAt: new Date(
      data.reservationExpiresAt as Date,
    ).toISOString(),

    stockRestoredAt: data.stockRestoredAt
      ? new Date(data.stockRestoredAt as Date).toISOString()
      : null,

    createdAt: new Date(data.createdAt as Date).toISOString(),
    updatedAt: new Date(data.updatedAt as Date).toISOString(),
  };
}

// ============================================
// BUILD VERIFICATION RESULT
// ============================================

function buildVerificationResult(
  order: Parameters<typeof serializeOrder>[0],
  payment: {
    reference: string;
    amount: number;
    currency: string;
  },
  options: {
    verified: boolean;
    paymentStatus: string;
    message: string;
  },
): PaymentVerificationResult {
  const serializedOrder = serializeOrder(order);

  return {
    verified: options.verified,
    paymentStatus: options.paymentStatus,
    orderStatus: serializedOrder.status,
    orderId: serializedOrder._id,
    orderNumber: serializedOrder.orderNumber,
    reference: payment.reference,
    amount: payment.amount,
    currency: payment.currency,
    message: options.message,
    order: serializedOrder,
  };
}

// ============================================
// CREATE PURCHASE NOTIFICATIONS
// ============================================

async function notifyAdminsOfSuccessfulPayment(
  result: PaymentVerificationResult,
): Promise<void> {
  const order = result.order;

  // Only notify for a verified, canonically paid order.
  if (
    result.verified !== true ||
    result.paymentStatus !== "success" ||
    order.paymentStatus !== "paid" ||
    order.status === "cancelled" ||
    !order.paidPaymentId ||
    !order.paymentReference
  ) {
    return;
  }

  try {
    await createPurchasePaidNotifications({
      paymentId: order.paidPaymentId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.deliveryAddress.fullName || "A customer",
      amount: order.total,
      currency: order.currency,
      paymentReference: order.paymentReference,
    });
  } catch (error: unknown) {
    // Notification failures must never affect payment verification.
    console.error(
      "[Admin Notifications] Failed to create purchase notifications:",
      error,
    );
  }
}

// ============================================
// VERIFY TRANSACTION DIRECTLY WITH PAYSTACK
// ============================================

async function verifyPaystackTransaction(
  reference: string,
): Promise<NonNullable<PaystackVerifyResponse["data"]>> {
  let response: Response;

  try {
    response = await fetch(
      `${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(20000),
      },
    );
  } catch (error: unknown) {
    console.error("Paystack verification request failed:", error);

    throw new PaymentVerificationError(
      "Unable to contact the payment gateway. Please try again.",
      502,
    );
  }

  let result: PaystackVerifyResponse;

  try {
    result = (await response.json()) as PaystackVerifyResponse;
  } catch {
    throw new PaymentVerificationError(
      "The payment gateway returned an invalid verification response.",
      502,
    );
  }

  if (!response.ok || !result.status || !result.data) {
    console.error("Paystack verification API error:", {
      status: response.status,
      message: result.message,
    });

    throw new PaymentVerificationError(
      "Unable to verify this payment with Paystack.",
      502,
    );
  }

  return result.data;
}

// ============================================
// GET LATEST PAYMENT AND ORDER
// ============================================

async function getLatestRecords(
  paymentId: mongoose.Types.ObjectId,
  orderId: string,
  userId: string,
) {
  const [payment, order] = await Promise.all([
    Payment.findById(paymentId),
    OrderModel.findOne({
      _id: orderId,
      userId,
    }),
  ]);

  if (!payment || !order) {
    throw new PaymentVerificationError(
      "Unable to retrieve updated payment information.",
      404,
    );
  }

  return {
    payment,
    order,
  };
}

// ============================================
// RECORD PAYMENT SUCCESS REQUIRING REFUND
// ============================================

async function markPaymentForRefund(
  paymentId: mongoose.Types.ObjectId,
  reason: string,
  session: mongoose.ClientSession,
  now: Date,
  transactionDate?: string,
  channel?: string,
) {
  const updatedPayment = await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      status: {
        $in: [...RECHECKABLE_PAYMENT_STATUSES, "success"],
      },
      refundStatus: {
        $in: ["not_required", "required"],
      },
    },
    {
      $set: {
        status: "success",
        activeAttempt: false,

        paidAt: transactionDate ? new Date(transactionDate) : now,

        verifiedAt: now,

        channel: channel ?? "",

        refundStatus: "required",

        refundAmount: undefined,

        refundReason: reason,

        failureReason: reason,
      },
    },
    {
      new: true,
      session,
    },
  );

  if (!updatedPayment) {
    throw new PaymentVerificationError(
      "Payment reconciliation could not be recorded. Please retry.",
      409,
    );
  }

  // Use the verified transaction amount as the refund amount.
  updatedPayment.refundAmount = updatedPayment.amount;

  await updatedPayment.save({ session });

  return updatedPayment;
}

// ============================================
// VERIFY CUSTOMER ORDER PAYMENT
// ============================================

export async function verifyOrderPayment(
  userId: string,
  orderId: string,
  reference: string,
): Promise<PaymentVerificationResult> {
  // ============================================
  // 1. VALIDATE INPUT
  // ============================================

  if (!mongoose.isValidObjectId(userId)) {
    throw new PaymentVerificationError("Invalid customer account.", 401);
  }

  if (!mongoose.isValidObjectId(orderId)) {
    throw new PaymentVerificationError("Invalid order ID.", 400);
  }

  if (
    typeof reference !== "string" ||
    reference.trim().length < 10 ||
    reference.trim().length > 150
  ) {
    throw new PaymentVerificationError(
      "A valid payment reference is required.",
      400,
    );
  }

  const normalizedReference = reference.trim();

  // ============================================
  // 2. FIND PAYMENT ATTEMPT
  // ============================================

  const payment = await Payment.findOne({
    orderId,
    userId,
    reference: normalizedReference,
    gateway: "paystack",
  });

  if (!payment) {
    throw new PaymentVerificationError(
      "Payment reference does not belong to this order.",
      404,
    );
  }

  // ============================================
  // 3. FIND CUSTOMER ORDER
  // ============================================

  const order = await OrderModel.findOne({
    _id: orderId,
    userId,
  });

  if (!order) {
    throw new PaymentVerificationError("Order not found.", 404);
  }

  // ============================================
  // 4. HANDLE ALREADY RECORDED SUCCESS
  // ============================================

  if (payment.status === "success") {
    const isCanonicalPayment =
      order.paymentStatus === "paid" &&
      order.paidPaymentId?.toString() === payment._id.toString();

    if (isCanonicalPayment) {
      const verificationResult = buildVerificationResult(order, payment, {
        verified: true,
        paymentStatus: "success",
        message: "This payment has already been verified.",
      });

      // Retry notification creation if an earlier attempt failed.
      await notifyAdminsOfSuccessfulPayment(verificationResult);

      return verificationResult;
    }

    // A successful payment that did not pay this order
    // must not be reported as the canonical order payment.

    if (payment.refundStatus === "not_required") {
      const reason =
        order.paymentStatus === "paid"
          ? "Duplicate successful payment detected. Refund review required."
          : "Successful payment received, but the order is no longer payable. Refund review required.";

      await Payment.updateOne(
        {
          _id: payment._id,
          status: "success",
          refundStatus: "not_required",
        },
        {
          $set: {
            refundStatus: "required",
            refundAmount: payment.amount,
            refundReason: reason,
            failureReason: reason,
          },
        },
      );
    }

    const latest = await getLatestRecords(payment._id, orderId, userId);

    return buildVerificationResult(latest.order, latest.payment, {
      verified: false,
      paymentStatus: "success",
      message:
        latest.payment.refundStatus === "success"
          ? "This payment has already been refunded."
          : "Payment was received, but it is not the payment that confirmed this order. Refund review is required. Please contact Ogim Store support.",
    });
  }

  // ============================================
  // 5. VERIFY DIRECTLY WITH PAYSTACK
  // ============================================
  // Closed local attempts must still be checked.
  // Paystack may have charged the customer after the
  // local order reservation was released.

  const paystackData = await verifyPaystackTransaction(normalizedReference);

  // ============================================
  // 6. VALIDATE REFERENCE
  // ============================================

  if (paystackData.reference !== payment.reference) {
    throw new PaymentVerificationError(
      "Payment reference does not match our records.",
      400,
    );
  }

  // ============================================
  // 7. VALIDATE AMOUNT
  // ============================================

  const expectedAmount = Math.round(order.total * 100);

  if (
    !Number.isSafeInteger(expectedAmount) ||
    expectedAmount <= 0 ||
    paystackData.amount !== expectedAmount ||
    payment.amount !== expectedAmount
  ) {
    throw new PaymentVerificationError(
      "Payment amount does not match the order total.",
      400,
    );
  }

  // ============================================
  // 8. VALIDATE CURRENCY
  // ============================================

  if (
    paystackData.currency !== "NGN" ||
    payment.currency !== "NGN" ||
    order.currency !== "NGN"
  ) {
    throw new PaymentVerificationError(
      "Payment currency does not match the order currency.",
      400,
    );
  }

  // ============================================
  // 9. HANDLE NON-SUCCESS PAYSTACK STATUSES
  // ============================================

  if (paystackData.status !== "success") {
    if (
      paystackData.status === "failed" ||
      paystackData.status === "abandoned"
    ) {
      await Payment.updateOne(
        {
          _id: payment._id,
          status: {
            $in: ["initializing", "pending"],
          },
          activeAttempt: true,
        },
        {
          $set: {
            status: paystackData.status,
            activeAttempt: false,
            verifiedAt: new Date(),
            failureReason: `Paystack transaction status: ${paystackData.status}`,
          },
        },
      );

      const latest = await getLatestRecords(payment._id, orderId, userId);

      if (latest.payment.status === "success") {
        const canonical =
          latest.order.paidPaymentId?.toString() ===
          latest.payment._id.toString();

        const verificationResult = buildVerificationResult(
          latest.order,
          latest.payment,
          {
            verified: canonical && latest.order.paymentStatus === "paid",
            paymentStatus: "success",
            message: canonical
              ? "Payment has already been verified."
              : "Payment requires reconciliation.",
          },
        );

        await notifyAdminsOfSuccessfulPayment(verificationResult);

        return verificationResult;
      }

      return buildVerificationResult(latest.order, latest.payment, {
        verified: false,
        paymentStatus: latest.payment.status,
        message: "Paystack reports that this payment was not completed.",
      });
    }

    // Do not reopen locally closed attempts if Paystack
    // currently reports pending or ongoing.

    const latest = await getLatestRecords(payment._id, orderId, userId);

    return buildVerificationResult(latest.order, latest.payment, {
      verified: false,
      paymentStatus: latest.payment.status,
      message:
        "Paystack has not confirmed a successful payment yet. The transaction may still be processing.",
    });
  }

  // ============================================
  // 10. PROCESS SUCCESSFUL PAYMENT TRANSACTIONALLY
  // ============================================

  const session = await mongoose.startSession();

  try {
    const verificationResult = await session.withTransaction(
      async (): Promise<PaymentVerificationResult> => {
        const currentPayment = await Payment.findOne({
          _id: payment._id,
          reference: normalizedReference,
          userId,
          orderId,
        }).session(session);

        const currentOrder = await OrderModel.findOne({
          _id: orderId,
          userId,
        }).session(session);

        if (!currentPayment || !currentOrder) {
          throw new PaymentVerificationError(
            "Payment or order could not be found.",
            404,
          );
        }

        const now = new Date();

        // ============================================
        // 11. IDEMPOTENCY
        // ============================================

        if (currentPayment.status === "success") {
          const isCanonicalPayment =
            currentOrder.paymentStatus === "paid" &&
            currentOrder.paidPaymentId?.toString() ===
              currentPayment._id.toString();

          if (isCanonicalPayment) {
            return buildVerificationResult(currentOrder, currentPayment, {
              verified: true,
              paymentStatus: "success",
              message: "Payment has already been verified.",
            });
          }

          // A successful payment that is not the canonical
          // order payment is a duplicate or late charge.

          const updatedPayment = await markPaymentForRefund(
            currentPayment._id,
            currentOrder.paymentStatus === "paid"
              ? "Duplicate successful payment detected. Refund review required."
              : "Successful payment received, but the order is no longer payable. Refund review required.",
            session,
            now,
            paystackData.transaction_date,
            paystackData.channel,
          );

          return buildVerificationResult(currentOrder, updatedPayment, {
            verified: false,
            paymentStatus: "success",
            message:
              "This successful payment does not belong to the payment attempt that confirmed the order. Refund review is required.",
          });
        }

        // ============================================
        // 12. VALIDATE LOCAL PAYMENT STATUS
        // ============================================

        if (
          !RECHECKABLE_PAYMENT_STATUSES.includes(
            currentPayment.status as (typeof RECHECKABLE_PAYMENT_STATUSES)[number],
          )
        ) {
          throw new PaymentVerificationError(
            "This payment attempt requires manual reconciliation.",
            409,
          );
        }

        // ============================================
        // 13. CHECK STOCK RESERVATION
        // ============================================

        const reservationIsValid =
          currentOrder.status === "pending" &&
          currentOrder.paymentStatus === "pending" &&
          !currentOrder.stockRestoredAt &&
          currentOrder.reservationExpiresAt.getTime() > now.getTime();

        // ============================================
        // 14. LATE PAYMENT OR DUPLICATE PAYMENT
        // ============================================

        if (!reservationIsValid) {
          const reason =
            currentOrder.paymentStatus === "paid"
              ? "Duplicate successful payment detected. Refund review required."
              : "Paystack confirmed payment after the order reservation expired or the order was cancelled. Refund review required.";

          const updatedPayment = await markPaymentForRefund(
            currentPayment._id,
            reason,
            session,
            now,
            paystackData.transaction_date,
            paystackData.channel,
          );

          // Do not confirm or reopen this order.
          // Its stock may already have been restored.

          return buildVerificationResult(currentOrder, updatedPayment, {
            verified: false,
            paymentStatus: "success",
            message:
              "Paystack confirmed your payment, but this order is no longer payable. The payment has been recorded for refund review. Please contact Ogim Store support.",
          });
        }

        // ============================================
        // 15. CLAIM ORDER AS PAID BY THIS PAYMENT
        // ============================================

        const updatedOrder = await OrderModel.findOneAndUpdate(
          {
            _id: currentOrder._id,
            userId,
            status: "pending",
            paymentStatus: "pending",
            paidPaymentId: null,
            paymentReference: null,
            stockRestoredAt: null,
            reservationExpiresAt: {
              $gt: now,
            },
          },
          {
            $set: {
              status: "confirmed",
              paymentStatus: "paid",
              paidPaymentId: currentPayment._id,
              paymentReference: currentPayment.reference,

              // Initialize fulfilment only after successful payment.
              fulfilmentStatus: "pending_dispatch",
            },

            // Record the initial system-generated fulfilment event
            // in the same transaction as order confirmation.
            $push: {
              fulfilmentEvents: {
                status: "pending_dispatch",
                note: "Payment verified. Order is awaiting dispatch.",
                adminId: null,
                createdAt: now,
              },
            },
          },
          {
            new: true,
            session,
          },
        );

        if (!updatedOrder) {
          // A concurrent request may have paid or cancelled
          // the order. Reload it before deciding the outcome.

          const latestOrder = await OrderModel.findById(
            currentOrder._id,
          ).session(session);

          if (!latestOrder) {
            throw new PaymentVerificationError(
              "Order could not be retrieved.",
              404,
            );
          }

          if (
            latestOrder.paymentStatus === "paid" &&
            latestOrder.paidPaymentId?.toString() ===
              currentPayment._id.toString()
          ) {
            const latestPayment = await Payment.findById(
              currentPayment._id,
            ).session(session);

            if (!latestPayment) {
              throw new PaymentVerificationError(
                "Payment could not be retrieved.",
                404,
              );
            }

            return buildVerificationResult(latestOrder, latestPayment, {
              verified: true,
              paymentStatus: "success",
              message: "Payment has already been verified.",
            });
          }

          const reason =
            latestOrder.paymentStatus === "paid"
              ? "Duplicate successful payment detected during concurrent verification. Refund review required."
              : "Payment succeeded after the order became unavailable. Refund review required.";

          const updatedPayment = await markPaymentForRefund(
            currentPayment._id,
            reason,
            session,
            now,
            paystackData.transaction_date,
            paystackData.channel,
          );

          return buildVerificationResult(latestOrder, updatedPayment, {
            verified: false,
            paymentStatus: "success",
            message:
              "Payment was successful, but the order could not be confirmed. Refund review is required.",
          });
        }

        // ============================================
        // 16. MARK CANONICAL PAYMENT SUCCESSFUL
        // ============================================

        const paymentUpdate = await Payment.updateOne(
          {
            _id: currentPayment._id,
            status: {
              $in: [...RECHECKABLE_PAYMENT_STATUSES],
            },
          },
          {
            $set: {
              status: "success",
              activeAttempt: false,

              paidAt: paystackData.transaction_date
                ? new Date(paystackData.transaction_date)
                : now,

              verifiedAt: now,

              channel: paystackData.channel ?? "",

              failureReason: "",

              refundStatus: "not_required",
            },
          },
          { session },
        );

        if (paymentUpdate.modifiedCount !== 1) {
          throw new PaymentVerificationError(
            "Payment status changed during verification. Please retry.",
            409,
          );
        }

        // ============================================
        // 17. CLOSE OTHER ACTIVE PAYMENT ATTEMPTS
        // ============================================

        await Payment.updateMany(
          {
            orderId: currentOrder._id,
            _id: {
              $ne: currentPayment._id,
            },
            status: {
              $in: ["initializing", "pending"],
            },
            activeAttempt: true,
          },
          {
            $set: {
              status: "abandoned",
              activeAttempt: false,
              failureReason:
                "Another payment attempt successfully paid this order. Any later successful charge requires refund review.",
            },
          },
          { session },
        );

        // ============================================
        // 18. RETURN CONFIRMED ORDER
        // ============================================

        const updatedPayment = await Payment.findById(
          currentPayment._id,
        ).session(session);

        if (!updatedPayment) {
          throw new PaymentVerificationError(
            "Payment could not be retrieved after confirmation.",
            404,
          );
        }

        return buildVerificationResult(updatedOrder, updatedPayment, {
          verified: true,
          paymentStatus: "success",
          message: "Payment verified and order confirmed successfully.",
        });
      },
    );

    if (!verificationResult) {
      throw new PaymentVerificationError(
        "Payment verification could not be completed.",
        500,
      );
    }

    // ============================================
    // 19. NOTIFY ADMINS AFTER TRANSACTION COMMIT
    // ============================================

    // This is deliberately outside session.withTransaction().
    // It also handles concurrent verification and retries.
    // The notification service's unique event key prevents
    // duplicate notification records for the same payment.

    await notifyAdminsOfSuccessfulPayment(verificationResult);

    return verificationResult;
  } catch (error: unknown) {
    if (error instanceof PaymentVerificationError) {
      throw error;
    }

    console.error("Payment verification transaction failed:", error);

    throw new PaymentVerificationError(
      "Unable to complete payment verification. Please try again.",
      500,
    );
  } finally {
    await session.endSession();
  }
}
