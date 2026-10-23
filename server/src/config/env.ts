import "dotenv/config";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing from the .env file");
}

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: mongoUri,
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
};
