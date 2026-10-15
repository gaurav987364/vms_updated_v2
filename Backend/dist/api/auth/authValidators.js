"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.emailSchema = exports.resetPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: zod_1.z.string().trim().email("Invalid email address").max(100),
    username: zod_1.z.string().trim().min(3, "Username must be at least 3 characters").max(50),
    password: zod_1.z.string().trim().min(6, "Password must be at least 6 characters").max(12),
    confirmPassword: zod_1.z.string().trim().min(6).max(12),
})
    .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("Invalid email address"),
    password: zod_1.z.string().trim().min(6, "Password must be at least 6 characters").max(12),
    userAgent: zod_1.z.string().optional(),
});
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().trim().min(6).max(12),
    verificationCode: zod_1.z.string().trim().min(1).max(200),
});
exports.emailSchema = zod_1.z.string().trim().min(6).max(100).email();
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
    email: zod_1.z.string().trim().email("Invalid email address").max(100).optional(),
    username: zod_1.z.string().trim().min(3, "Username must be at least 3 characters").max(50).optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().trim().min(6, "Password must be at least 6 characters"),
    newPassword: zod_1.z.string().trim().min(8, "New password must be at least 8 characters").max(50),
});
