import "dotenv/config";
import { sendTestEmail } from "../services/email.service.js";

async function main() {
  const recipientEmail = process.argv[2];

  if (!recipientEmail) {
    throw new Error(
      "Please provide a recipient email address.\n" +
        "Example: npm run test:email -- your-email@gmail.com",
    );
  }

  try {
    console.log("Sending Ogim Store test email...");

    const result = await sendTestEmail({
      to: recipientEmail,
    });

    console.log("Email successfully accepted by Resend!");
    console.log("Email ID:", result.id);
  } catch (error) {
    console.error("Failed to send test email:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  }
}

main();
