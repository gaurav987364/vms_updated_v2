import { z } from "zod";

export const userTypeEnum = z.enum(["user", "supplier"]);

export type UserType = z.infer<typeof userTypeEnum>;

const baseUserSchema = {
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),

  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores",
    )
    .trim(),

  department: z
    .string()
    .min(2, "Department must be at least 2 characters")
    .max(100, "Department must not exceed 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  role: z
    .string()
    .min(2, "Role must be at least 2 characters")
    .max(50, "Role must not exceed 50 characters")
    .trim(),

  plantCode: z
    .string()
    .min(1, "Plant code must be at least 1 character")
    .max(20, "Plant code must not exceed 20 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  userType: userTypeEnum,

  supplierCode: z
    .string()
    .min(3, "Supplier code must be at least 3 characters")
    .max(50, "Supplier code must not exceed 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  isPaid: z.boolean().optional(),
};

export const createUserSchema = z
  .object({
    ...baseUserSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // If userType is supplier, supplierCode is required
      if (data.userType === "supplier") {
        return data.supplierCode && data.supplierCode.trim().length >= 3;
      }
      return true;
    },
    {
      message: "Supplier code is required for supplier accounts",
      path: ["supplierCode"],
    }
  );

export const updateUserSchema = z
  .object({
    ...baseUserSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      )
      .optional()
      .or(z.literal("")),

    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export const userListItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
  userType: userTypeEnum,
  department: z.string().optional(),
  plantCode: z.string().optional(),
  supplierCode: z.string().optional(),
  isPaid: z.boolean().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserListItem = z.infer<typeof userListItemSchema>;

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
  supplierCode: "",
  isPaid: false,
};
