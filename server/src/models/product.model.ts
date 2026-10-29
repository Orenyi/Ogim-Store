import mongoose, { Schema, model } from "mongoose";

/**
 * A product image is stored externally (for example, in Cloudinary).
 * MongoDB stores its URL and optional public ID, not the image file itself.
 */
const productImageSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
      default: undefined,
    },
    alt: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

/**
 * Optional technical details for different phone models.
 * Keeping these optional allows Apple, Samsung, Google, and other
 * manufacturers to have different specifications.
 */
const productSpecificationsSchema = new Schema(
  {
    storage: {
      type: String,
      trim: true,
    },
    ram: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    display: {
      type: String,
      trim: true,
    },
    battery: {
      type: String,
      trim: true,
    },
    camera: {
      type: String,
      trim: true,
    },
    operatingSystem: {
      type: String,
      trim: true,
    },
    network: {
      type: String,
      trim: true,
    },
    processor: {
      type: String,
      trim: true,
    },
    additionalFeatures: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain lowercase letters, numbers, and single hyphens",
      ],
      maxlength: [180, "Product slug cannot exceed 180 characters"],
    },

    brand: {
      type: String,
      required: [true, "Product brand is required"],
      trim: true,
      maxlength: [80, "Brand cannot exceed 80 characters"],
    },

    model: {
      type: String,
      required: [true, "Product model is required"],
      trim: true,
      maxlength: [120, "Model cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    specifications: {
      type: productSpecificationsSchema,
      default: () => ({}),
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },
    },

    compareAtPrice: {
      type: Number,
      min: [0, "Comparison price cannot be negative"],
      validate: [
        {
          validator: Number.isFinite,
          message: "Comparison price must be a valid number",
        },
        {
          validator: function (this: { price?: number }, value: number) {
            return value == null || value > this.price!;
          },
          message: "Comparison price must be greater than the selling price",
        },
      ],
    },

    images: {
      type: [productImageSchema],
      default: [],
      validate: {
        validator: (images: unknown[]) => images.length <= 10,
        message: "A product can have a maximum of 10 images",
      },
    },

    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
      validate: {
        validator: (value: number) =>
          Number.isInteger(value) && Number.isFinite(value),
        message: "Stock quantity must be a whole number",
      },
    },

    condition: {
      type: String,
      required: [true, "Product condition is required"],
      enum: {
        values: ["brand-new", "uk-used", "refurbished"],
        message: "Condition must be brand-new, uk-used, or refurbished",
      },
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Status must be draft, published, or archived",
      },
      default: "draft",
      required: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      min: 0,
      validate: {
        validator: (value: number) => Number.isInteger(value),
        message: "Review count must be a whole number",
      },
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Explicit indexes for common catalogue queries.
// The slug's unique option already creates a unique index.
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ status: 1, brand: 1 });
productSchema.index({ status: 1, condition: 1 });
productSchema.index({ status: 1, price: 1 });
productSchema.index({ status: 1, isFeatured: 1, createdAt: -1 });

/**
 * Reuse the model if it has already been registered.
 * This prevents model recompilation errors during development.
 */
const ProductModel = mongoose.models.Product || model("Product", productSchema);

export default ProductModel;
