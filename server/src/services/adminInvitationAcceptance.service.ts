import argon2 from "argon2";
import mongoose from "mongoose";
import { createHash } from "node:crypto";

import User from "../models/User.js";
import AdminRole from "../models/AdminRole.js";
import AdminInvitation from "../models/AdminInvitation.js";
import { createStaffJoinedNotifications } from "./admin-notification.service.js";

const INVALID_INVITATION_MESSAGE =
  "This invitation link is invalid, expired, or no longer available.";

const PASSWORD_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export class AdminInvitationAcceptanceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminInvitationAcceptanceError";
    this.statusCode = statusCode;
  }
}

function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isValidInvitationToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/i.test(token);
}

/**
 * Checks that the invitation's assigned role still exists
 * and is eligible for staff assignment.
 */
async function findEligibleRole(
  roleId: mongoose.Types.ObjectId,
  session?: mongoose.ClientSession,
) {
  let query = AdminRole.findOne({
    _id: roleId,
    isProtected: false,
    key: { $ne: "administrator" },
  });

  if (session) {
    query = query.session(session);
  }

  const role = await query;

  if (!role) {
    throw new AdminInvitationAcceptanceError(INVALID_INVITATION_MESSAGE);
  }

  return role;
}

/**
 * Validate an invitation token before displaying the acceptance form.
 *
 * Only safe invitation and role information is returned.
 * Password hashes, token hashes and internal audit fields are never exposed.
 */
export async function validateStaffInvitation(token: string) {
  if (!isValidInvitationToken(token)) {
    throw new AdminInvitationAcceptanceError(INVALID_INVITATION_MESSAGE);
  }

  const tokenHash = hashInvitationToken(token);
  const now = new Date();

  const invitation = await AdminInvitation.findOne({
    tokenHash,
  }).select("+tokenHash");

  if (!invitation || invitation.status !== "pending") {
    throw new AdminInvitationAcceptanceError(INVALID_INVITATION_MESSAGE);
  }

  if (invitation.expiresAt <= now) {
    await AdminInvitation.updateOne(
      {
        _id: invitation._id,
        status: "pending",
        expiresAt: { $lte: now },
      },
      {
        $set: {
          status: "expired",
        },
      },
    );

    throw new AdminInvitationAcceptanceError(INVALID_INVITATION_MESSAGE);
  }

  if (invitation.emailStatus !== "sent") {
    throw new AdminInvitationAcceptanceError(INVALID_INVITATION_MESSAGE);
  }

  const role = await findEligibleRole(invitation.roleId);

  return {
    fullName: invitation.fullName,
    email: invitation.email,
    ...(invitation.phoneNumber ? { phoneNumber: invitation.phoneNumber } : {}),
    role: {
      name: role.name,
      description: role.description,
      color: role.color,
    },
    expiresAt: invitation.expiresAt,
  };
}

export interface AcceptStaffInvitationInput {
  token: string;
  password: string;
  acceptedTerms: boolean;
}

/**
 * Accept an invitation and create a staff account.
 *
 * The staff account creation and invitation consumption happen
 * in one MongoDB transaction.
 *
 * The invitation can only be accepted once.
 *
 * Staff joined notifications are created only after the transaction
 * successfully commits.
 */
