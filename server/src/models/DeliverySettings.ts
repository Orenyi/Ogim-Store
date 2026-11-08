import mongoose, { Schema } from "mongoose";

const deliverySettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
      immutable: true,
    },

    defaultFee: {
      type: Number,
      required: true,
      min: 0,
      default: 2500,
      validate: {
        validator: (value: number) => Number.isSafeInteger(value),
        message: "Default delivery fee must be a valid whole number.",
      },
    },

    freeDeliveryThreshold: {
      type: Number,
      default: 500000,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value === null || Number.isSafeInteger(value),
        message: "Free delivery threshold must be a valid whole number.",
      },
    },

    currency: {
      type: String,
      enum: ["NGN"],
      default: "NGN",
      required: true,
    },

    allowStandardDelivery: {
      type: Boolean,
      default: true,
      required: true,
    },

    allowExpressDelivery: {
      type: Boolean,
      default: false,
      required: true,
    },

    expressDeliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 5000,
      validate: {
        validator: (value: number) => Number.isSafeInteger(value),
        message: "Express delivery fee must be a valid whole number.",
      },
    },

    defaultEstimatedDelivery: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "2–3 days",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const DeliverySettingsModel =
  mongoose.models.DeliverySettings ||
  mongoose.model("DeliverySettings", deliverySettingsSchema);

export default DeliverySettingsModel;
