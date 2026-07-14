import { z } from "zod";

/**
 * User List Validators
 * ------------------------------------------------------
 * Zod schemas for validating user list operations
 */

// Update user schema (password optional, all fields optional for partial updates)
export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().trim().toLowerCase().email("Invalid email format").max(100).optional(),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50).optional(),
  department: z.string().trim().optional().transform(val => val === "" ? undefined : val),
  role: z.string().trim().min(2, "Role must be at least 2 characters").max(50).optional(),
  plantCode: z.string().trim().optional().transform(val => val === "" ? undefined : val),
  userType: z.enum(["user", "supplier"]).optional(),
  supplierCode: z.string().trim().optional().transform(val => val === "" ? undefined : val),
  isPaid: z.boolean().optional(),
  password: z.string().trim().min(8, "Password must be at least 8 characters").max(100).optional().transform(val => val === "" ? undefined : val),
});

// Query params validation for list
export const listQuerySchema = z.object({
  page: z.string().optional().default("1").transform((val) => parseInt(val, 10)),
  perPage: z.string().optional().default("10").transform((val) => parseInt(val, 10)),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional().default("createdAt"),
  userType: z.enum(["user", "supplier"]).optional(),
});

// MongoDB ObjectId validation
export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format");
