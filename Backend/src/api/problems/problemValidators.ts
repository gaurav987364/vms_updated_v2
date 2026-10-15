import { z } from "zod";

// Get problems with filters
export const getProblemsQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("50"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  tags: z.string().optional(), // Comma-separated tags
  search: z.string().optional(),
  platform: z.enum(["codeforces", "leetcode", "custom"]).optional(),
  minRating: z.string().optional(),
  maxRating: z.string().optional(),
  sortBy: z.enum(["newest", "rating", "acceptance"]).optional().default("newest"),
});

// Get topics/tags with count
export const getTopicsQuerySchema = z.object({
  platform: z.enum(["codeforces", "leetcode", "custom"]).optional(),
});

// Sync problems from Codeforces API
export const syncProblemsSchema = z.object({
  force: z.boolean().optional().default(false), // Force re-sync even if data exists
});

export type GetProblemsQuery = z.infer<typeof getProblemsQuerySchema>;
export type GetTopicsQuery = z.infer<typeof getTopicsQuerySchema>;
export type SyncProblemsBody = z.infer<typeof syncProblemsSchema>;
