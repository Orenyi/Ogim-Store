import { z } from "zod";

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeNigerianPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("234")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return `234${digits}`;
}

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254)
  .transform(normalizeEmail);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be 128 characters or fewer.")
  .refine((value) => /[a-z]/.test(value), "Include a lowercase letter.")
  .refine((value) => /[A-Z]/.test(value), "Include an uppercase letter.")
  .refine((value) => /\d/.test(value), "Include a number.")
  .refine(
    (value) => /[^A-Za-z0-9]/.test(value),
    "Include a special character.",
  );

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: emailSchema,
    phoneNumber: z
      .string()
      .trim()
      .max(10)
      .optional()
      .transform((value) => {
        if (!value) return undefined;
        return normalizeNigerianPhone(value);
      })
      .refine(
        (phone) => phone === undefined || /^234[789]\d{9}$/.test(phone),
        "Enter a valid Nigerian mobile number.",
      ),
    password: passwordSchema,
    acceptedTerms: z.literal(true),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),
    rememberMe: z.boolean().optional().default(false),
  })
  .strict();

export const googleLoginSchema = z
  .object({
    credential: z.string().min(1).max(8192),
    acceptedTerms: z.boolean().optional().default(false),
    phoneNumber: z
      .string()
      .trim()
      .max(10)
      .optional()
      .transform((value) => {
        if (!value) return undefined;
        return normalizeNigerianPhone(value);
      })
      .refine(
        (phone) => phone === undefined || /^234[789]\d{9}$/.test(phone),
        "Enter a valid Nigerian mobile number.",
      ),
  })
  .strict();

export const refreshSchema = z.object({}).strict();

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(256),
    password: passwordSchema,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
