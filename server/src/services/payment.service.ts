import { randomBytes } from "node:crypto";
import mongoose from "mongoose";

import { env } from "../config/env.js";
import OrderModel from "../models/Order.js";
import Payment from "../models/Payment.js";

const PAYSTACK_API_URL = "https://api.paystack.co";
const PAYMENT_WINDOW_MINUTES = 30;

export class PaymentServiceError extends Error {
  statusCode: number;
  uncertain: boolean;

  constructor(message: string, statusCode = 400, uncertain = false) {
    super(message);
    this.name = "PaymentServiceError";
    this.statusCode = statusCode;
    this.uncertain = uncertain;
  }
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface InitializePaymentResult {
  orderId: string;
  orderNumber: string;
  reference: string;
  amount: number;
  currency: string;
  authorizationUrl: string;
  reservationExpiresAt: Date;
}

// ============================================
// GENERATE UNIQUE PAYMENT REFERENCE
// ============================================

function generatePaymentReference(): string {
  return `OGM-PAY-${Date.now()}-${randomBytes(6)
    .toString("hex")
    .toUpperCase()}`;
}

// ============================================
// INITIALIZE PAYSTACK TRANSACTION
// ============================================

async function initializePaystackTransaction(payload: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  orderNumber: string;
  orderId: string;
}) {
  let response: Response;

  try {
    response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        amount: payload.amount,
        reference: payload.reference,
        currency: "NGN",
        callback_url: payload.callbackUrl,
        metadata: {
          orderId: payload.orderId,
          orderNumber: payload.orderNumber,
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: payload.orderNumber,
            },
          ],
        },
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error: unknown) {
    console.error("Paystack initialization request failed:", error);

    // The request may have reached Paystack even though
    // our server did not receive its response.
    throw new PaymentServiceError(
      "Payment initialization could not be confirmed. Your payment attempt has been preserved for reconciliation. Please contact support if this continues.",
      502,
      true,
    );
  }

  let result: PaystackInitializeResponse;

  try {
    result = (await response.json()) as PaystackInitializeResponse;
  } catch {
    // A malformed response does not prove that Paystack
    // rejected the initialization request.
    throw new PaymentServiceError(
      "The payment gateway returned an unreadable response. Your payment attempt has been preserved for reconciliation.",
      502,
      true,
    );
  }

  // A definitive API rejection.
  if (!response.ok || !result.status) {
    console.error("Paystack initialization rejected:", {
      status: response.status,
      message: result.message,
    });

    throw new PaymentServiceError(
      result.message || "Payment initialization was rejected.",
      502,
      false,
    );
  }

  // A successful response without valid authorization
  // details is ambiguous. Do not create another attempt.
  if (
    !result.data?.authorization_url ||
    !result.data?.access_code ||
    result.data.reference !== payload.reference
  ) {
    console.error("Invalid Paystack initialization response:", {
      reference: payload.reference,
      message: result.message,
    });

    throw new PaymentServiceError(
      "Paystack may have initialized your payment, but authorization details could not be confirmed. Please contact support.",
      502,
      true,
    );
  }

  return result.data;
}

// ============================================
// REUSE EXISTING ACTIVE PAYMENT
// ============================================

function buildExistingPaymentResult(
  order: {
    _id: mongoose.Types.ObjectId;
    orderNumber: string;
    reservationExpiresAt: Date;
  },
  payment: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    authorizationUrl?: string;
  },
): InitializePaymentResult {
  if (payment.status !== "pending" || !payment.authorizationUrl) {
    throw new PaymentServiceError(
      "A payment attempt is already being initialized or requires reconciliation. Please wait before trying again.",
      409,
    );
  }

  return {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    reference: payment.reference,
    amount: payment.amount,
    currency: payment.currency,
    authorizationUrl: payment.authorizationUrl,
    reservationExpiresAt: order.reservationExpiresAt,
  };
}

// ============================================
// PREPARE PAYMENT ATTEMPT TRANSACTIONALLY
// ============================================

