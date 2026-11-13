import { Schema, model, type InferSchemaType } from "mongoose";

// ============================================
// NOTIFICATION TYPES
// ============================================

export const ADMIN_NOTIFICATION_TYPES = [
  "purchase_paid",
  "staff_invited",
  "staff_joined",
] as const;

export const ADMIN_NOTIFICATION_ENTITY_TYPES = [
  "order",
  "staff",
  "invitation",
] as const;

// ============================================
// SCHEMA
// ============================================

const adminNotificationSchema = new Schema(
  {
    // Administrator receiving this notification.
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    // Administrator or system responsible for the activity.
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actorName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Ogim Store",
    },

    // Notification classification.
    type: {
      type: String,
      enum: ADMIN_NOTIFICATION_TYPES,
      required: true,
      immutable: true,
    },

    // Notification content.
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Associated resource.
    entityType: {
      type: String,
      enum: ADMIN_NOTIFICATION_ENTITY_TYPES,
      required: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    // Additional event information.
    // Examples: order number, payment reference, amount,
    // customer name, staff email and assigned role.
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Unique event identifier used to prevent duplicates.
    // Uniqueness is enforced per recipient below.
    eventKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
      immutable: true,
    },

    // Each recipient controls their own read status.
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },

    readAt: {
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

// Prevent duplicate notifications for the same event
// being created for the same administrator.
adminNotificationSchema.index(
  {
    recipientId: 1,
    eventKey: 1,
  },
  {
    unique: true,
    name: "unique_notification_per_recipient",
  },
);

// Retrieve the latest notifications for an administrator.
adminNotificationSchema.index({
  recipientId: 1,
  createdAt: -1,
});

// Efficient unread notification count and retrieval.
adminNotificationSchema.index({
  recipientId: 1,
  isRead: 1,
  createdAt: -1,
});

// ============================================
// TYPES
// ============================================

export type AdminNotificationDocument = InferSchemaType<
  typeof adminNotificationSchema
>;

// ============================================
// MODEL
// ============================================

const AdminNotification = model("AdminNotification", adminNotificationSchema);

export default AdminNotification;
