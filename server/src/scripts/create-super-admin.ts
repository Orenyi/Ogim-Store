import "dotenv/config";

import argon2 from "argon2";
import mongoose from "mongoose";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import User from "../models/User.js";
import { env } from "../config/env.js";
import { setServers } from "node:dns";

async function readHiddenPassword(prompt: string): Promise<string> {
  output.write(prompt);

  if (!input.isTTY || !output.isTTY) {
    throw new Error("Run this script in an interactive terminal.");
  }

  input.setRawMode(true);
  input.resume();

  let password = "";

  try {
    while (true) {
      const character = await new Promise<string>((resolve) => {
        input.once("data", (data: Buffer) => {
          resolve(data.toString());
        });
      });

      for (const char of character) {
        if (char === "\u0003") {
          throw new Error("Password entry cancelled.");
        }

        if (char === "\r" || char === "\n") {
          output.write("\n");
          return password;
        }

        if (char === "\u007f" || char === "\b") {
          password = password.slice(0, -1);
          continue;
        }

        if (char >= " ") {
          password += char;
        }
      }
    }
  } finally {
    input.setRawMode(false);
    input.pause();
  }
}

async function main(): Promise<void> {
  const terminal = createInterface({ input, output });

  try {
    console.log("\n=== Ogim Store — Super Admin Setup ===\n");

    await mongoose.connect(env.MONGODB_URI);

    if (await User.exists({ role: "admin" })) {
      throw new Error("An admin already exists. Setup stopped.");
    }

    const fullName = (await terminal.question("Full name: ")).trim();
    const email = (await terminal.question("Admin email: "))
      .trim()
      .toLowerCase();

    const password = await readHiddenPassword("Create password: ");
    const confirmation = await readHiddenPassword("Confirm password: ");

    if (fullName.length < 2 || fullName.length > 100) {
      throw new Error("Full name must contain 2–100 characters.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }

    if (password.length < 12) {
      throw new Error("Password must contain at least 12 characters.");
    }

    if (password !== confirmation) {
      throw new Error("Passwords do not match.");
    }

    if (await User.exists({ email })) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    const admin = await User.create({
      fullName,
      email,
      passwordHash,
      role: "admin",
      status: "active",
      acceptedTermsAt: new Date(),
      emailVerifiedAt: new Date(),
    });

    console.log("\nSuper Admin created successfully.");
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log("You can now sign in through the admin login page.");
  } finally {
    terminal.close();
    await mongoose.disconnect();
  }
}

// Use Google DNS for MongoDB Atlas SRV record resolution.
setServers(["8.8.8.8", "8.8.4.4"]);

main().catch((error: unknown) => {
  console.error(
    "\nSuper Admin setup failed:",
    error instanceof Error ? error.message : error,
  );

  process.exitCode = 1;
});
