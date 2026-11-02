import mongoose, { Schema } from "mongoose";

export const WEBHOOK_PROCESSING_STATUSES = [
  "received",
  "processing",
  "processed",
  "failed",
] as const;

export type WebhookProcessingStatus =
  (typeof WEBHOOK_PROCESSING_STATUSES)[number];

export interface IPaystackWebhookEvent {
  eventKey: string;
  event: string;

  reference?: string;
  transactionId?: string;

  payloadHash: string;

  status: WebhookProcessingStatus;

  processingAttempts: number;
  processingStartedAt?: Date;
  processedAt?: Date;

  failureReason?: string;
}

const paystackWebhookEventSchema = new Schema<IPaystackWebhookEvent>(
  {
    // Deterministic key used to identify duplicate events.
    eventKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    event: {
      type: String,
      required: true,
      trim: true,
    },

    reference: {
      type: String,
      trim: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    // Store a hash instead of retaining the complete webhook payload.
    payloadHash: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: WEBHOOK_PROCESSING_STATUSES,
      default: "received",
      required: true,
    },

    processingAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    processingStartedAt: Date,
    processedAt: Date,

    failureReason: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

paystackWebhookEventSchema.index({
  status: 1,
  createdAt: 1,
});

paystackWebhookEventSchema.index({
  reference: 1,
  createdAt: -1,
});

const PaystackWebhookEvent =
  mongoose.models.PaystackWebhookEvent ||
  mongoose.model<IPaystackWebhookEvent>(
    "PaystackWebhookEvent",
    paystackWebhookEventSchema,
  );

export default PaystackWebhookEvent;
