import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().min(2).max(100).email(),
    username: z.string().trim().min(3).max(50),
    password: z.string().trim().min(6).max(12),
    confirmPassword: z.string().trim().min(6).max(12),
    department: z.string().trim().min(2).max(100).optional(),
    role: z.string().trim().min(2).max(50),
    plantCode: z.string().trim().min(1).max(20).optional(),
    userType: z.enum(["user", "supplier"]).default("user"),
    supplierCode: z.string().trim().min(3).max(50).optional(),
    isPaid: z.boolean().optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords Do Not Match.",
    path: ["confirmPassword"],
  })
  .refine(
    (value) => {
      // If userType is supplier, supplierCode is required
      if (value.userType === "supplier") {
        return value.supplierCode && value.supplierCode.trim().length >= 3;
      }
      return true;
    },
    {
      message: "Supplier code is required for supplier accounts",
      path: ["supplierCode"],
    }
  );



export const loginSchema = z.object({
  email: z.string().trim().optional(),
  supplierCode: z.string().trim().optional(),
  password: z.string().trim().min(6).max(12),
  userAgent: z.string().optional(),
  loginType: z.enum(["user", "supplier"]).default("user"),
}).refine(
  (data) => {
    // For user login, email is required
    if (data.loginType === "user") {
      return data.email && data.email.length >= 6;
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
);


export const resetPasswordSchema = z.object({
  password: z.string().trim().min(6).max(12),
  verificationCode: z.string().trim().min(1).max(200),
});

export const emailSchema = z.string().trim().min(6).max(100).email();