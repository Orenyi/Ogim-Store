import argon2 from "argon2";
import jwt from "jsonwebtoken";
import mongoose, { Types } from "mongoose";
import { createHash, randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import RefreshSession from "../models/RefreshSession.js";
import PasswordResetToken from "../models/PasswordResetToken.js";

import { env } from "../config/env.js";

import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "./email.service.js";

import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validators/auth.validation.js";

const ACCESS_TOKEN_TTL = "15m";
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const PASSWORD_RESET_ERROR =
  "This password reset link is invalid or has expired.";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

function refreshExpiry(rememberMe: boolean): Date {
  const days = rememberMe ? 30 : 1;

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: "customer" | "admin";
}

function toPublicUser(user: {
  _id: unknown;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
}): PublicUser {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    ...(user.phoneNumber ? { phoneNumber: user.phoneNumber } : {}),
    role: user.role === "admin" ? "admin" : "customer",
  };
}

export function createAccessToken(user: {
  _id: Types.ObjectId;
  role: string;
}): string {
  return jwt.sign({ role: user.role, type: "access" }, env.JWT_SECRET, {
    subject: user._id.toString(),
    expiresIn: ACCESS_TOKEN_TTL,
    issuer: "ogim-store-api",
    audience: "ogim-store-client",
  });
}

async function createSession(
  user: {
    _id: Types.ObjectId;
    role: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
  },
  userAgent?: string,
  rememberMe = false,
) {
  const refreshToken = createRefreshToken();

  await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiry(rememberMe),
    rememberMe,
    userAgent: userAgent?.slice(0, 500),
  });

  return {
    user: toPublicUser(user),
    accessToken: createAccessToken(user),
    refreshToken,
    rememberMe,
  };
}

/**
 * Sends a welcome email and records successful delivery.
 *
 * Email delivery failure must never interrupt registration.
 */
async function sendWelcomeEmailSafely(
  userId: Types.ObjectId,
  email: string,
  fullName: string,
): Promise<void> {
  try {
    const user = await User.findById(userId).select("welcomeEmailSentAt");

    if (!user || user.welcomeEmailSentAt) {
      return;
    }

    await sendWelcomeEmail({
      to: email,
      fullName,
    });

    await User.updateOne(
      {
        _id: userId,
        welcomeEmailSentAt: null,
      },
      {
        $set: {
          welcomeEmailSentAt: new Date(),
        },
      },
    );

    console.log(`Welcome email accepted by Resend for ${email}.`);
  } catch (error) {
    console.error(`Welcome email delivery failed for ${email}:`, error);
  }
}

/**
 * Register a customer with email and password.
 */
export async function registerCustomer(
  input: RegisterInput,
  userAgent?: string,
) {
  const conditions: Array<Record<string, string>> = [{ email: input.email }];

  if (input.phoneNumber) {
    conditions.push({ phoneNumber: input.phoneNumber });
  }

  const existing = await User.findOne({
    $or: conditions,
  }).lean();

  if (existing) {
    throw new Error("An account with those details may already exist.");
  }

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
    passwordHash,
    role: "customer",
    status: "active",
    acceptedTermsAt: new Date(),
  });

  const session = await createSession(user, userAgent);

  await sendWelcomeEmailSafely(user._id, user.email, user.fullName);

  return session;
}

/**
 * Login with email and password.
 */
export async function loginCustomer(
  input: LoginInput,
  userAgent?: string,
  rememberMe = false,
) {
  const user = await User.findOne({
    email: input.email,
  }).select("+passwordHash");

  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password.");
  }

  const passwordMatches = await argon2.verify(
    user.passwordHash,
    input.password,
  );

  if (!passwordMatches || user.status !== "active") {
    throw new Error("Invalid email or password.");
  }

  return createSession(user, userAgent, rememberMe);
}

/**
 * Rotate a refresh token.
 */
export async function rotateRefreshToken(
  refreshToken: string,
  userAgent?: string,
) {
  const tokenHash = hashToken(refreshToken);
  const now = new Date();

  const session = await RefreshSession.findOne({
    tokenHash,
  }).select("+tokenHash +replacedByTokenHash");

  if (!session) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (session.revokedAt || session.expiresAt <= now) {
    if (session.revokedAt) {
      await RefreshSession.updateMany(
        {
          userId: session.userId,
          revokedAt: null,
        },
        {
          $set: { revokedAt: now },
        },
      );
    }

    throw new Error("Session expired. Please sign in again.");
  }

  const user = await User.findById(session.userId);

  if (!user || user.status !== "active") {
    await RefreshSession.updateOne(
      {
        _id: session._id,
        revokedAt: null,
      },
      {
        $set: { revokedAt: now },
      },
    );

    throw new Error("Session expired. Please sign in again.");
  }

  const claimedSession = await RefreshSession.findOneAndUpdate(
    {
      _id: session._id,
      revokedAt: null,
      expiresAt: { $gt: now },
    },
    {
      $set: { revokedAt: now },
    },
    {
      new: false,
    },
  ).select("+tokenHash +replacedByTokenHash");

  if (!claimedSession) {
    throw new Error("Session expired. Please sign in again.");
  }

  const rememberMe = claimedSession.rememberMe === true;
  const nextToken = createRefreshToken();
  const nextHash = hashToken(nextToken);

  try {
    await RefreshSession.create({
      userId: user._id,
      tokenHash: nextHash,
      expiresAt: refreshExpiry(rememberMe),
      rememberMe,
      userAgent: userAgent?.slice(0, 500),
    });

    await RefreshSession.updateOne(
      { _id: claimedSession._id },
      {
        $set: {
          replacedByTokenHash: nextHash,
        },
      },
    );
  } catch {
    throw new Error("Unable to renew session. Please sign in again.");
  }

  return {
    user: toPublicUser(user),
    accessToken: createAccessToken(user),
    refreshToken: nextToken,
    rememberMe,
  };
}

