// src/features/auth/schema.ts

import { z } from "zod"

/**
 * loginSchema
 * ------------------------------------------------------
 * Single source of truth for login form validation.
 * Supports both user login (via email) and supplier login (via email or supplier code).
 * ------------------------------------------------------
 */
export const loginSchema = z.object({
  loginType: z.enum(["user", "supplier"]).default("user"),
  email: z.string().optional(),
  supplierCode: z.string().optional(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
  isPaidSupplier: z.boolean().optional(),
}).refine(
  (data) => {
    // For user login, email is required
    if (data.loginType === "user") {
      return data.email && data.email.length >= 6 && data.email.includes("@");
    }
    // For supplier login, either email or supplierCode is required
    if (data.loginType === "supplier") {
      return (data.email && data.email.length >= 6) || (data.supplierCode && data.supplierCode.length >= 3);
    }
    return false;
  },
  {
    message: "Email is required for user login, and email or supplier code is required for supplier login",
    path: ["email"],
  }
)

// Infer the TS type directly from the schema — never hand-write this type separately,
// or it can drift out of sync with the validation rules.
export type LoginFormValues = z.infer<typeof loginSchema>

/**
 * forgotPasswordSchema
 * ------------------------------------------------------
 * Validation for forgot password email input.
 * ------------------------------------------------------
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email is too long"),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

/**
 * resetPasswordSchema
 * ------------------------------------------------------
 * Validation for reset password form.
 * Must match backend requirements: 6-12 characters, passwords match.
 * ------------------------------------------------------
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(12, "Password must not exceed 12 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
