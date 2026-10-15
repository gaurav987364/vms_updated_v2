import { Request, Response } from "express";
import {
  getStudyPlansService,
  getStudyPlanByDateService,
  upsertStudyPlanService,
  addProblemsToStudyPlanService,
  markProblemCompletedService,
  deleteStudyPlanService,
  removeProblemFromStudyPlanService,
  toggleCompletionService,
} from "./studyPlanService";

/**
 * GET /study-plans?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get study plans for a date range
 */
export const getStudyPlans = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?._id;
    const { startDate, endDate } = req.query;

    console.log("📥 GET /study-plans - userId from JWT:", userId);
    console.log("📥 Full user object:", (req as any).user);

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated - userId missing",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const plans = await getStudyPlansService(userId, start, end);

    res.status(200).json({
      message: "Study plans fetched successfully",
      data: plans,
    });
  } catch (error: any) {
    console.error("Error in getStudyPlans:", error.message);
    res.status(500).json({
      message: error.message || "Failed to fetch study plans",
    });
  }
};

/**
 * GET /study-plans/:date
 * Get study plan for a specific date
 */
export const getStudyPlanByDate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const date = req.params.date as string;

    const planDate = new Date(date);
    const plan = await getStudyPlanByDateService(userId, planDate);

    res.status(200).json({
      message: "Study plan fetched successfully",
      data: plan,
    });
  } catch (error: any) {
    console.error("Error in getStudyPlanByDate:", error.message);
    res.status(500).json({
      message: error.message || "Failed to fetch study plan",
    });
  }
};

/**
 * POST /study-plans
 * Create or update study plan for a date
 */
export const upsertStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?._id;
    const {
      date,
      problemIds,
      goal,
      title,
      description,
      startTime,
      endTime,
      reminder
    } = req.body;

    console.log("📥 POST /study-plans - userId from JWT:", userId);
    console.log("📥 Full user object:", (req as any).user);

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated - userId missing",
      });
    }

    if (!date || !problemIds || !Array.isArray(problemIds)) {
      return res.status(400).json({
        message: "date and problemIds array are required",
      });
    }

    const planDate = new Date(date);

    console.log("📅 Date received from frontend:", date);
    console.log("📅 Date parsed as:", planDate);
    console.log("📅 Date in UTC:", planDate.toISOString());

    const plan = await upsertStudyPlanService(
      userId,
      planDate,
      problemIds,
      goal,
      title,
      description,
      startTime,
      endTime,
      reminder
    );

    console.log("✅ Plan saved with date:", plan?.date);

    res.status(200).json({
      message: "Study plan created/updated successfully",
      data: plan,
    });
  } catch (error: any) {
    console.error("Error in upsertStudyPlan:", error.message);
    res.status(500).json({
      message: error.message || "Failed to create/update study plan",
    });
  }
};

/**
 * POST /study-plans/add-problems
 * Add problems to existing study plan
 */
export const addProblemsToStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { date, problemIds } = req.body;

    if (!date || !problemIds || !Array.isArray(problemIds)) {
      return res.status(400).json({
        message: "date and problemIds array are required",
      });
    }

    const planDate = new Date(date);
    const plan = await addProblemsToStudyPlanService(userId, planDate, problemIds);

    res.status(200).json({
      message: "Problems added to study plan successfully",
      data: plan,
    });
  } catch (error: any) {
    console.error("Error in addProblemsToStudyPlan:", error.message);
    res.status(500).json({
      message: error.message || "Failed to add problems to study plan",
    });
  }
};

/**
 * PATCH /study-plans/mark-completed
 * Mark problem as completed/uncompleted in study plan
 */
export const markProblemCompleted = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { date, problemId, completed, notes } = req.body;

    if (!date || !problemId || completed === undefined) {
      return res.status(400).json({
        message: "date, problemId, and completed are required",
      });
    }

    const planDate = new Date(date);
    const plan = await markProblemCompletedService(
      userId,
      planDate,
      problemId,
      completed,
      notes
    );

    res.status(200).json({
      message: "Problem completion status updated successfully",
      data: plan,
    });
  } catch (error: any) {
    console.error("Error in markProblemCompleted:", error.message);
    res.status(500).json({
      message: error.message || "Failed to update completion status",
    });
  }
};

/**
 * DELETE /study-plans/:date
 * Delete study plan for a date
 */
export const deleteStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const date = req.params.date as string;

    const planDate = new Date(date);
    const result = await deleteStudyPlanService(userId, planDate);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in deleteStudyPlan:", error.message);
    res.status(500).json({
      message: error.message || "Failed to delete study plan",
    });
  }
};

/**
 * DELETE /study-plans/:date/problems/:problemId
 * Remove problem from study plan
 */
export const removeProblemFromStudyPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const date = req.params.date as string;
    const problemId = req.params.problemId as string;

    const planDate = new Date(date);
    const plan = await removeProblemFromStudyPlanService(userId, planDate, problemId);

    res.status(200).json({
      message: "Problem removed from study plan successfully",
      data: plan,
    });
  } catch (error: any) {
    console.error("Error in removeProblemFromStudyPlan:", error.message);
    res.status(500).json({
      message: error.message || "Failed to remove problem from study plan",
    });
  }
};

/**
 * PATCH /study-plans/:date/toggle-completion
 * Toggle study plan completion status
 */
export const toggleCompletion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const date = req.params.date as string;
    const { isCompleted } = req.body;

    if (isCompleted === undefined) {
      return res.status(400).json({
        message: "isCompleted is required",
      });
    }

    const planDate = new Date(date);
    const plan = await toggleCompletionService(userId, planDate, isCompleted);

    res.status(200).json({
      message: "Completion status updated successfully",
      data: plan,
    });
  } catch (error: any) {
    console.error("Error in toggleCompletion:", error.message);
    res.status(500).json({
      message: error.message || "Failed to toggle completion status",
    });
  }
};