async function preparePaymentAttempt(
  userId: string,
  orderId: string,
): Promise<{
  order: InstanceType<typeof OrderModel>;
  payment: InstanceType<typeof Payment>;
  reused: boolean;
}> {
  const session = await mongoose.startSession();

  let preparedOrder: InstanceType<typeof OrderModel> | null = null;
  let preparedPayment: InstanceType<typeof Payment> | null = null;
  let reused = false;

  try {
    await session.withTransaction(async () => {
      // ============================================
      // 1. LOAD CURRENT ORDER
      // ============================================

      const order = await OrderModel.findOne({
        _id: orderId,
        userId,
      }).session(session);

      if (!order) {
        throw new PaymentServiceError("Order not found.", 404);
      }

      // ============================================
      // 2. VALIDATE ORDER
      // ============================================

      if (order.paymentStatus === "paid") {
        throw new PaymentServiceError("This order has already been paid.", 409);
      }

      if (order.status !== "pending" || order.stockRestoredAt) {
        throw new PaymentServiceError(
          "This order is no longer available for payment. Please create a new order.",
          409,
        );
      }

      if (order.currency !== "NGN") {
        throw new PaymentServiceError("Unsupported order currency.", 400);
      }

      const now = new Date();

      if (order.reservationExpiresAt.getTime() <= now.getTime()) {
        throw new PaymentServiceError(
          "Your order reservation has expired. Please create a new order.",
          409,
        );
      }

      // ============================================
      // 3. CHECK EXISTING ACTIVE PAYMENT
      // ============================================

      const existingPayment = await Payment.findOne({
        orderId: order._id,
        userId,
        activeAttempt: true,
        status: {
          $in: ["initializing", "pending"],
        },
      }).session(session);

      if (existingPayment) {
        preparedOrder = order;
        preparedPayment = existingPayment;
        reused = true;
        return;
      }

      // ============================================
      // 4. VALIDATE PAYMENT AMOUNT
      // ============================================

      const amountInKobo = Math.round(order.total * 100);

      if (!Number.isSafeInteger(amountInKobo) || amountInKobo <= 0) {
        throw new PaymentServiceError("Invalid order payment amount.", 400);
      }

      if (!order.deliveryAddress.email) {
        throw new PaymentServiceError(
          "A valid customer email is required for payment.",
          400,
        );
      }

      // ============================================
      // 5. EXTEND RESERVATION BEFORE PAYSTACK REQUEST
      // ============================================
      // The expiration worker must not release stock
      // while the payment initialization request is running.

      const reservationExpiresAt = new Date(
        now.getTime() + PAYMENT_WINDOW_MINUTES * 60 * 1000,
      );

      const updatedOrder = await OrderModel.findOneAndUpdate(
        {
          _id: order._id,
          userId,
          status: "pending",
          paymentStatus: "pending",
          stockRestoredAt: null,
          reservationExpiresAt: {
            $gt: now,
          },
        },
        {
          $set: {
            reservationExpiresAt,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedOrder) {
        throw new PaymentServiceError(
          "Your order reservation has expired or is no longer available.",
          409,
        );
      }

      // ============================================
      // 6. GENERATE ATTEMPT NUMBER
      // ============================================
      // The order update above serializes concurrent
      // initialization transactions for this order.
      // The unique attempt-number index remains the
      // final database-level safeguard.

      const previousAttempts = await Payment.countDocuments({
        orderId: order._id,
      }).session(session);

      const attemptNumber = previousAttempts + 1;
      const reference = generatePaymentReference();

      // ============================================
      // 7. CREATE PAYMENT ATTEMPT
      // ============================================

      const [payment] = await Payment.create(
        [
          {
            orderId: order._id,
            userId: order.userId,
            reference,
            gateway: "paystack",
            attemptNumber,
            activeAttempt: true,
            amount: amountInKobo,
            currency: "NGN",
            status: "initializing",
            initializedAt: now,
            refundStatus: "not_required",
            refundCurrency: "NGN",
            refundAttemptCount: 0,
          },
        ],
        { session },
      );

      preparedOrder = updatedOrder;
      preparedPayment = payment;
      reused = false;
    });

    if (!preparedOrder || !preparedPayment) {
      throw new PaymentServiceError(
        "Payment attempt could not be prepared.",
        500,
      );
    }

    return {
      order: preparedOrder,
      payment: preparedPayment,
      reused,
    };
  } catch (error: unknown) {
    if (error instanceof PaymentServiceError) {
      throw error;
    }

    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new PaymentServiceError(
        "A payment attempt is already being created. Please retry shortly.",
        409,
      );
    }

    console.error("Payment preparation transaction failed:", error);

    throw new PaymentServiceError(
      "Unable to prepare your payment. Please try again.",
      500,
    );
  } finally {
    await session.endSession();
  }
}

// ============================================
// INITIALIZE PAYMENT FOR EXISTING ORDER
// ============================================

export async function initializeOrderPayment(
  userId: string,
  orderId: string,
): Promise<InitializePaymentResult> {
  // ============================================
  // 1. VALIDATE INPUT
  // ============================================

  if (!mongoose.isValidObjectId(orderId)) {
    throw new PaymentServiceError("Invalid order ID.", 400);
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new PaymentServiceError("Invalid customer account.", 401);
  }

  // ============================================
  // 2. PREPARE PAYMENT AND RESERVATION
  // ============================================

  const prepared = await preparePaymentAttempt(userId, orderId);

  const { order, payment, reused } = prepared;

  // ============================================
  // 3. REUSE EXISTING AUTHORIZATION
  // ============================================

  if (reused) {
    return buildExistingPaymentResult(order, payment);
  }

  const amountInKobo = payment.amount;
  const customerEmail = order.deliveryAddress.email;

  // ============================================
  // 4. INITIALIZE WITH PAYSTACK
  // ============================================

  let paystackData;

  try {
    const callbackUrl =
      `${env.CLIENT_URL}/checkout/confirmation` +
      `?orderId=${order._id.toString()}`;

    paystackData = await initializePaystackTransaction({
      email: customerEmail,
      amount: amountInKobo,
      reference: payment.reference,
      callbackUrl,
      orderNumber: order.orderNumber,
      orderId: order._id.toString(),
    });
  } catch (error: unknown) {
    const uncertain =
      error instanceof PaymentServiceError ? error.uncertain : true;

    const failureMessage =
      error instanceof Error
        ? error.message.slice(0, 500)
        : "Payment initialization failed.";

    // ============================================
    // 5. HANDLE DEFINITIVE OR AMBIGUOUS FAILURE
    // ============================================

    if (!uncertain) {
      // Paystack explicitly rejected initialization.
      // It is safe to close this local attempt.
      await Payment.updateOne(
        {
          _id: payment._id,
          status: "initializing",
          activeAttempt: true,
        },
        {
          $set: {
            status: "failed",
            activeAttempt: false,
            failureReason: failureMessage,
          },
        },
      );
    } else {
      // Do not mark an ambiguous request as failed.
      // Paystack may have accepted it, and the reference
      // must remain available for later verification.
      await Payment.updateOne(
        {
          _id: payment._id,
          status: "initializing",
          activeAttempt: true,
        },
        {
          $set: {
            failureReason: `Initialization outcome is uncertain: ${failureMessage}`,
          },
        },
      );
    }

    if (error instanceof PaymentServiceError) {
      throw error;
    }

    console.error("Payment initialization error:", error);

    throw new PaymentServiceError(
      "Unable to confirm payment initialization. Please try again later.",
      502,
      true,
    );
  }

  // ============================================
  // 6. SAVE AUTHORIZATION DETAILS
  // ============================================
  // The order may have been cancelled or expired while
  // Paystack was responding. Only an active initializing
  // attempt can become pending.

  const updatedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: "initializing",
      activeAttempt: true,
    },
    {
      $set: {
        status: "pending",
        authorizationUrl: paystackData.authorization_url,
        accessCode: paystackData.access_code,
        failureReason: "",
      },
    },
    {
      new: true,
    },
  );

  if (!updatedPayment) {
    // The transaction may have been initialized at Paystack,
    // but the order was cancelled/expired concurrently.
    // Do not return an authorization URL for a closed order.
    throw new PaymentServiceError(
      "Your order is no longer available for payment. If Paystack has already charged you, the payment will be reconciled.",
      409,
      true,
    );
  }

  // ============================================
  // 7. RETURN PAYMENT AUTHORIZATION
  // ============================================

  return {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    reference: updatedPayment.reference,
    amount: amountInKobo,
    currency: "NGN",
    authorizationUrl: paystackData.authorization_url,
    reservationExpiresAt: order.reservationExpiresAt,
  };
}
