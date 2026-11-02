import mongoose, { Schema } from "mongoose";

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

const OrderModel =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default OrderModel;
