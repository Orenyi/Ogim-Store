import "dotenv/config";

const mongoUri = process.env.MONGODB_URI;

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

const jwtSecret = process.env.JWT_SECRET;

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing from the .env file.");
}

if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error(
    "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be configured in the .env file.",
  );
}

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is missing from the .env file.");
}

if (!emailFrom) {
  throw new Error("EMAIL_FROM is missing from the .env file.");
}

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: mongoUri,
  CLIENT_URL: clientUrl,

  CLOUDINARY_CLOUD_NAME: cloudinaryCloudName,
  CLOUDINARY_API_KEY: cloudinaryApiKey,
  CLOUDINARY_API_SECRET: cloudinaryApiSecret,

  JWT_SECRET: jwtSecret,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",

  RESEND_API_KEY: resendApiKey,
  EMAIL_FROM: emailFrom,

  NODE_ENV: process.env.NODE_ENV ?? "development",
};
