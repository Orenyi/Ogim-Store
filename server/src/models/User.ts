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

    // Explicitly distinguishes Super Admin from invited staff.
    adminType: {
      type: String,
      enum: ["super_admin", "staff"],
      default: undefined,
    },

    // Staff accounts reference their assigned AdminRole.
    adminRoleId: {
      type: Schema.Types.ObjectId,
      ref: "AdminRole",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      required: true,
    },

    // Records when an account is soft-deleted.
    deletedAt: {
      type: Date,
      default: null,
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

// ============================================
// INDEXES
// ============================================

// Existing account uniqueness constraints.
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

// Supports staff retrieval by assigned role.
userSchema.index(
  { adminRoleId: 1 },
  {
    partialFilterExpression: {
      role: "admin",
      adminType: "staff",
    },
  },
);

// Supports administrative account classification and status checks.
userSchema.index({
  role: 1,
  adminType: 1,
  status: 1,
});

// ============================================
// ADMINISTRATOR ACCOUNT VALIDATION
// ============================================

userSchema.pre("validate", function () {
  // Customer accounts must not retain administrator privileges.
  if (this.role === "customer") {
    this.adminType = undefined;
    this.adminRoleId = null;
    return;
  }

  // Every administrator must have an explicit classification.
  // Never automatically promote an unclassified account.
  if (this.role === "admin" && !this.adminType) {
    throw new Error(
      "Administrator accounts must have an explicit administrator type.",
    );
  }

  // Super Admin does not use an assigned staff role.
  if (this.role === "admin" && this.adminType === "super_admin") {
    this.adminRoleId = null;
    return;
  }

  // Staff accounts must have an assigned administrator role.
  if (
    this.role === "admin" &&
    this.adminType === "staff" &&
    !this.adminRoleId
  ) {
    throw new Error("Staff accounts must have an assigned administrator role.");
  }
});

// ============================================
// MODEL
// ============================================

export type UserDocument = InferSchemaType<typeof userSchema>;

const User = model("User", userSchema);

export default User;
