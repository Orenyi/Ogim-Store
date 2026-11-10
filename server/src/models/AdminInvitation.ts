import { Schema, model, type InferSchemaType } from "mongoose";

export const ADMIN_INVITATION_STATUSES = [
  "pending",
  "accepted",
  "expired",
  "revoked",
  "failed",
] as const;

const adminInvitationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 30,
      default: undefined,
    },

    roleId: {
      type: Schema.Types.ObjectId,
      ref: "AdminRole",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    status: {
      type: String,
      enum: ADMIN_INVITATION_STATUSES,
      required: true,
      default: "pending",
      index: true,
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
      select: false,
    },

    emailProvider: {
      type: String,
      enum: ["gmail"],
      default: "gmail",
      required: true,
    },

    emailStatus: {
      type: String,
      enum: ["not_sent", "sent", "failed"],
      default: "not_sent",
      required: true,
    },

    emailId: {
      type: String,
      trim: true,
      maxlength: 255,
      default: null,
    },

    emailSentAt: {
      type: Date,
      default: null,
    },

    lastEmailAttemptAt: {
      type: Date,
      default: null,
    },

    emailAttemptCount: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Efficiently find invitations by email and status.
adminInvitationSchema.index({
  email: 1,
  status: 1,
});

// Efficiently retrieve invitations issued by an administrator.
adminInvitationSchema.index({
  invitedBy: 1,
  createdAt: -1,
});

// Efficiently find invitations that have expired.
adminInvitationSchema.index({
  status: 1,
  expiresAt: 1,
});

export type AdminInvitationDocument = InferSchemaType<
  typeof adminInvitationSchema
>;

const AdminInvitation = model("AdminInvitation", adminInvitationSchema);

export default AdminInvitation;
