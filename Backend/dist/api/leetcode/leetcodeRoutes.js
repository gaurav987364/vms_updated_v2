"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leetcodeController_1 = require("./leetcodeController");
const router = (0, express_1.Router)();
/**
 * POST /leetcode/sync
 * Sync LeetCode problems to database
 * Body: { limit: number } (default: 100, max: 500)
 */
router.post("/sync", leetcodeController_1.syncLeetCodeProblems);
/**
 * GET /leetcode/:slug
 * Get LeetCode problem details by slug
 */
router.get("/:slug", leetcodeController_1.getLeetCodeProblem);
exports.default = router;