export async function acceptStaffInvitation(input: AcceptStaffInvitationInput) {
  if (!isValidInvitationToken(input.token)) {
    throw new AdminInvitationAcceptanceError(INVALID_INVITATION_MESSAGE);
  }

  if (input.acceptedTerms !== true) {
    throw new AdminInvitationAcceptanceError(
      "You must accept the terms and conditions to continue.",
    );
  }

  const tokenHash = hashInvitationToken(input.token);

  const passwordHash = await argon2.hash(input.password, PASSWORD_HASH_OPTIONS);

  const now = new Date();
  const mongoSession = await mongoose.startSession();

  let acceptedAccount:
    | {
        id: string;
        fullName: string;
        email: string;
        role: "admin";
        adminType: "staff";
        adminRoleId: string;
        invitedBy: string;
        roleName: string;
        invitationId: string;
      }
    | undefined;

  try {
    await mongoSession.withTransaction(async () => {
      // Retrieve only a pending, unexpired invitation whose email
      // was successfully sent.
      const invitation = await AdminInvitation.findOne({
        tokenHash,
        status: "pending",
        emailStatus: "sent",
        expiresAt: { $gt: now },
      })
        .select("+tokenHash")
        .session(mongoSession);

      if (!invitation) {
        throw new AdminInvitationAcceptanceError(INVALID_INVITATION_MESSAGE);
      }

      // Revalidate the assigned role at acceptance time.
      const role = await findEligibleRole(invitation.roleId, mongoSession);

      // Check for an existing account.
      // The unique email index remains the final concurrency safeguard.
      const existingUser = await User.findOne({
        email: invitation.email,
      })
        .select("_id")
        .session(mongoSession);

      if (existingUser) {
        throw new AdminInvitationAcceptanceError(
          "An account with this email address already exists. Please contact the administrator.",
          409,
        );
      }

      // Explicitly classify the account as staff.
      // Never allow the User model's default admin classification
      // to turn an invited staff member into a Super Admin.
      const [newUser] = await User.create(
        [
          {
            fullName: invitation.fullName,
            email: invitation.email,
            ...(invitation.phoneNumber
              ? { phoneNumber: invitation.phoneNumber }
              : {}),
            passwordHash,
            role: "admin",
            adminType: "staff",
            adminRoleId: role._id,
            status: "active",
            emailVerifiedAt: now,
            acceptedTermsAt: now,
          },
        ],
        {
          session: mongoSession,
        },
      );

      if (!newUser) {
        throw new Error("Unable to create the staff account.");
      }

      // Atomically consume the invitation.
      // The conditional update prevents reuse of the same invitation.
      const consumedInvitation = await AdminInvitation.updateOne(
        {
          _id: invitation._id,
          tokenHash,
          status: "pending",
          emailStatus: "sent",
          expiresAt: { $gt: now },
        },
        {
          $set: {
            status: "accepted",
            acceptedAt: now,
            acceptedBy: newUser._id,
          },
        },
        {
          session: mongoSession,
        },
      );

      if (consumedInvitation.modifiedCount !== 1) {
        throw new AdminInvitationAcceptanceError(INVALID_INVITATION_MESSAGE);
      }

      acceptedAccount = {
        id: newUser._id.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        role: "admin",
        adminType: "staff",
        adminRoleId: role._id.toString(),
        invitedBy: invitation.invitedBy.toString(),
        roleName: role.name,
        invitationId: invitation._id.toString(),
      };
    });
  } catch (error) {
    if (error instanceof AdminInvitationAcceptanceError) {
      throw error;
    }

    // Handle MongoDB duplicate-key errors without exposing
    // database details to the public endpoint.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      throw new AdminInvitationAcceptanceError(
        "An account with this email address already exists. Please contact the administrator.",
        409,
      );
    }

    throw error;
  } finally {
    await mongoSession.endSession();
  }

  if (!acceptedAccount) {
    throw new Error("Staff invitation acceptance was unsuccessful.");
  }

  // Notify admins after the account and invitation transaction commits.
  // A notification failure must never undo a successfully created account.
  try {
    await createStaffJoinedNotifications({
      invitationId: acceptedAccount.invitationId,
      invitedBy: acceptedAccount.invitedBy,
      joinedUserId: acceptedAccount.id,
      joinedName: acceptedAccount.fullName,
      joinedEmail: acceptedAccount.email,
      roleName: acceptedAccount.roleName,
    });
  } catch (error: unknown) {
    console.error(
      "[Admin Notifications] Failed to create staff joined notifications:",
      error,
    );
  }

  return {
    user: {
      id: acceptedAccount.id,
      fullName: acceptedAccount.fullName,
      email: acceptedAccount.email,
      role: acceptedAccount.role,
      adminType: acceptedAccount.adminType,
      adminRoleId: acceptedAccount.adminRoleId,
    },
  };
}
