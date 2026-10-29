import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import ProductModel from "../models/product.model.js";

type SeedProduct = {
  slug: string;
  name: string;
  brand: string;
  model: string;
  condition: "brand-new" | "uk-used" | "refurbished";
  price: number;
  storage: string;
  color: string;
  image: string;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  description: string;
};

/**
 * Initial catalogue data from client/src/data/products.ts.
 *
 * Image URLs currently point to the existing frontend public folder.
 * We'll replace them with Cloudinary URLs after uploading the images.
 */
const products: SeedProduct[] = [
  {
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "Apple",
    model: "iPhone 16 Pro",
    condition: "brand-new",
    price: 1_350_000,
    storage: "256GB",
    color: "Natural Titanium",
    image: "/images/products/iphone-16-pro.webp",
    stockQuantity: 20,
    rating: 4.8,
    reviewCount: 120,
    isFeatured: true,
    description:
      "Brand-new Apple iPhone 16 Pro with 256GB storage in Natural Titanium.",
  },
  {
    slug: "samsung-galaxy-s24",
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    model: "Galaxy S24",
    condition: "uk-used",
    price: 720_000,
    storage: "256GB",
    color: "Phantom Black",
    image: "/images/products/samsung-galaxy-s24.webp",
    stockQuantity: 5,
    rating: 4.6,
    reviewCount: 98,
    isFeatured: true,
    description:
      "UK-used Samsung Galaxy S24 with 256GB storage in Phantom Black.",
  },
  {
    slug: "google-pixel-8",
    name: "Google Pixel 8",
    brand: "Google",
    model: "Pixel 8",
    condition: "refurbished",
    price: 520_000,
    storage: "128GB",
    color: "Obsidian",
    image: "/images/products/google-pixel-8.webp",
    stockQuantity: 12,
    rating: 4.5,
    reviewCount: 64,
    isFeatured: true,
    description: "Refurbished Google Pixel 8 with 128GB storage in Obsidian.",
  },
  {
    slug: "iphone-15",
    name: "iPhone 15",
    brand: "Apple",
    model: "iPhone 15",
    condition: "brand-new",
    price: 980_000,
    storage: "128GB",
    color: "Pink",
    image: "/images/products/iphone-15.webp",
    stockQuantity: 4,
    rating: 4.7,
    reviewCount: 110,
    isFeatured: true,
    description: "Brand-new Apple iPhone 15 with 128GB storage in Pink.",
  },
  {
    slug: "samsung-galaxy-a55",
    name: "Samsung Galaxy A55",
    brand: "Samsung",
    model: "Galaxy A55",
    condition: "brand-new",
    price: 450_000,
    storage: "128GB",
    color: "Awesome Navy",
    image: "/images/products/samsung-galaxy-a55.webp",
    stockQuantity: 6,
    rating: 4.6,
    reviewCount: 52,
    isNewArrival: true,
    description:
      "Brand-new Samsung Galaxy A55 with 128GB storage in Awesome Navy.",
  },
  {
    slug: "tecno-camon-30",
    name: "Tecno Camon 30",
    brand: "Tecno",
    model: "Camon 30",
    condition: "refurbished",
    price: 320_000,
    storage: "256GB",
    color: "Black",
    image: "/images/products/tecno-camon-30.webp",
    stockQuantity: 4,
    rating: 4.4,
    reviewCount: 56,
    isNewArrival: true,
    description: "Refurbished Tecno Camon 30 with 256GB storage in Black.",
  },
  {
    slug: "infinix-zero-40",
    name: "Infinix Zero 40",
    brand: "Infinix",
    model: "Zero 40",
    condition: "brand-new",
    price: 380_000,
    storage: "256GB",
    color: "Violet",
    image: "/images/products/infinix-zero-40.webp",
    stockQuantity: 6,
    rating: 4.5,
    reviewCount: 29,
    isNewArrival: true,
    description: "Brand-new Infinix Zero 40 with 256GB storage in Violet.",
  },
  {
    slug: "xiaomi-14t",
    name: "Xiaomi 14T",
    brand: "Xiaomi",
    model: "14T",
    condition: "refurbished",
    price: 680_000,
    storage: "256GB",
    color: "Titan Gray",
    image: "/images/products/xiaomi-14t.webp",
    stockQuantity: 1,
    rating: 4.5,
    reviewCount: 41,
    isNewArrival: true,
    description: "Refurbished Xiaomi 14T with 256GB storage in Titan Gray.",
  },
  {
    slug: "iphone-14",
    name: "iPhone 14",
    brand: "Apple",
    model: "iPhone 14",
    condition: "uk-used",
    price: 720_000,
    storage: "128GB",
    color: "Midnight",
    image: "/images/products/iphone-14.webp",
    stockQuantity: 20,
    rating: 4.6,
    reviewCount: 73,
    description: "UK-used Apple iPhone 14 with 128GB storage in Midnight.",
  },
  {
    slug: "samsung-galaxy-s23",
    name: "Samsung Galaxy S23",
    brand: "Samsung",
    model: "Galaxy S23",
    condition: "refurbished",
    price: 620_000,
    storage: "256GB",
    color: "Green",
    image: "/images/products/samsung-galaxy-s23.webp",
    stockQuantity: 20,
    rating: 4.5,
    reviewCount: 62,
    description: "Refurbished Samsung Galaxy S23 with 256GB storage in Green.",
  },
  {
    slug: "google-pixel-7",
    name: "Google Pixel 7",
    brand: "Google",
    model: "Pixel 7",
    condition: "uk-used",
    price: 460_000,
    storage: "128GB",
    color: "Snow",
    image: "/images/products/google-pixel-7.webp",
    stockQuantity: 3,
    rating: 4.4,
    reviewCount: 38,
    description: "UK-used Google Pixel 7 with 128GB storage in Snow.",
  },
  {
    slug: "iphone-13",
    name: "iPhone 13",
    brand: "Apple",
    model: "iPhone 13",
    condition: "brand-new",
    price: 550_000,
    storage: "128GB",
    color: "Starlight",
    image: "/images/products/iphone-13.webp",
    stockQuantity: 4,
    rating: 4.5,
    reviewCount: 60,
    description: "Brand-new Apple iPhone 13 with 128GB storage in Starlight.",
  },
];

