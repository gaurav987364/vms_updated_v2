"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeetCodeProblem = exports.syncLeetCodeProblems = void 0;
const leetcodeService_1 = require("./leetcodeService");
/**
 * Sync LeetCode problems to database
 */
const syncLeetCodeProblems = async (req, res) => {
    try {
        const { limit } = req.body;
        const limitNum = parseInt(limit) || 100;
        if (limitNum < 1 || limitNum > 500) {
            return res.status(400).json({
                message: "Limit must be between 1 and 500",
            });
        }
        const result = await (0, leetcodeService_1.syncLeetCodeProblemsService)(limitNum);
        res.status(200).json({
            message: result.message,
            data: result,
        });
    }
    catch (error) {
        console.error("Error in syncLeetCodeProblems:", error);
        res.status(500).json({
            message: error.message || "Failed to sync LeetCode problems",
        });
    }
};
exports.syncLeetCodeProblems = syncLeetCodeProblems;
/**
 * Get LeetCode problem details by slug
 */
const getLeetCodeProblem = async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug || typeof slug !== "string") {
            return res.status(400).json({
                message: "Problem slug is required",
            });
        }
        const problem = await (0, leetcodeService_1.getLeetCodeProblemBySlug)(slug);
        res.status(200).json({
            message: "Problem fetched successfully",
            data: problem,
        });
    }
    catch (error) {
        console.error("Error in getLeetCodeProblem:", error);
        res.status(500).json({
            message: error.message || "Failed to get LeetCode problem",
        });
    }
};
exports.getLeetCodeProblem = getLeetCodeProblem;
