import mongoose, { Schema } from "mongoose";

// ============================================
// DELIVERY ZONE STATUS
// ============================================

export const DELIVERY_ZONE_STATUSES = ["active", "inactive"] as const;

// ============================================
// DELIVERY ZONE
// ============================================

const deliveryZoneSchema = new Schema(
  {
    name: {
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

    locations: {
      type: [String],
      required: true,
      default: [],
      validate: [
        {
          validator: (value: string[]) => value.length > 0,
          message: "A delivery zone must contain at least one location.",
        },
        {
          validator: (value: string[]) =>
            value.every(
              (location) =>
                typeof location === "string" &&
                location.trim().length > 0 &&
                location.trim().length <= 100,
            ),
          message:
            "Every delivery location must be between 1 and 100 characters.",
        },
        {
          validator: (value: string[]) => {
            const normalized = value.map((location) =>
              location.trim().toLowerCase(),
            );

            return new Set(normalized).size === normalized.length;
          },
          message: "A delivery zone cannot contain duplicate locations.",
        },
      ],
    },

    estimatedDelivery: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    status: {
      type: String,
      enum: DELIVERY_ZONE_STATUSES,
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

// Prevent duplicate zone names within the same state,
// regardless of letter case.
deliveryZoneSchema.index(
  {
    name: 1,
    state: 1,
  },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  },
);

// Efficiently retrieve active delivery zones by state.
deliveryZoneSchema.index({
  status: 1,
  state: 1,
});

// ============================================
// MODEL
// ============================================

const DeliveryZoneModel =
  mongoose.models.DeliveryZone ||
  mongoose.model("DeliveryZone", deliveryZoneSchema);

export default DeliveryZoneModel;
