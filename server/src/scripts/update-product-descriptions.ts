import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import ProductModel from "../models/product.model.js";

const descriptions: Record<string, string> = {
  "iphone-16-pro":
    "The brand-new Apple iPhone 16 Pro comes with 256GB of storage and a Natural Titanium finish. It is a premium option for shoppers seeking a modern iPhone for photography, communication, entertainment, and everyday productivity.",

  "samsung-galaxy-s24":
    "This UK-used Samsung Galaxy S24 offers 256GB of storage in Phantom Black. It suits shoppers who want a compact premium Android phone for daily communication, apps, photography, streaming, and managing everyday tasks.",

  "google-pixel-8":
    "This refurbished Google Pixel 8 comes with 128GB of storage and an Obsidian finish. It is a practical choice for shoppers interested in Google's Android experience, everyday photography, apps, and personal productivity.",

  "iphone-15":
    "The brand-new Apple iPhone 15 features 128GB of storage and a Pink finish. It is suited to shoppers looking for an everyday iPhone for staying connected, capturing photos, enjoying apps, and handling daily tasks.",

  "samsung-galaxy-a55":
    "This brand-new Samsung Galaxy A55 comes with 128GB of storage and an Awesome Navy finish. It offers a versatile option for shoppers seeking an Android phone for communication, entertainment, photography, and regular everyday use.",

  "tecno-camon-30":
    "This refurbished Tecno Camon 30 has 256GB of storage and a Black finish. It is an option for shoppers seeking a capable everyday smartphone for social apps, photos, entertainment, and keeping personal content accessible.",

  "infinix-zero-40":
    "The brand-new Infinix Zero 40 comes with 256GB of storage and a Violet finish. It is a stylish option for shoppers who want room for apps, photos, videos, communication, and everyday entertainment.",

  "xiaomi-14t":
    "This refurbished Xiaomi 14T comes with 256GB of storage and a Titan Gray finish. It may suit shoppers looking for an Android smartphone for everyday communication, media, apps, photography, and personal productivity.",

  "iphone-14":
    "This UK-used Apple iPhone 14 includes 128GB of storage and a Midnight finish. It is a practical choice for shoppers who want an iPhone for everyday communication, photography, streaming, apps, and staying organized.",

  "samsung-galaxy-s23":
    "This refurbished Samsung Galaxy S23 comes with 256GB of storage and a Green finish. It is suited to shoppers seeking a premium-style Android experience for daily communication, apps, entertainment, and capturing everyday moments.",

  "google-pixel-7":
    "This UK-used Google Pixel 7 comes with 128GB of storage and a Snow finish. It suits shoppers interested in Google's Android experience for everyday photography, communication, apps, streaming, and personal productivity.",

  "iphone-13":
    "The brand-new Apple iPhone 13 comes with 128GB of storage and a Starlight finish. It is a straightforward option for shoppers seeking an iPhone for everyday communication, photography, entertainment, and commonly used apps.",
};

async function updateProductDescriptions(): Promise<void> {
  try {
    // Validate all descriptions before connecting to the database.
    for (const [slug, description] of Object.entries(descriptions)) {
      const wordCount = description.trim().split(/\s+/).length;

      if (wordCount < 30 || wordCount > 40) {
        throw new Error(
          `Description for "${slug}" has ${wordCount} words. Expected 30–40.`,
        );
      }
    }

    await connectDatabase();

    let updated = 0;
    let unchanged = 0;
    const missingSlugs: string[] = [];

    for (const [slug, description] of Object.entries(descriptions)) {
      const result = await ProductModel.updateOne(
        { slug },
        { $set: { description } },
        { runValidators: true },
      );

      if (result.matchedCount === 0) {
        missingSlugs.push(slug);
        console.warn(`Product not found: ${slug}`);
      } else if (result.modifiedCount > 0) {
        updated += 1;
        console.log(`Updated description: ${slug}`);
      } else {
        unchanged += 1;
        console.log(`Description already up to date: ${slug}`);
      }
    }

    console.log("\nDescription migration completed.");
    console.log(`Descriptions updated: ${updated}`);
    console.log(`Already up to date: ${unchanged}`);
    console.log(`Products not found: ${missingSlugs.length}`);
    console.log(`Descriptions validated: ${Object.keys(descriptions).length}`);

    if (missingSlugs.length > 0) {
      console.warn("Check these slugs in MongoDB:", missingSlugs);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Failed to update product descriptions:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void updateProductDescriptions();
