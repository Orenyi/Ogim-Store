import mongoose, { Schema, Types } from "mongoose";

export const PAYMENT_STATUSES = [
  "initializing",
  "pending",
  "success",
  "failed",
  "abandoned",
  "expired",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const REFUND_STATUSES = [
  "not_required",
  "required",
  "pending",
  "processing",
  "success",
  "failed",
] as const;

export type RefundStatus = (typeof REFUND_STATUSES)[number];

export interface IPayment {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;

  reference: string;
  gateway: "paystack";

  attemptNumber: number;
  activeAttempt: boolean;

  amount: number;
  currency: "NGN";

  status: PaymentStatus;

  authorizationUrl?: string;
  accessCode?: string;

  channel?: string;
  failureReason?: string;

  initializedAt?: Date;
  paidAt?: Date;
  verifiedAt?: Date;
  lastWebhookAt?: Date;

  // Refund tracking
  refundStatus: RefundStatus;
  refundAmount?: number;
  refundCurrency: "NGN";

  refundReason?: string;
  refundFailureReason?: string;

  refundProviderId?: string;

  refundRequestedAt?: Date;
  refundProcessedAt?: Date;
  refundUpdatedAt?: Date;

  refundAttemptCount: number;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    gateway: {
      type: String,
      enum: ["paystack"],
      default: "paystack",
      required: true,
    },

    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    activeAttempt: {
      type: Boolean,
      default: false,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Payment amount must be a valid integer in kobo.",
      },
    },

    currency: {
      type: String,
      enum: ["NGN"],
      default: "NGN",
      required: true,
    },

    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "initializing",
      required: true,
    },

    authorizationUrl: {
      type: String,
      trim: true,
    },

    accessCode: {
      type: String,
      trim: true,
    },

    channel: {
      type: String,
      trim: true,
    },

    failureReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    initializedAt: Date,
    paidAt: Date,
    verifiedAt: Date,
    lastWebhookAt: Date,

    // ============================================
    // REFUND TRACKING
    // ============================================

    refundStatus: {
      type: String,
      enum: REFUND_STATUSES,
      default: "not_required",
      required: true,
      index: true,
    },

    refundAmount: {
      type: Number,
      min: 1,
      validate: {
        validator: (value: number | undefined) =>
          value === undefined || Number.isSafeInteger(value),
        message: "Refund amount must be a valid integer in kobo.",
      },
    },

    refundCurrency: {
      type: String,
      enum: ["NGN"],
      default: "NGN",
      required: true,
    },

    refundReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    refundFailureReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Paystack's refund identifier, when provided.
    refundProviderId: {
      type: String,
      trim: true,
    },

    refundRequestedAt: Date,
    refundProcessedAt: Date,
    refundUpdatedAt: Date,

    refundAttemptCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Refund attempt count must be a whole number.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ============================================
// INDEXES
// ============================================

paymentSchema.index({ orderId: 1, attemptNumber: 1 }, { unique: true });

// Only one active payment attempt per order.
paymentSchema.index(
  { orderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      activeAttempt: true,
    },
  },
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Supports finding payments that require refund processing.
paymentSchema.index({
  refundStatus: 1,
  refundRequestedAt: 1,
});

const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
