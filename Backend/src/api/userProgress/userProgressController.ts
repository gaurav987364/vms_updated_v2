import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSSTATUS } from "../../config/http.config";
import {
  submitCodeSchema,
  getProgressQuerySchema,
  toggleFavoriteSchema,
  updateNotesSchema,
} from "./userProgressValidators";
import {
  submitCodeService,
  getUserProgressService,
  getUserStatsService,
  toggleFavoriteService,
  updateNotesService,
  getProblemProgressService,
} from "./userProgressService";

/**
 * @route   POST /api/v1/progress/submit
 * @desc    Submit code and track progress
 * @access  Private
 */
export const submitCode = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?._id;
    if (!userId) {
      return res
        .status(HTTPSSTATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    const body = submitCodeSchema.parse(req.body);

    // Get test results from code execution (from previous code run)
    const {
      status = "failed",
      testsPassed = 0,
      testsTotal = 1,
      executionTime,
      memoryUsed,
      errorMessage,
    } = req.body;

    const progress = await submitCodeService(
      userId,
      body.problemId,
      body.code,
      body.language,
      status,
      testsPassed,
      testsTotal,
      body.timeSpent,
      executionTime,
      memoryUsed,
      errorMessage
    );

    return res.status(HTTPSSTATUS.OK).json({
      message: "Code submitted successfully",
      data: progress,
    });
  }
);

/**
 * @route   GET /api/v1/progress
 * @desc    Get user progress for all problems
 * @access  Private
 */
export const getUserProgress = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?._id;
    if (!userId) {
      return res
        .status(HTTPSSTATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    const query = getProgressQuerySchema.parse(req.query);

    const result = await getUserProgressService(userId, query);

    return res.status(HTTPSSTATUS.OK).json({
      message: "User progress fetched successfully",
      data: result.progress,
      pagination: result.pagination,
    });
  }
);

/**
 * @route   GET /api/v1/progress/stats
 * @desc    Get user statistics and streak
 * @access  Private
 */
export const getUserStats = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?._id;
    if (!userId) {
      return res
        .status(HTTPSSTATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    const stats = await getUserStatsService(userId);

    return res.status(HTTPSSTATUS.OK).json({
      message: "User stats fetched successfully",
      data: stats,
    });
  }
);

/**
 * @route   GET /api/v1/progress/:problemId
 * @desc    Get progress for a specific problem
 * @access  Private
 */
export const getProblemProgress = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?._id;
    if (!userId) {
      return res
        .status(HTTPSSTATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    const problemId = req.params.problemId as string;

    const progress = await getProblemProgressService(userId, problemId);

    return res.status(HTTPSSTATUS.OK).json({
      message: "Problem progress fetched successfully",
      data: progress,
    });
  }
);

/**
 * @route   POST /api/v1/progress/favorite
 * @desc    Toggle favorite status for a problem
 * @access  Private
 */
export const toggleFavorite = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?._id;
    if (!userId) {
      return res
        .status(HTTPSSTATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    const body = toggleFavoriteSchema.parse(req.body);

    const progress = await toggleFavoriteService(userId, body.problemId);

    return res.status(HTTPSSTATUS.OK).json({
      message: "Favorite toggled successfully",
      data: progress,
    });
  }
);

/**
 * @route   POST /api/v1/progress/notes
 * @desc    Update notes for a problem
 * @access  Private
 */
export const updateNotes = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?._id;
    if (!userId) {
      return res
        .status(HTTPSSTATUS.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    const body = updateNotesSchema.parse(req.body);

    const progress = await updateNotesService(
      userId,
      body.problemId,
      body.notes
    );

    return res.status(HTTPSSTATUS.OK).json({
      message: "Notes updated successfully",
      data: progress,
    });
  }
);
