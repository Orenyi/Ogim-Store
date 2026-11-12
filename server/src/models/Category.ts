import mongoose, { Schema, type Document, type Model } from "mongoose";

// ============================================
// CATEGORY TYPES
// ============================================

export const CATEGORY_STATUSES = ["active", "archived"] as const;

export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    publicId: string;
    alt: string;
  } | null;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CATEGORY IMAGE SCHEMA
// ============================================

const categoryImageSchema = new Schema(
  {
    url: {
      type: String,
      trim: true,
      default: "",
    },

    publicId: {
      type: String,
      trim: true,
      default: "",
    },

    alt: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  },
);

// ============================================
// CATEGORY SCHEMA
// ============================================

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required."],
      trim: true,
      minlength: [2, "Category name must contain at least 2 characters."],
      maxlength: [80, "Category name cannot exceed 80 characters."],
    },

    slug: {
      type: String,
      required: [true, "Category slug is required."],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [2, "Category slug must contain at least 2 characters."],
      maxlength: [100, "Category slug cannot exceed 100 characters."],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Category slug must contain lowercase letters, numbers and hyphens only.",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Category description cannot exceed 500 characters."],
      default: "",
    },

    image: {
      type: categoryImageSchema,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: CATEGORY_STATUSES,
        message: "Invalid category status.",
      },
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

// Slug has its own unique index through unique: true.
// This index supports listing active categories.
categorySchema.index({ status: 1, name: 1 });

// ============================================
// MODEL
// ============================================

const CategoryModel: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>("Category", categorySchema);

export default CategoryModel;
