import { Resend } from "resend";
import { env } from "../config/env.js";

// Initialize Resend
const resend = new Resend(env.RESEND_API_KEY);

// Escape HTML to prevent HTML injection in email templates
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Validate that password reset links point to the trusted frontend
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

  return escapeHtml(value);
}

// Check Resend response
function verifyEmailResponse(
  data: { id?: string } | null,
  error: { message: string } | null,
  emailType: string,
) {
  if (error) {
    throw new Error(`${emailType} email failed: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error(`Resend did not return a ${emailType} email ID.`);
  }

  return data;
}

// Email options
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

// --------------------------------------------------
// TEST EMAIL
// --------------------------------------------------

export async function sendTestEmail({ to }: TestEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Ogim Store Email Configuration Test",
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
              This is a test email sent through Resend.
            </p>

            <hr style="border:none;border-top:1px solid #EAE8E1;" />

            <p style="color:#6B6D73;font-size:12px;">
              Ogim Store notification service
            </p>
          </div>
        </body>
      </html>
    `,
  });

  return verifyEmailResponse(data, error, "Test");
}

// --------------------------------------------------
// WELCOME EMAIL
// --------------------------------------------------

export async function sendWelcomeEmail({ to, fullName }: WelcomeEmailOptions) {
  const safeName = escapeHtml(fullName);

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Welcome to Ogim Store!",
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
              href="${escapeHtml(env.CLIENT_URL)}"
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
  });

  return verifyEmailResponse(data, error, "Welcome");
}

// --------------------------------------------------
// PASSWORD RESET EMAIL
// --------------------------------------------------

export async function sendPasswordResetEmail({
  to,
  fullName,
  resetUrl,
}: PasswordResetEmailOptions) {
  const safeName = escapeHtml(fullName);
  const safeResetUrl = validateResetUrl(resetUrl);

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Reset your Ogim Store password",
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
  });

  return verifyEmailResponse(data, error, "Password reset");
}

// --------------------------------------------------
// PASSWORD CHANGED NOTIFICATION
// --------------------------------------------------

export async function sendPasswordChangedEmail({
  to,
  fullName,
}: PasswordChangedEmailOptions) {
  const safeName = escapeHtml(fullName);
  const safeLoginUrl = escapeHtml(`${env.CLIENT_URL}/login`);

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Your Ogim Store password has been changed",
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
  });

  return verifyEmailResponse(data, error, "Password changed");
}
