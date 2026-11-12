import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().trim().min(1, "Image URL is required"),
  publicId: z.string().trim().optional(),
  alt: z.string().trim().min(1, "Image alt text is required"),
});

const productSpecificationsSchema = z.object({
  storage: z.string().trim().optional(),
  ram: z.string().trim().optional(),
  color: z.string().trim().optional(),
  display: z.string().trim().optional(),
  battery: z.string().trim().optional(),
  camera: z.string().trim().optional(),
  operatingSystem: z.string().trim().optional(),
  network: z.string().trim().optional(),
  processor: z.string().trim().optional(),
  additionalFeatures: z.array(z.string().trim()).optional(),
});

const productSkuSchema = z
  .string()
  .trim()
  .min(1, "Product SKU is required")
  .max(80, "SKU cannot exceed 80 characters")
  .regex(
    /^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/,
    "SKU can contain letters, numbers, hyphens and underscores",
  )
  .transform((value) => value.toUpperCase());

const productCategoryIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "A valid product category ID is required");

const productFieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only",
    ),

  sku: productSkuSchema,

  brand: z.string().trim().min(1).max(60),

  model: z.string().trim().min(1).max(100),

  categoryId: productCategoryIdSchema,

  description: z.string().trim().min(10).max(5000),

  specifications: productSpecificationsSchema,

  price: z.number().finite().min(0),

  compareAtPrice: z.number().finite().positive().optional(),

  images: z.array(productImageSchema).min(1).max(10),

  stockQuantity: z.number().int().min(0),

  condition: z.enum(["brand-new", "uk-used", "refurbished"]),

  status: z.enum(["draft", "published", "archived"]).optional(),

  isFeatured: z.boolean().optional(),

  isNewArrival: z.boolean().optional(),

  rating: z.number().min(0).max(5).optional(),

  reviewCount: z.number().int().min(0).optional(),
});

export const createProductSchema = productFieldsSchema
  .extend({
    status: z.enum(["draft", "published", "archived"]).default("published"),
  })
  .strict()
  .superRefine((product, ctx) => {
    if (
      product.compareAtPrice !== undefined &&
      product.compareAtPrice <= product.price
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "Compare-at price must be greater than the selling price",
      });
    }
  });

export const updateProductSchema = productFieldsSchema
  .partial()
  .strict()
  .superRefine((product, ctx) => {
    if (
      product.price !== undefined &&
      product.compareAtPrice !== undefined &&
      product.compareAtPrice <= product.price
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "Compare-at price must be greater than the selling price",
      });
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
