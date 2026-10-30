import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number.",
      },
    },

    // Server-generated price snapshot for price-change alerts.
    // Never use this value to calculate checkout totals.
    priceAtAddition: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const CartModel = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default CartModel;
