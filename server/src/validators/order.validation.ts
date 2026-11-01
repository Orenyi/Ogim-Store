import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

const phoneRegex = /^(?:0[789]\d{9}|\+?234[789]\d{9})$/;

const checkoutItemSchema = z.object({
  productId: z.string().regex(objectIdRegex, "Invalid product ID."),

  quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(99, "Quantity cannot exceed 99."),
});

const deliveryAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(120, "Full name cannot exceed 120 characters."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(254, "Email address is too long."),

  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Please provide a valid Nigerian phone number."),

  state: z
    .string()
    .trim()
    .min(2, "State is required.")
    .max(80, "State name is too long."),

  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(100, "City name is too long."),

  address: z
    .string()
    .trim()
    .min(5, "Please provide a complete delivery address.")
    .max(500, "Delivery address cannot exceed 500 characters."),

  instructions: z
    .string()
    .trim()
    .max(500, "Delivery instructions cannot exceed 500 characters.")
    .optional()
    .default(""),
});

export const createOrderSchema = z
  .object({
    items: z
      .array(checkoutItemSchema)
      .min(1, "Select at least one product to checkout.")
      .max(100, "An order cannot contain more than 100 items."),

    deliveryAddress: deliveryAddressSchema,

    deliveryMethod: z.enum(["standard", "express", "same-day"], {
      error: "Please select a valid delivery method.",
    }),
  })
  .superRefine((data, ctx) => {
    const productIds = data.items.map((item) => item.productId);

    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Duplicate products are not allowed in an order.",
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
