import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSSTATUS } from "../../config/http.config";
import {
  getProblemsQuerySchema,
  getTopicsQuerySchema,
  syncProblemsSchema,
} from "./problemValidators";
import {
  getProblemsService,
  getProblemStatsService,
  getTopicsService,
  syncCodeforcesProblemsService,
} from "./problemService";

/**
 * @route   POST /api/v1/problems/sync
 * @desc    Sync problems from Codeforces API to database
 * @access  Private (Admin only - can add auth middleware later)
 */
export const syncProblems = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const body = syncProblemsSchema.parse(req.body);

    const result = await syncCodeforcesProblemsService(body.force);

    return res.status(HTTPSSTATUS.OK).json({
      message: result.message,
      data: {
        count: result.count,
        synced: result.synced,
      },
    });
  }
);

/**
 * @route   GET /api/v1/problems
 * @desc    Get problems with filters and pagination
 * @access  Public
 */
export const getProblems = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const query = getProblemsQuerySchema.parse(req.query);

    const result = await getProblemsService(query);

    return res.status(HTTPSSTATUS.OK).json({
      message: "Problems fetched successfully",
      data: result.problems,
      pagination: result.pagination,
    });
  }
);

/**
 * @route   GET /api/v1/problems/topics
 * @desc    Get all unique topics/tags with problem counts
 * @access  Public
 */
export const getTopics = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const query = getTopicsQuerySchema.parse(req.query);

    const topics = await getTopicsService(query.platform);

    return res.status(HTTPSSTATUS.OK).json({
      message: "Topics fetched successfully",
      data: topics,
      count: topics.length,
    });
  }
);

/**
 * @route   GET /api/v1/problems/stats
 * @desc    Get problem statistics (total, by difficulty, by platform)
 * @access  Public
 */
export const getProblemStats = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const query = getTopicsQuerySchema.parse(req.query);
    const stats = await getProblemStatsService(query.platform);

    return res.status(HTTPSSTATUS.OK).json({
      message: "Problem statistics fetched successfully",
      data: stats,
    });
  }
);

/**
 * @route   GET /api/v1/problems/:id
 * @desc    Get a single problem by ID
 * @access  Public
 */
export const getProblemById = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    const ProblemModel = (await import("./problemModel")).default;
    const problem = await ProblemModel.findById(id).select("-__v").lean();

    if (!problem) {
      return res.status(HTTPSSTATUS.NOT_FOUND).json({
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

    return res.status(HTTPSSTATUS.OK).json({
      message: "Problem fetched successfully",
      data: problem,
    });
  }
);
