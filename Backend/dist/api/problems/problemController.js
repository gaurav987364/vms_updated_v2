"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProblemById = exports.getProblemStats = exports.getTopics = exports.getProblems = exports.syncProblems = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const http_config_1 = require("../../config/http.config");
const problemValidators_1 = require("./problemValidators");
const problemService_1 = require("./problemService");
/**
 * @route   POST /api/v1/problems/sync
 * @desc    Sync problems from Codeforces API to database
 * @access  Private (Admin only - can add auth middleware later)
 */
exports.syncProblems = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = problemValidators_1.syncProblemsSchema.parse(req.body);
    const result = await (0, problemService_1.syncCodeforcesProblemsService)(body.force);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: result.message,
        data: {
            count: result.count,
            synced: result.synced,
        },
    });
});
/**
 * @route   GET /api/v1/problems
 * @desc    Get problems with filters and pagination
 * @access  Public
 */
exports.getProblems = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = problemValidators_1.getProblemsQuerySchema.parse(req.query);
    const result = await (0, problemService_1.getProblemsService)(query);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Problems fetched successfully",
        data: result.problems,
        pagination: result.pagination,
    });
});
/**
 * @route   GET /api/v1/problems/topics
 * @desc    Get all unique topics/tags with problem counts
 * @access  Public
 */
exports.getTopics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = problemValidators_1.getTopicsQuerySchema.parse(req.query);
    const topics = await (0, problemService_1.getTopicsService)(query.platform);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Topics fetched successfully",
        data: topics,
        count: topics.length,
    });
});
/**
 * @route   GET /api/v1/problems/stats
 * @desc    Get problem statistics (total, by difficulty, by platform)
 * @access  Public
 */
exports.getProblemStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = problemValidators_1.getTopicsQuerySchema.parse(req.query);
    const stats = await (0, problemService_1.getProblemStatsService)(query.platform);
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Problem statistics fetched successfully",
        data: stats,
    });
});
/**
 * @route   GET /api/v1/problems/:id
 * @desc    Get a single problem by ID
 * @access  Public
 */
exports.getProblemById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const ProblemModel = (await Promise.resolve().then(() => __importStar(require("./problemModel")))).default;
    const problem = await ProblemModel.findById(id).select("-__v").lean();
    if (!problem) {
        return res.status(http_config_1.HTTPSSTATUS.NOT_FOUND).json({
            message: "Problem not found",
        });
    }
    // Generate mock test cases if none exist
    if (!problem.testCases || problem.testCases.length === 0) {
        problem.testCases = [
            {
                input: "5\n1 2 3 4 5",
                expectedOutput: "15",
                isHidden: false,
            },
            {
                input: "3\n10 20 30",
                expectedOutput: "60",
                isHidden: false,
            },
            {
                input: "1\n100",
                expectedOutput: "100",
                isHidden: true,
            },
        ];
    }
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Problem fetched successfully",
        data: problem,
    });
});
