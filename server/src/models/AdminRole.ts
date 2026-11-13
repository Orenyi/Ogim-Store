import { Schema, model, type InferSchemaType } from "mongoose";

export const ADMIN_PERMISSIONS = [
  "dashboard.view",
  "orders.view",
  "orders.manage",
  "products.view",
  "products.manage",
  "inventory.view",
  "inventory.manage",
  "customers.view",
  "customers.manage",
  "dispatch.view",
  "dispatch.manage",
  "delivery.manage",
  "tracking.manage",
  "reports.view",
  "staff.view",
  "staff.manage",
  "notifications.purchases.view",
  "notifications.staff.view",
  "settings.manage",
] as const;

export const ADMIN_ROLE_KEYS = [
  "administrator",
  "operations",
  "dispatch",
  "inventory",
  "sales",
  "custom",
] as const;

export const ADMIN_ROLE_COLORS = [
  "orange",
  "blue",
  "purple",
  "green",
  "yellow",
] as const;

const adminRoleSchema = new Schema(
  {
    key: {
      type: String,
      enum: ADMIN_ROLE_KEYS,
      required: true,
      default: "custom",
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    color: {
      type: String,
      enum: ADMIN_ROLE_COLORS,
      required: true,
      default: "orange",
    },

    permissions: {
      type: [
        {
          type: String,
          enum: ADMIN_PERMISSIONS,
        },
      ],
      required: true,
      default: [],
      validate: {
        validator: (permissions: string[]) =>
          new Set(permissions).size === permissions.length,
        message: "A role cannot contain duplicate permissions.",
      },
    },

    isSystem: {
      type: Boolean,
      required: true,
      default: false,
      immutable: true,
    },

    isProtected: {
      type: Boolean,
      required: true,
      default: false,
      immutable: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
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

// System role keys must be unique.
// Custom roles can all use the "custom" key.
adminRoleSchema.index(
  { key: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isSystem: true,
    },
  },
);

// Helps retrieve roles in a predictable order.
adminRoleSchema.index({ isSystem: -1, name: 1 });

// Helps audit role changes by administrator.
adminRoleSchema.index({ updatedBy: 1, updatedAt: -1 });

export type AdminRoleDocument = InferSchemaType<typeof adminRoleSchema>;

const AdminRole = model("AdminRole", adminRoleSchema);

export default AdminRole;
