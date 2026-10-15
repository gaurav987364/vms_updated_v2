"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgressQuerySchema = exports.updateNotesSchema = exports.toggleFavoriteSchema = exports.markSolvedSchema = exports.submitCodeSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for submitting code
 */
exports.submitCodeSchema = zod_1.z.object({
    problemId: zod_1.z.string().min(1, "Problem ID is required"),
    code: zod_1.z.string().min(1, "Code is required"),
    language: zod_1.z.string().min(1, "Language is required"),
    timeSpent: zod_1.z.number().optional().default(0),
});
/**
 * Schema for marking problem as solved
 */
exports.markSolvedSchema = zod_1.z.object({
    problemId: zod_1.z.string().min(1, "Problem ID is required"),
    testsPassed: zod_1.z.number().min(0),
    testsTotal: zod_1.z.number().min(1),
    executionTime: zod_1.z.number().optional(),
    memoryUsed: zod_1.z.number().optional(),
});
/**
 * Schema for toggling favorite
 */
exports.toggleFavoriteSchema = zod_1.z.object({
    problemId: zod_1.z.string().min(1, "Problem ID is required"),
});
/**
 * Schema for updating notes
 */
exports.updateNotesSchema = zod_1.z.object({
    problemId: zod_1.z.string().min(1, "Problem ID is required"),
    notes: zod_1.z.string(),
});
/**
 * Schema for getting progress query
 */
exports.getProgressQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(["attempted", "solved", "all"]).optional().default("all"),
    difficulty: zod_1.z.enum(["Easy", "Medium", "Hard"]).optional(),
    platform: zod_1.z.enum(["leetcode", "codeforces"]).optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
    sortBy: zod_1.z
        .enum(["recent", "oldest", "difficulty", "attempts"])
        .optional()
        .default("recent"),
});
