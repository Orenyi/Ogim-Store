import { Schema, model } from "mongoose";

const passwordResetTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Automatically remove expired reset-token documents.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Useful for looking up outstanding tokens for an account.
passwordResetTokenSchema.index({ userId: 1, usedAt: 1 });

const PasswordResetToken = model(
  "PasswordResetToken",
  passwordResetTokenSchema,
);

export default PasswordResetToken;