async function seedProducts(): Promise<void> {
  try {
    await connectDatabase();

    let inserted = 0;
    let updated = 0;

    for (const product of products) {
      const {
        slug,
        name,
        brand,
        model,
        condition,
        price,
        storage,
        color,
        image,
        rating,
        reviewCount,
        isFeatured = false,
        isNewArrival = false,
        description,
      } = product;

      const result = await ProductModel.updateOne(
        { slug },
        {
          $set: {
            name,
            brand,
            model,
            condition,
            price,
            description,
            specifications: { storage, color },
            images: [
              {
                url: image,
                alt: `${name} smartphone in ${color}`,
              },
            ],
            rating,
            reviewCount,
            isFeatured,
            isNewArrival,
          },
          // Only set initial inventory and draft status on insertion.
          // Rerunning this seed will NOT overwrite existing stock.
          $setOnInsert: {
            stockQuantity: product.stockQuantity,
            status: "draft",
          },
        },
        {
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      if (result.upsertedCount > 0) {
        inserted += 1;
        console.log(`Inserted ${name} — stock: ${product.stockQuantity}`);
      } else if (result.modifiedCount > 0) {
        updated += 1;
        console.log(`Updated catalogue details: ${name}`);
      } else {
        console.log(`No changes needed: ${name}`);
      }
    }

    console.log("\nProduct seeding completed.");
    console.log(`New products inserted: ${inserted}`);
    console.log(`Existing products updated: ${updated}`);
    console.log(`Products processed: ${products.length}`);
    console.log(
      "Existing inventory quantities were preserved for matching slugs.",
    );
  } catch (error) {
    console.error("Failed to seed products:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedProducts();
