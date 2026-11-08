import mongoose, { Schema, Types } from "mongoose";

// ============================================
// DISPATCH STATUSES
// ============================================

export const DISPATCH_STATUSES = [
  "pending",
  "dispatched",
  "in_transit",
  "delivered",
] as const;

export type DispatchStatus = (typeof DISPATCH_STATUSES)[number];

// ============================================
// DELIVERY PARTNERS
// ============================================

export const DELIVERY_PARTNERS = [
  "GIGL Logistics",
  "Sendbox",
  "Ogim Delivery",
  "DHL",
  "Other",
] as const;

export type DeliveryPartner = (typeof DELIVERY_PARTNERS)[number];

// ============================================
// DISPATCH STATUS HISTORY
// ============================================

const dispatchHistorySchema = new Schema(
  {
    previousStatus: {
      type: String,
      enum: DISPATCH_STATUSES,
      default: null,
    },

    status: {
      type: String,
      enum: DISPATCH_STATUSES,
      required: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Null for system-generated events.
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: true,
    versionKey: false,
  },
);

// ============================================
// DISPATCH
// ============================================

const dispatchSchema = new Schema(
  {
    // ============================================
    // ORDER REFERENCES
    // ============================================

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Stored for convenient admin filtering and display.
    orderNumber: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ============================================
    // DELIVERY PARTNER
    // ============================================

    deliveryPartner: {
      type: String,
      enum: DELIVERY_PARTNERS,
      default: null,
    },

    trackingNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      maxlength: 100,
    },

    // ============================================
    // DISPATCH STATUS
    // ============================================

    status: {
      type: String,
      enum: DISPATCH_STATUSES,
      default: "pending",
      required: true,
    },

    // ============================================
    // DELIVERY TIMELINE
    // ============================================

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    dispatchedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    // ============================================
    // STATUS HISTORY
    // ============================================

    statusHistory: {
      type: [dispatchHistorySchema],
      default: [],
    },

    // Admin who initially assigned the dispatch.
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

// One dispatch record per order.
dispatchSchema.index({ orderId: 1 }, { unique: true });

// Prevent duplicate tracking numbers.
// Multiple null tracking numbers are allowed.
dispatchSchema.index(
  { trackingNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      trackingNumber: { $type: "string" },
    },
  },
);

// Admin dispatch filtering and pagination.
dispatchSchema.index({
  status: 1,
  createdAt: -1,
});

dispatchSchema.index({
  deliveryPartner: 1,
  status: 1,
});

dispatchSchema.index({
  userId: 1,
  createdAt: -1,
});

dispatchSchema.index({
  orderNumber: 1,
});

// ============================================
// MODEL
// ============================================

const DispatchModel =
  mongoose.models.Dispatch || mongoose.model("Dispatch", dispatchSchema);

export default DispatchModel;
