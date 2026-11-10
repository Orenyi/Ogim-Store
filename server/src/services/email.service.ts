import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";

import { env } from "../config/env.js";

// ==================================================
// GMAIL SMTP TRANSPORTER
// ==================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""),
  },
});

// ==================================================
// GENERAL EMAIL HELPER
// ==================================================

async function sendEmail(options: SendMailOptions, emailType: string) {
  try {
    const info = await transporter.sendMail({
      ...options,
      from: env.EMAIL_FROM,
    });

    if (!info.messageId) {
      throw new Error("SMTP server did not return an email message ID.");
    }

    // Verify that the intended recipient was accepted by the SMTP server.
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    type SmtpRecipient = string | { address: string };

    const normalizeAddress = (recipient: SmtpRecipient): string => {
      return (
        typeof recipient === "string" ? recipient : recipient.address
      ).toLowerCase();
    };

    const acceptedAddresses = (info.accepted as SmtpRecipient[]).map(
      normalizeAddress,
    );

    const rejectedAddresses = (info.rejected as SmtpRecipient[]).map(
      normalizeAddress,
    );

    const intendedRecipients = recipients
      .filter((recipient): recipient is string => typeof recipient === "string")
      .map((recipient) => recipient.toLowerCase());

    const recipientAccepted = intendedRecipients.some(
      (recipient) =>
        acceptedAddresses.includes(recipient) &&
        !rejectedAddresses.includes(recipient),
    );

    if (!recipientAccepted) {
      throw new Error("The SMTP server did not accept the intended recipient.");
    }

    return {
      id: info.messageId,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email delivery error.";

    throw new Error(`${emailType} email failed: ${message}`);
  }
}

// ==================================================
// HTML ESCAPING
// ==================================================

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==================================================
// URL VALIDATION
// ==================================================

// Validate password reset links against the trusted frontend.
function validateResetUrl(value: string): string {
  let url: URL;
  let clientUrl: URL;

  try {
    url = new URL(value);
    clientUrl = new URL(env.CLIENT_URL);
  } catch {
    throw new Error("Invalid password reset URL.");
  }

  if (
    url.origin !== clientUrl.origin ||
    url.pathname !== "/reset-password" ||
    (url.protocol !== "https:" && url.protocol !== "http:")
  ) {
    throw new Error("Invalid password reset URL.");
  }

  return url.toString();
}

// Validate staff invitation links against the trusted frontend.
function validateStaffInvitationUrl(value: string): string {
  let url: URL;
  let clientUrl: URL;

  try {
    url = new URL(value);
    clientUrl = new URL(env.CLIENT_URL);
  } catch {
    throw new Error("Invalid staff invitation URL.");
  }

  if (
    url.origin !== clientUrl.origin ||
    url.pathname !== "/admin/accept-invitation" ||
    url.protocol !== clientUrl.protocol ||
    !url.searchParams.has("token") ||
    !url.searchParams.get("token")
  ) {
    throw new Error("Invalid staff invitation URL.");
  }

  return url.toString();
}

// ==================================================
// EMAIL OPTIONS
// ==================================================

interface TestEmailOptions {
  to: string;
}

interface WelcomeEmailOptions {
  to: string;
  fullName: string;
}

interface PasswordResetEmailOptions {
  to: string;
  fullName: string;
  resetUrl: string;
}

interface PasswordChangedEmailOptions {
  to: string;
  fullName: string;
}

interface StaffInvitationEmailOptions {
  to: string;
  fullName: string;
  roleName: string;
  invitationUrl: string;
  expiresIn?: string;
}

// ==================================================
// TEST EMAIL
// ==================================================

export async function sendTestEmail({ to }: TestEmailOptions) {
  return sendEmail(
    {
      to,
      subject: "Ogim Store Email Configuration Test",

      text: `
Ogim Store

Email configuration successful!

Your Ogim Store email service is working correctly.
This is a test email sent through Gmail SMTP.

Ogim Store notification service.
      `.trim(),

      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Ogim Store Email Test</title>
          </head>

          <body style="margin:0;padding:32px 16px;background:#F7F6F2;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:16px;">
              <h1 style="color:#15171C;">Ogim Store</h1>

              <h2 style="color:#15171C;">Email configuration successful!</h2>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                Your Ogim Store email service is working correctly.
                This is a test email sent through Gmail SMTP.
              </p>

              <hr style="border:none;border-top:1px solid #EAE8E1;" />

              <p style="color:#6B6D73;font-size:12px;">
                Ogim Store notification service
              </p>
            </div>
          </body>
        </html>
      `,
    },
    "Test",
  );
}

// ==================================================
// WELCOME EMAIL
// ==================================================

export async function sendWelcomeEmail({ to, fullName }: WelcomeEmailOptions) {
  const safeName = escapeHtml(fullName);
  const safeClientUrl = escapeHtml(env.CLIENT_URL);

  return sendEmail(
    {
      to,
      subject: "Welcome to Ogim Store!",

      text: `
Hello ${fullName},

Welcome to Ogim Store!

Thank you for creating an account with us.
We're excited to have you with us.

Explore our collection of brand-new, UK-used and refurbished smartphones,
and find the right device for you.

Start shopping:
${env.CLIENT_URL}

Thank you for choosing Ogim Store.
      `.trim(),

      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Welcome to Ogim Store</title>
          </head>

          <body style="margin:0;padding:32px 16px;background:#F7F6F2;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:16px;">
              <h1 style="margin:0 0 28px;color:#15171C;font-size:28px;">
                Ogim Store
              </h1>

              <h2 style="color:#15171C;font-size:24px;">
                Welcome aboard!
              </h2>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                Hello ${safeName},
              </p>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                Thank you for creating an account with Ogim Store.
                We're excited to have you with us.
              </p>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                Explore our collection of brand-new, UK-used and refurbished
                smartphones, and find the right device for you.
              </p>

              <a
                href="${safeClientUrl}"
                style="display:inline-block;margin-top:20px;padding:14px 24px;background:#F06428;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:10px;"
              >
                Start shopping
              </a>

              <hr style="margin-top:28px;border:none;border-top:1px solid #EAE8E1;" />

              <p style="color:#6B6D73;font-size:11px;">
                Thank you for choosing Ogim Store.
              </p>
            </div>
          </body>
        </html>
      `,
    },
    "Welcome",
  );
}

// ==================================================
// PASSWORD RESET EMAIL
// ==================================================

export async function sendPasswordResetEmail({
  to,
  fullName,
  resetUrl,
}: PasswordResetEmailOptions) {
  const safeName = escapeHtml(fullName);
  const validatedResetUrl = validateResetUrl(resetUrl);
  const safeResetUrl = escapeHtml(validatedResetUrl);

  return sendEmail(
    {
      to,
      subject: "Reset your Ogim Store password",

      text: `
Hello ${fullName},

We received a request to reset the password for your Ogim Store account.

Use the link below to choose a new password:

${validatedResetUrl}

This link expires in 30 minutes and can only be used once.

If you didn't request a password reset, you can safely ignore this email.
Your password will remain unchanged.

Ogim Store account security.
      `.trim(),

      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Reset your Ogim Store password</title>
          </head>

          <body style="margin:0;padding:32px 16px;background:#F7F6F2;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:16px;">
              <h1 style="margin:0 0 28px;color:#15171C;font-size:28px;">
                Ogim Store
              </h1>

              <h2 style="color:#15171C;font-size:24px;">
                Password reset request
              </h2>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                Hello ${safeName}, we received a request to reset the password
                for your Ogim Store account.
              </p>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                Use the button below to choose a new password. This link expires
                in 30 minutes and can only be used once.
              </p>

              <a
                href="${safeResetUrl}"
                style="display:inline-block;margin-top:20px;padding:14px 24px;background:#F06428;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:10px;"
              >
                Reset my password
              </a>

              <p style="margin-top:24px;color:#6B6D73;font-size:13px;line-height:1.7;">
                If the button doesn't work, copy and paste this link into your browser:
                <br />
                <a href="${safeResetUrl}" style="color:#F06428;word-break:break-all;">
                  ${safeResetUrl}
                </a>
              </p>

              <p style="margin-top:24px;color:#6B6D73;font-size:13px;line-height:1.7;">
                If you didn't request a password reset, you can safely ignore
                this email. Your password will remain unchanged.
              </p>

              <hr style="margin-top:28px;border:none;border-top:1px solid #EAE8E1;" />

              <p style="color:#6B6D73;font-size:11px;">
                Ogim Store account security
              </p>
            </div>
          </body>
        </html>
      `,
    },
    "Password reset",
  );
}

// ==================================================
// PASSWORD CHANGED NOTIFICATION
// ==================================================

export async function sendPasswordChangedEmail({
  to,
  fullName,
}: PasswordChangedEmailOptions) {
  const safeName = escapeHtml(fullName);
  const loginUrl = `${env.CLIENT_URL}/login`;
  const safeLoginUrl = escapeHtml(loginUrl);

  return sendEmail(
    {
      to,
      subject: "Your Ogim Store password has been changed",

      text: `
Hello ${fullName},

The password for your Ogim Store account has been successfully updated.

If you made this change, no further action is needed.

If you did not change your password, contact our support team immediately.

Sign in to your account:
${loginUrl}

Ogim Store account security.
      `.trim(),

      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Password changed</title>
          </head>

          <body style="margin:0;padding:32px 16px;background:#F7F6F2;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:16px;">
              <h1 style="margin:0 0 28px;color:#15171C;font-size:28px;">
                Ogim Store
              </h1>

              <h2 style="color:#15171C;font-size:24px;">
                Your password has been changed
              </h2>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                Hello ${safeName}, the password for your Ogim Store account
                has been successfully updated.
              </p>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                If you made this change, no further action is needed.
                If you did not change your password, contact our support team
                immediately.
              </p>

              <a
                href="${safeLoginUrl}"
                style="display:inline-block;margin-top:20px;padding:14px 24px;background:#F06428;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:10px;"
              >
                Sign in to Ogim Store
              </a>

              <hr style="margin-top:28px;border:none;border-top:1px solid #EAE8E1;" />

              <p style="color:#6B6D73;font-size:11px;">
                Ogim Store account security
              </p>
            </div>
          </body>
        </html>
      `,
    },
    "Password changed",
  );
}

// ==================================================
// STAFF INVITATION EMAIL
// ==================================================

export async function sendStaffInvitationEmail({
  to,
  fullName,
  roleName,
  invitationUrl,
  expiresIn = "24 hours",
}: StaffInvitationEmailOptions) {
  const safeName = escapeHtml(fullName);
  const safeRoleName = escapeHtml(roleName);
  const validatedInvitationUrl = validateStaffInvitationUrl(invitationUrl);
  const safeInvitationUrl = escapeHtml(validatedInvitationUrl);
  const safeExpiry = escapeHtml(expiresIn);

  return sendEmail(
    {
      to,
      subject: "You're invited to join the Ogim Store team",

      text: `
Hello ${fullName},

You've been invited to join the Ogim Store administrative team.

Your assigned role: ${roleName}

To activate your staff account, accept this invitation and create your password using the link below:

${validatedInvitationUrl}

This invitation expires in ${expiresIn}.
It can only be accepted once.

If you weren't expecting this invitation, you can safely ignore this email.

Ogim Store administrative team.
      `.trim(),

      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Ogim Store Staff Invitation</title>
          </head>

          <body style="margin:0;padding:32px 16px;background:#F7F6F2;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:16px;">

              <h1 style="margin:0 0 28px;color:#15171C;font-size:28px;">
                Ogim Store
              </h1>

              <h2 style="color:#15171C;font-size:24px;">
                You're invited to join our team!
              </h2>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                Hello ${safeName},
              </p>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                You've been invited to join the Ogim Store administrative team.
                We're pleased to welcome you.
              </p>

              <div style="margin:24px 0;padding:18px;background:#F7F6F2;border-radius:10px;">
                <p style="margin:0 0 8px;color:#6B6D73;font-size:13px;">
                  Your assigned role
                </p>

                <p style="margin:0;color:#15171C;font-size:17px;font-weight:bold;">
                  ${safeRoleName}
                </p>
              </div>

              <p style="color:#6B6D73;font-size:15px;line-height:1.8;">
                To activate your staff account, accept this invitation
                and create your password using the button below.
              </p>

              <a
                href="${safeInvitationUrl}"
                style="display:inline-block;margin-top:20px;padding:14px 24px;background:#F06428;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:10px;"
              >
                Accept invitation
              </a>

              <p style="margin-top:24px;color:#6B6D73;font-size:13px;line-height:1.7;">
                This invitation expires in ${safeExpiry}.
                It can only be accepted once.
              </p>

              <p style="color:#6B6D73;font-size:13px;line-height:1.7;">
                If the button doesn't work, copy and paste this link into your browser:
                <br />
                <a
                  href="${safeInvitationUrl}"
                  style="color:#F06428;word-break:break-all;"
                >
                  ${safeInvitationUrl}
                </a>
              </p>

              <p style="margin-top:24px;color:#6B6D73;font-size:13px;line-height:1.7;">
                If you weren't expecting this invitation, you can safely ignore
                this email.
              </p>

              <hr style="margin-top:28px;border:none;border-top:1px solid #EAE8E1;" />

              <p style="color:#6B6D73;font-size:11px;">
                Ogim Store administrative team
              </p>
            </div>
          </body>
        </html>
      `,
    },
    "Staff invitation",
  );
}

// ==================================================
// SMTP CONNECTION VERIFICATION
// ==================================================

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown SMTP connection error.";

    throw new Error(`Gmail SMTP connection failed: ${message}`);
  }
}
