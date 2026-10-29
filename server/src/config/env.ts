import "dotenv/config";

const mongoUri = process.env.MONGODB_URI;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing from the .env file");
}

if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error(
    "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be configured in the .env file",
  );
}

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: mongoUri,
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
  CLOUDINARY_CLOUD_NAME: cloudinaryCloudName,
  CLOUDINARY_API_KEY: cloudinaryApiKey,
  CLOUDINARY_API_SECRET: cloudinaryApiSecret,
};
