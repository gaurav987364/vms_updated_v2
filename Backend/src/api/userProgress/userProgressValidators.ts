import { z } from "zod";

/**
 * Schema for submitting code
 */
export const submitCodeSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  timeSpent: z.number().optional().default(0),
});

/**
 * Schema for marking problem as solved
 */
export const markSolvedSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  testsPassed: z.number().min(0),
  testsTotal: z.number().min(1),
  executionTime: z.number().optional(),
  memoryUsed: z.number().optional(),
});

/**
 * Schema for toggling favorite
 */
export const toggleFavoriteSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
});

/**
 * Schema for updating notes
 */
export const updateNotesSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  notes: z.string(),
});

/**
 * Schema for getting progress query
 */
export const getProgressQuerySchema = z.object({
  status: z.enum(["attempted", "solved", "all"]).optional().default("all"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  platform: z.enum(["leetcode", "codeforces"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(["recent", "oldest", "difficulty", "attempts"])
    .optional()
    .default("recent"),
});

export type SubmitCodeInput = z.infer<typeof submitCodeSchema>;
export type MarkSolvedInput = z.infer<typeof markSolvedSchema>;
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
export type UpdateNotesInput = z.infer<typeof updateNotesSchema>;
export type GetProgressQuery = z.infer<typeof getProgressQuerySchema>;
