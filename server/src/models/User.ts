import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: undefined,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    googleSubject: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      required: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    acceptedTermsAt: {
      type: Date,
      required: true,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    welcomeEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.index(
  { phoneNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phoneNumber: { $type: "string" },
    },
  },
);

userSchema.index(
  { googleSubject: 1 },
  {
    unique: true,
    partialFilterExpression: {
      googleSubject: { $type: "string" },
    },
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const User = model("User", userSchema);

export default User;
