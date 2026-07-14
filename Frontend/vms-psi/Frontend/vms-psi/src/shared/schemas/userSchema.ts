import { z } from "zod"

/**
 * User Validation Schemas
 * ------------------------------------------------------
 * Comprehensive Zod schemas for user data validation.
 * Includes both create and update schemas with proper validation rules.
 */

// User type enum
export const userTypeEnum = z.enum(["user", "supplier"], {
  required_error: "User type is required",
  invalid_type_error: "User type must be either 'user' or 'supplier'",
})

export type UserType = z.infer<typeof userTypeEnum>

// Base user schema for common fields
const baseUserSchema = {
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),

  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),

  username: z
    .string({
      required_error: "Username is required",
    })
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    )
    .trim(),

  department: z
    .string({
      required_error: "Department is required",
    })
    .min(2, "Department must be at least 2 characters")
    .max(100, "Department must not exceed 100 characters")
    .trim(),

  role: z
    .string({
      required_error: "Role is required",
    })
    .min(2, "Role must be at least 2 characters")
    .max(50, "Role must not exceed 50 characters")
    .trim(),

  plantCode: z
    .string({
      required_error: "Plant code is required",
    })
    .min(1, "Plant code is required")
    .max(20, "Plant code must not exceed 20 characters")
    .trim(),

  userType: userTypeEnum,
}

// Create user schema (includes password fields)
export const createUserSchema = z
  .object({
    ...baseUserSchema,
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),

    confirmPassword: z.string({
      required_error: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Update user schema (password optional)
export const updateUserSchema = z
  .object({
    ...baseUserSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .optional()
      .or(z.literal("")),

    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Only validate password match if password is provided
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword
      }
      return true
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  )

// User list item schema (for API responses)
export const userListItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
  userType: userTypeEnum,
  department: z.string().optional(),
  plantCode: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
})

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserListItem = z.infer<typeof userListItemSchema>

// Default values for form
export const defaultUserValues: Partial<CreateUserInput> = {
  name: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  department: "",
  role: "",
  plantCode: "",
  userType: "user",
}
