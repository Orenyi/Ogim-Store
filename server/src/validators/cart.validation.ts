import { z } from "zod";

const productIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid product ID.");

const cartQuantitySchema = z.number().int().min(1).max(99);

// POST /api/v1/cart/items
export const addCartItemSchema = z
  .object({
    productId: productIdSchema,
    quantity: cartQuantitySchema,
  })
  .strict();

// PATCH /api/v1/cart/items/:productId
export const updateCartItemSchema = z
  .object({
    quantity: cartQuantitySchema,
  })
  .strict();

// POST /api/v1/cart/merge
export const mergeGuestCartSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: productIdSchema,
            quantity: cartQuantitySchema,
          })
          .strict(),
      )
      .max(100, "A maximum of 100 cart items can be synchronized."),
  })
  .strict();

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeGuestCartInput = z.infer<typeof mergeGuestCartSchema>;
