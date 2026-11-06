import mongoose, { Schema } from "mongoose";

// ============================================
// FULFILMENT STATUSES
// ============================================

export const ORDER_FULFILMENT_STATUSES = [
  "pending_dispatch",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

// ============================================
// ORDER ITEMS
// ============================================

const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    condition: {
      type: String,
      enum: ["brand-new", "uk-used", "refurbished"],
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

// ============================================
// DELIVERY ADDRESS
// ============================================

const deliveryAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

// ============================================
// FULFILMENT HISTORY EVENT
// ============================================

const fulfilmentEventSchema = new Schema(
  {
    status: {
      type: String,
      enum: ORDER_FULFILMENT_STATUSES,
      required: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Null for system-generated events.
    // Populated for events created by an administrator.
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
// ORDER
// ============================================

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "An order must contain at least one item.",
      },
    },

    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },

    deliveryMethod: {
      type: String,
      enum: ["standard", "express", "same-day"],
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN"],
    },

    // ============================================
    // ORDER / PAYMENT LIFECYCLE
    // ============================================

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired", "fulfilled"],
      default: "pending",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      required: true,
    },

    // ============================================
    // CANONICAL SUCCESSFUL PAYMENT
    // ============================================

    // Identifies the exact Payment document that paid this order.
    // Optional for compatibility with existing orders.
    paidPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // Paystack reference belonging to the canonical payment.
    paymentReference: {
      type: String,
      trim: true,
      default: null,
    },

    // ============================================
    // FULFILMENT LIFECYCLE
    // ============================================

    // Separate from the payment/order lifecycle.
    // Set to pending_dispatch only after successful payment.
    // No default: unpaid orders must not appear ready for dispatch.
    fulfilmentStatus: {
      type: String,
      enum: ORDER_FULFILMENT_STATUSES,
      default: undefined,
    },

    // Actual fulfilment status changes.
    // Each event records its status, note, actor and timestamp.
    fulfilmentEvents: {
      type: [fulfilmentEventSchema],
      default: [],
    },

    // ============================================
    // STOCK RESERVATION
    // ============================================

    reservationExpiresAt: {
      type: Date,
      required: true,
    },

    stockRestoredAt: {
      type: Date,
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

orderSchema.index({ userId: 1, createdAt: -1 });

orderSchema.index({ status: 1, reservationExpiresAt: 1 });

orderSchema.index({ orderNumber: 1 }, { unique: true });

// Find orders by their successful payment reference.
orderSchema.index(
  { paymentReference: 1 },
  {
    sparse: true,
  },
);

// Admin order filtering and fulfilment management.
orderSchema.index({
  fulfilmentStatus: 1,
  createdAt: -1,
});

// ============================================
// MODEL
// ============================================

const OrderModel =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default OrderModel;
