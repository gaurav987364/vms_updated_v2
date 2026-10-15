"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotes = exports.toggleFavorite = exports.getProblemProgress = exports.getUserStats = exports.getUserProgress = exports.submitCode = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const http_config_1 = require("../../config/http.config");
const userProgressValidators_1 = require("./userProgressValidators");
const userProgressService_1 = require("./userProgressService");
/**
 * @route   POST /api/v1/progress/submit
 * @desc    Submit code and track progress
 * @access  Private
 */
exports.submitCode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        return res
            .status(http_config_1.HTTPSSTATUS.UNAUTHORIZED)
            .json({ message: "Unauthorized" });
    }
    const body = userProgressValidators_1.submitCodeSchema.parse(req.body);
    // Get test results from code execution (from previous code run)
    const { status = "failed", testsPassed = 0, testsTotal = 1, executionTime, memoryUsed, errorMessage, } = req.body;
    const progress = await (0, userProgressService_1.submitCodeService)(userId, body.problemId, body.code, body.language, status, testsPassed, testsTotal, body.timeSpent, executionTime, memoryUsed, errorMessage);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Code submitted successfully",
        data: progress,
    });
});
/**
 * @route   GET /api/v1/progress
 * @desc    Get user progress for all problems
 * @access  Private
 */
exports.getUserProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        return res
            .status(http_config_1.HTTPSSTATUS.UNAUTHORIZED)
            .json({ message: "Unauthorized" });
    }
    const query = userProgressValidators_1.getProgressQuerySchema.parse(req.query);
    const result = await (0, userProgressService_1.getUserProgressService)(userId, query);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "User progress fetched successfully",
        data: result.progress,
        pagination: result.pagination,
    });
});
/**
 * @route   GET /api/v1/progress/stats
 * @desc    Get user statistics and streak
 * @access  Private
 */
exports.getUserStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        return res
            .status(http_config_1.HTTPSSTATUS.UNAUTHORIZED)
            .json({ message: "Unauthorized" });
    }
    const stats = await (0, userProgressService_1.getUserStatsService)(userId);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "User stats fetched successfully",
        data: stats,
    });
});
/**
 * @route   GET /api/v1/progress/:problemId
 * @desc    Get progress for a specific problem
 * @access  Private
 */
exports.getProblemProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        return res
            .status(http_config_1.HTTPSSTATUS.UNAUTHORIZED)
            .json({ message: "Unauthorized" });
    }
    const problemId = req.params.problemId;
    const progress = await (0, userProgressService_1.getProblemProgressService)(userId, problemId);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Problem progress fetched successfully",
        data: progress,
    });
});
/**
 * @route   POST /api/v1/progress/favorite
 * @desc    Toggle favorite status for a problem
 * @access  Private
 */
exports.toggleFavorite = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        return res
            .status(http_config_1.HTTPSSTATUS.UNAUTHORIZED)
            .json({ message: "Unauthorized" });
    }
    const body = userProgressValidators_1.toggleFavoriteSchema.parse(req.body);
    const progress = await (0, userProgressService_1.toggleFavoriteService)(userId, body.problemId);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Favorite toggled successfully",
        data: progress,
    });
});
/**
 * @route   POST /api/v1/progress/notes
 * @desc    Update notes for a problem
 * @access  Private
 */
exports.updateNotes = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        return res
            .status(http_config_1.HTTPSSTATUS.UNAUTHORIZED)
            .json({ message: "Unauthorized" });
    }
    const body = userProgressValidators_1.updateNotesSchema.parse(req.body);
    const progress = await (0, userProgressService_1.updateNotesService)(userId, body.problemId, body.notes);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Notes updated successfully",
        data: progress,
    });
});