/**
 * Revoke a specific refresh token.
 */
export async function revokeRefreshToken(refreshToken?: string) {
  if (!refreshToken) return;

  await RefreshSession.updateOne(
    {
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
}

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);

  if (!user || user.status !== "active") {
    throw new Error("Session expired. Please sign in again.");
  }

  return toPublicUser(user);
}

/**
 * Google authentication and customer onboarding.
 */
export async function loginWithGoogle(
  credential: string,
  userAgent?: string,
  acceptedTerms = false,
  phoneNumber?: string,
) {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("Google sign-in is not configured.");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google account could not be verified.");
  }

  const email = payload.email.trim().toLowerCase();

  const existingGoogleUser = await User.findOne({
    googleSubject: payload.sub,
  });

  if (existingGoogleUser) {
    if (existingGoogleUser.status !== "active") {
      throw new Error("This account is unavailable.");
    }

    return {
      onboardingRequired: false as const,
      ...(await createSession(existingGoogleUser, userAgent)),
    };
  }

  const existingEmail = await User.exists({ email });

  if (existingEmail) {
    throw new Error(
      "An account with this email already exists. Sign in using your existing method.",
    );
  }

  if (!acceptedTerms) {
    return {
      onboardingRequired: true as const,
      email,
      fullName: payload.name?.trim().slice(0, 100) || "",
    };
  }

  const user = await User.create({
    fullName: payload.name?.trim().slice(0, 100) || email.split("@")[0],
    email,
    ...(phoneNumber ? { phoneNumber } : {}),
    googleSubject: payload.sub,
    role: "customer",
    status: "active",
    acceptedTermsAt: new Date(),
    emailVerifiedAt: new Date(),
  });

  const session = await createSession(user, userAgent);

  await sendWelcomeEmailSafely(user._id, user.email, user.fullName);

  return {
    onboardingRequired: false as const,
    ...session,
  };
}

// ==================================================
// PASSWORD RESET
// ==================================================

/**
 * Request a password-reset email.
 *
 * The function deliberately returns the same result whether an account
 * exists or not, preventing email address enumeration.
 */
export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<void> {
  const user = await User.findOne({
    email: input.email,
    status: "active",
  }).select("+passwordHash");

  // Do not reveal whether the account exists.
  if (!user || !user.passwordHash) {
    return;
  }

  // Generate a cryptographically secure, single-use token.
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const now = new Date();

  // Invalidate previous unused reset tokens.
  await PasswordResetToken.updateMany(
    {
      userId: user._id,
      usedAt: null,
    },
    {
      $set: {
        usedAt: now,
      },
    },
  );

  // Store only the hashed token.
  const resetToken = await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      resetUrl,
    });

    console.log(`Password reset email accepted for ${user.email}.`);
  } catch (error) {
    // Do not leave a usable token when email delivery fails.
    await PasswordResetToken.updateOne(
      {
        _id: resetToken._id,
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      },
    );

    console.error(
      `Password reset email delivery failed for ${user.email}:`,
      error,
    );
  }
}

/**
 * Reset a customer's password using a valid, unexpired, single-use token.
 *
 * This operation runs in a MongoDB transaction so the password update,
 * token consumption, and session revocation succeed or fail together.
 */
export async function resetCustomerPassword(
  input: ResetPasswordInput,
): Promise<void> {
  const tokenHash = hashToken(input.token);
  const now = new Date();

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const mongoSession = await mongoose.startSession();

  let notification:
    | {
        email: string;
        fullName: string;
      }
    | undefined;

  try {
    await mongoSession.withTransaction(async () => {
      // Atomically claim the token. Only an unused and unexpired token
      // can be consumed.
      const resetToken = await PasswordResetToken.findOneAndUpdate(
        {
          tokenHash,
          usedAt: null,
          expiresAt: { $gt: now },
        },
        {
          $set: {
            usedAt: now,
          },
        },
        {
          new: false,
          session: mongoSession,
        },
      );

      if (!resetToken) {
        throw new Error(PASSWORD_RESET_ERROR);
      }

      const user = await User.findOne({
        _id: resetToken.userId,
        status: "active",
      })
        .select("+passwordHash")
        .session(mongoSession);

      if (!user || !user.passwordHash) {
        throw new Error(PASSWORD_RESET_ERROR);
      }

      // Update the password and record when it changed.
      await User.updateOne(
        {
          _id: user._id,
          status: "active",
        },
        {
          $set: {
            passwordHash,
            passwordChangedAt: now,
          },
        },
        {
          session: mongoSession,
        },
      );

      // Revoke all existing refresh sessions.
      await RefreshSession.updateMany(
        {
          userId: user._id,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt: now,
          },
        },
        {
          session: mongoSession,
        },
      );

      // Invalidate every other outstanding password-reset token.
      await PasswordResetToken.updateMany(
        {
          userId: user._id,
          _id: { $ne: resetToken._id },
          usedAt: null,
        },
        {
          $set: {
            usedAt: now,
          },
        },
        {
          session: mongoSession,
        },
      );

      notification = {
        email: user.email,
        fullName: user.fullName,
      };
    });
  } finally {
    await mongoSession.endSession();
  }

  // Send the notification only after the database transaction commits.
  if (notification) {
    try {
      await sendPasswordChangedEmail({
        to: notification.email,
        fullName: notification.fullName,
      });

      console.log(
        `Password changed notification accepted for ${notification.email}.`,
      );
    } catch (error) {
      // A notification failure must not undo a successful password reset.
      console.error(
        `Password changed notification failed for ${notification.email}:`,
        error,
      );
    }
  }
}
