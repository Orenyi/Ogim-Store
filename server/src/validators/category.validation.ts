import { z } from "zod";

// ============================================
// CATEGORY IMAGE VALIDATION
// ============================================

const categoryImageSchema = z.object({
  url: z.string().trim().min(1, "Category image URL is required."),

  publicId: z.string().trim().optional().default(""),

  alt: z.string().trim().min(1, "Category image alt text is required."),
});

// ============================================
// CATEGORY FIELD VALIDATION
// ============================================

const categoryFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(80, "Category name cannot exceed 80 characters."),

  slug: z
    .string()
    .trim()
    .min(2, "Category slug must contain at least 2 characters.")
    .max(100, "Category slug cannot exceed 100 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Category slug must contain lowercase letters, numbers and hyphens only.",
    ),

  description: z
    .string()
    .trim()
    .max(500, "Category description cannot exceed 500 characters.")
    .optional()
    .default(""),

  image: categoryImageSchema.nullable().optional(),

  status: z.enum(["active", "archived"]).optional(),
});

// ============================================
// CREATE CATEGORY VALIDATION
// ============================================

export const createCategorySchema = categoryFieldsSchema
  .extend({
    status: z.enum(["active", "archived"]).default("active"),
  })
  .strict();

// ============================================
// UPDATE CATEGORY VALIDATION
// ============================================

export const updateCategorySchema = categoryFieldsSchema
  .partial()
  .strict()
  .refine((category) => Object.keys(category).length > 0, {
    message: "Provide at least one field to update.",
  });

// ============================================
// CATEGORY TYPES
// ============================================

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
