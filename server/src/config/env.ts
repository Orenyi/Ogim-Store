import "dotenv/config";

// ==================================================
// APPLICATION ENVIRONMENT
// ==================================================

const nodeEnv = process.env.NODE_ENV ?? "development";

const isProduction = nodeEnv === "production";

// ==================================================
// PORT
// ==================================================

const port = Number(process.env.PORT ?? 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid port number.");
}

// ==================================================
// DATABASE
// ==================================================

const mongoUri = process.env.MONGODB_URI;

// ==================================================
// CLOUDINARY
// ==================================================

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

// ==================================================
// AUTHENTICATION
// ==================================================

const jwtSecret = process.env.JWT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";

// ==================================================
// GMAIL SMTP CONFIGURATION
// ==================================================

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;

// ==================================================
// CLIENT
// ==================================================

const rawClientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

let clientUrl: string;

try {
  const parsedClientUrl = new URL(rawClientUrl);

  if (
    parsedClientUrl.pathname !== "/" ||
    parsedClientUrl.search ||
    parsedClientUrl.hash
  ) {
    throw new Error("CLIENT_URL must contain only the frontend origin.");
  }

  if (isProduction && parsedClientUrl.protocol !== "https:") {
    throw new Error("CLIENT_URL must use HTTPS in production.");
  }

  clientUrl = parsedClientUrl.origin;
} catch {
  throw new Error(
    "CLIENT_URL must be a valid frontend URL. Example: https://ogim-store.vercel.app",
  );
}

// ==================================================
// PAYSTACK
// ==================================================

const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

// ==================================================
// ENVIRONMENT VALIDATION
// ==================================================

// Database
if (!mongoUri) {
  throw new Error("MONGODB_URI is missing from the environment variables.");
}

// Cloudinary
if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error(
    "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be configured.",
  );
}

// JWT
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

// Gmail SMTP
if (!gmailUser) {
  throw new Error("GMAIL_USER is missing from the environment variables.");
}

if (!gmailAppPassword) {
  throw new Error(
    "GMAIL_APP_PASSWORD is missing from the environment variables.",
  );
}

if (!emailFrom) {
  throw new Error("EMAIL_FROM is missing from the environment variables.");
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmailUser)) {
  throw new Error("GMAIL_USER must be a valid email address.");
}

const emailFromAddress = emailFrom.match(/<([^>]+)>/)?.[1] ?? emailFrom;

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFromAddress)) {
  throw new Error("EMAIL_FROM must contain a valid sender email address.");
}

// Paystack test credentials
if (!paystackPublicKey || !paystackPublicKey.startsWith("pk_test_")) {
  throw new Error(
    "PAYSTACK_PUBLIC_KEY must be a valid Paystack test public key starting with pk_test_.",
  );
}

if (!paystackSecretKey || !paystackSecretKey.startsWith("sk_test_")) {
  throw new Error(
    "PAYSTACK_SECRET_KEY must be a valid Paystack test secret key starting with sk_test_.",
  );
}

// ==================================================
// EXPORTED ENVIRONMENT CONFIGURATION
// ==================================================

export const env = {
  PORT: port,

  // Application environment
  NODE_ENV: nodeEnv,
  IS_PRODUCTION: isProduction,

  // Database
  MONGODB_URI: mongoUri,

  // Client
  CLIENT_URL: clientUrl,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: cloudinaryCloudName,
  CLOUDINARY_API_KEY: cloudinaryApiKey,
  CLOUDINARY_API_SECRET: cloudinaryApiSecret,

  // Authentication
  JWT_SECRET: jwtSecret,
  GOOGLE_CLIENT_ID: googleClientId,

  // Gmail SMTP
  GMAIL_USER: gmailUser,
  GMAIL_APP_PASSWORD: gmailAppPassword,
  EMAIL_FROM: emailFrom,

  // Paystack
  PAYSTACK_PUBLIC_KEY: paystackPublicKey,
  PAYSTACK_SECRET_KEY: paystackSecretKey,
};
