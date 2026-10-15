import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("Invalid email address").max(100),
    username: z.string().trim().min(3, "Username must be at least 3 characters").max(50),
    password: z.string().trim().min(6, "Password must be at least 6 characters").max(12),
    confirmPassword: z.string().trim().min(6).max(12),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });



export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().trim().min(6, "Password must be at least 6 characters").max(12),
  userAgent: z.string().optional(),
});


export const resetPasswordSchema = z.object({
  password: z.string().trim().min(6).max(12),
  verificationCode: z.string().trim().min(1).max(200),
});

export const emailSchema = z.string().trim().min(6).max(100).email();

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().trim().email("Invalid email address").max(100).optional(),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().trim().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().trim().min(8, "New password must be at least 8 characters").max(50),
});