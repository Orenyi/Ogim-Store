import { setServers } from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

// Use Google's DNS for MongoDB SRV lookups.
setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB Atlas connected successfully");
}
