import { Router } from "express";
import { syncLeetCodeProblems, getLeetCodeProblem } from "./leetcodeController";

const router = Router();

/**
 * POST /leetcode/sync
 * Sync LeetCode problems to database
 * Body: { limit: number } (default: 100, max: 500)
 */
router.post("/sync", syncLeetCodeProblems);

/**
 * GET /leetcode/:slug
 * Get LeetCode problem details by slug
 */
router.get("/:slug", getLeetCodeProblem);

export default router;
