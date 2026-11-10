import "dotenv/config";

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

// ==================================================
// GMAIL SMTP CONFIGURATION
// ==================================================

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;

// ==================================================
// CLIENT
// ==================================================

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

// ==================================================
// PAYSTACK
// ==================================================

const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

// ==================================================
// ENVIRONMENT VALIDATION
// ==================================================

// MongoDB
if (!mongoUri) {
  throw new Error("MONGODB_URI is missing from the .env file.");
}

// Cloudinary
if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error(
    "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be configured in the .env file.",
  );
}

// JWT
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

// Gmail SMTP
if (!gmailUser) {
  throw new Error("GMAIL_USER is missing from the .env file.");
}

if (!gmailAppPassword) {
  throw new Error("GMAIL_APP_PASSWORD is missing from the .env file.");
}

if (!emailFrom) {
  throw new Error("EMAIL_FROM is missing from the .env file.");
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmailUser)) {
  throw new Error("GMAIL_USER must be a valid email address.");
}

if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    emailFrom.match(/<([^>]+)>/)?.[1] ?? emailFrom,
  )
) {
  throw new Error("EMAIL_FROM must contain a valid sender email address.");
}

// Paystack test credentials
if (!paystackPublicKey || !paystackPublicKey.startsWith("pk_test_")) {
  throw new Error(
    "PAYSTACK_PUBLIC_KEY is missing or invalid. A Paystack test public key starting with pk_test_ is required.",
  );
}

if (!paystackSecretKey || !paystackSecretKey.startsWith("sk_test_")) {
  throw new Error(
    "PAYSTACK_SECRET_KEY is missing or invalid. A Paystack test secret key starting with sk_test_ is required.",
  );
}

// ==================================================
// EXPORTED ENVIRONMENT CONFIGURATION
// ==================================================

export const env = {
  PORT: Number(process.env.PORT ?? 5000),

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
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",

  // Gmail SMTP
  GMAIL_USER: gmailUser,
  GMAIL_APP_PASSWORD: gmailAppPassword,
  EMAIL_FROM: emailFrom,

  // Paystack
  PAYSTACK_PUBLIC_KEY: paystackPublicKey,
  PAYSTACK_SECRET_KEY: paystackSecretKey,

  // Application environment
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
