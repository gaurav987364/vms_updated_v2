"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSubmissions = exports.submitCode = exports.runCode = void 0;
const codeService_1 = require("./codeService");
/**
 * Run code against test cases
 */
const runCode = async (req, res) => {
    try {
        const { problemId, code, language, testCases } = req.body;
        if (!problemId || !code || !language || !testCases) {
            return res.status(400).json({
                message: "Missing required fields: problemId, code, language, testCases",
            });
        }
        const results = await (0, codeService_1.runCodeService)({
            problemId,
            code,
            language,
            testCases,
        });
        res.status(200).json({
            message: "Code executed successfully",
            data: results,
        });
    }
    catch (error) {
        console.error("Error in runCode:", error);
        res.status(500).json({
            message: error.message || "Failed to execute code",
        });
    }
};
exports.runCode = runCode;
/**
 * Submit code for evaluation
 */
const submitCode = async (req, res) => {
    try {
        const userId = req.user?.id; // From JWT authentication
        const { problemId, code, language } = req.body;
        if (!userId) {
            return res.status(401).json({
                message: "User authentication required",
            });
        }
        if (!problemId || !code || !language) {
            return res.status(400).json({
                message: "Missing required fields: problemId, code, language",
            });
        }
        const result = await (0, codeService_1.submitCodeService)(userId, {
            problemId,
            code,
            language,
        });
        res.status(200).json({
            message: result.accepted ? "Solution accepted!" : "Solution not accepted",
            data: result,
        });
    }
    catch (error) {
        console.error("Error in submitCode:", error);
        res.status(500).json({
            message: error.message || "Failed to submit code",
        });
    }
};
exports.submitCode = submitCode;
/**
 * Get user submissions for a problem
 */
const getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user?.id; // From JWT authentication
        const problemId = typeof req.params.problemId === 'string'
            ? req.params.problemId
            : req.params.problemId?.[0];
        if (!problemId || !userId) {
            return res.status(400).json({
                message: "Problem ID and user authentication are required",
            });
        }
        const submissions = await (0, codeService_1.getUserSubmissionsService)(userId, problemId);
        res.status(200).json({
            message: "Submissions fetched successfully",
            data: submissions,
            count: submissions.length,
        });
    }
    catch (error) {
        console.error("Error in getUserSubmissions:", error);
        res.status(500).json({
            message: error.message || "Failed to fetch submissions",
        });
    }
};
exports.getUserSubmissions = getUserSubmissions;
