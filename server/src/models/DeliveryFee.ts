import mongoose, { Schema } from "mongoose";

// ============================================
// DELIVERY FEE STATUS
// ============================================

export const DELIVERY_FEE_STATUSES = ["active", "inactive"] as const;

// ============================================
// DELIVERY FEE
// ============================================

const deliveryFeeSchema = new Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "Nigeria",
      maxlength: 100,
    },

    fee: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value: number) => Number.isSafeInteger(value),
        message: "Delivery fee must be a valid whole number.",
      },
    },

    estimatedDelivery: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    status: {
      type: String,
      enum: DELIVERY_FEE_STATUSES,
      default: "active",
      required: true,
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

// Prevent duplicate delivery fee records for the same
// location, state and country, regardless of letter case.
deliveryFeeSchema.index(
  {
    location: 1,
    state: 1,
    country: 1,
  },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  },
);

// Efficiently retrieve active delivery fees by location.
deliveryFeeSchema.index({
  status: 1,
  state: 1,
  location: 1,
});

// ============================================
// MODEL
// ============================================

const DeliveryFeeModel =
  mongoose.models.DeliveryFee ||
  mongoose.model("DeliveryFee", deliveryFeeSchema);

export default DeliveryFeeModel;
