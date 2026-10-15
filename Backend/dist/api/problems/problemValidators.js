"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncProblemsSchema = exports.getTopicsQuerySchema = exports.getProblemsQuerySchema = void 0;
const zod_1 = require("zod");
// Get problems with filters
exports.getProblemsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default("1"),
    limit: zod_1.z.string().optional().default("50"),
    difficulty: zod_1.z.enum(["Easy", "Medium", "Hard"]).optional(),
    tags: zod_1.z.string().optional(), // Comma-separated tags
    search: zod_1.z.string().optional(),
    platform: zod_1.z.enum(["codeforces", "leetcode", "custom"]).optional(),
    minRating: zod_1.z.string().optional(),
    maxRating: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(["newest", "rating", "acceptance"]).optional().default("newest"),
});
// Get topics/tags with count
exports.getTopicsQuerySchema = zod_1.z.object({
    platform: zod_1.z.enum(["codeforces", "leetcode", "custom"]).optional(),
});
// Sync problems from Codeforces API
exports.syncProblemsSchema = zod_1.z.object({
    force: zod_1.z.boolean().optional().default(false), // Force re-sync even if data exists
});
