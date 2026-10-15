import StudyPlanModel from "./studyPlanModel";
import ProblemModel from "../problems/problemModel";
import UserProgressModel from "../userProgress/userProgressModel";
import { updateUserStatsService } from "../userProgress/userProgressService";
import { Types } from "mongoose";

/**
 * Get study plans for a date range
 */
export const getStudyPlansService = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);

    // Normalize dates to start/end of day in UTC
    const normalizedStart = new Date(startDate);
    normalizedStart.setUTCHours(0, 0, 0, 0);

    const normalizedEnd = new Date(endDate);
    normalizedEnd.setUTCHours(23, 59, 59, 999);

    console.log("🔍 Querying study plans:", {
      userId: userObjectId.toString(),
      startDate: normalizedStart,
      endDate: normalizedEnd,
    });

    const plans = await StudyPlanModel.find({
      userId: userObjectId,
      date: { $gte: normalizedStart, $lte: normalizedEnd },
    })
      .populate("items.problemId")
      .sort({ date: 1 })
      .lean();

    console.log(`✅ Found ${plans.length} study plans`);

    return plans;
  } catch (error: any) {
    console.error("Error in getStudyPlansService:", error.message);
    throw new Error("Failed to get study plans");
  }
};

/**
 * Get study plan for a specific date
 */
export const getStudyPlanByDateService = async (
  userId: string,
  date: Date
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);

    // Normalize date to start of day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const plan = await StudyPlanModel.findOne({
      userId: userObjectId,
      date: startOfDay,
    }).populate("items.problemId");

    return plan;
  } catch (error: any) {
    console.error("Error in getStudyPlanByDateService:", error.message);
    throw new Error("Failed to get study plan");
  }
};

/**
 * Create or update study plan for a date
 */
export const upsertStudyPlanService = async (
  userId: string,
  date: Date,
  problemIds: string[],
  goal?: string,
  title?: string,
  description?: string,
  startTime?: string,
  endTime?: string,
  reminder?: {
    enabled: boolean;
    reminderDate?: Date;
    reminderTime?: string;
  }
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);

    // Normalize date to start of day in UTC to avoid timezone issues
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    console.log("💾 Saving study plan:", {
      userId: userObjectId.toString(),
      date: startOfDay,
      problemCount: problemIds.length,
      title,
    });

    // Validate problems exist
    const problems = await ProblemModel.find({
      _id: { $in: problemIds.map((id) => new Types.ObjectId(id)) },
    });

    if (problems.length !== problemIds.length) {
      throw new Error("Some problems not found");
    }

    // Create items array
    const items = problemIds.map((id) => ({
      problemId: new Types.ObjectId(id),
      completed: false,
    }));

    // Calculate totals
    const totalPlanned = items.length;
    const totalCompleted = items.filter((item) => item.completed).length;

    console.log("📊 Calculated totals:", { totalPlanned, totalCompleted });

    // Upsert study plan
    const plan = await StudyPlanModel.findOneAndUpdate(
      { userId: userObjectId, date: startOfDay },
      {
        $set: {
          items,
          goal,
          title,
          description,
          startTime,
          endTime,
          reminder: reminder || { enabled: false, sent: false },
          isCompleted: false,
          totalPlanned,
          totalCompleted,
        },
      },
      { upsert: true, new: true }
    ).populate("items.problemId");

    console.log("✅ Study plan saved successfully:", {
      _id: plan?._id,
      date: plan?.date,
      totalPlanned: plan?.totalPlanned,
      totalCompleted: plan?.totalCompleted,
      itemsCount: plan?.items?.length
    });

    return plan;
  } catch (error: any) {
    console.error("Error in upsertStudyPlanService:", error.message);
    throw new Error(error.message || "Failed to create/update study plan");
  }
};

/**
 * Add problems to existing study plan
 */
export const addProblemsToStudyPlanService = async (
  userId: string,
  date: Date,
  problemIds: string[]
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);

    // Normalize date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Validate problems exist
    const problems = await ProblemModel.find({
      _id: { $in: problemIds.map((id) => new Types.ObjectId(id)) },
    });

    if (problems.length !== problemIds.length) {
      throw new Error("Some problems not found");
    }

    // Get or create study plan
    let plan = await StudyPlanModel.findOne({
      userId: userObjectId,
      date: startOfDay,
    });

    if (!plan) {
      plan = new StudyPlanModel({
        userId: userObjectId,
        date: startOfDay,
        items: [],
      });
    }

    // Add new problems (avoid duplicates)
    const existingProblemIds = new Set(
      plan.items.map((item) => item.problemId.toString())
    );

    for (const problemId of problemIds) {
      if (!existingProblemIds.has(problemId)) {
        plan.items.push({
          problemId: new Types.ObjectId(problemId),
          completed: false,
        });
      }
    }

    await plan.save();
    await plan.populate("items.problemId");

    return plan;
  } catch (error: any) {
    console.error("Error in addProblemsToStudyPlanService:", error.message);
    throw new Error(error.message || "Failed to add problems to study plan");
  }
};

/**
 * Mark problem as completed in study plan
 */
export const markProblemCompletedService = async (
  userId: string,
  date: Date,
  problemId: string,
  completed: boolean,
  notes?: string
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const problemObjectId = new Types.ObjectId(problemId);

    // Normalize date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const plan = await StudyPlanModel.findOne({
      userId: userObjectId,
      date: startOfDay,
    });

    if (!plan) {
      throw new Error("Study plan not found");
    }

    // Find and update the item
    const item = plan.items.find(
      (i) => i.problemId.toString() === problemId
    );

    if (!item) {
      throw new Error("Problem not found in study plan");
    }

    item.completed = completed;
    item.completedAt = completed ? new Date() : undefined;
    if (notes !== undefined) {
      item.notes = notes;
    }

    await plan.save();
    await plan.populate("items.problemId");

    // Sync with userProgress when marking as complete
    if (completed) {
      try {
        // Get problem details
        const problem = await ProblemModel.findById(problemObjectId);
        if (problem) {
          // Check if progress exists
          let progress = await UserProgressModel.findOne({
            userId: userObjectId,
            problemId: problemObjectId,
          });

          const wasAlreadySolved = progress?.status === "solved";

          if (!progress) {
            // Create new progress entry marked as solved
            progress = await UserProgressModel.create({
              userId: userObjectId,
              problemId: problemObjectId,
              status: "solved",
              submissions: [],
              firstAttemptedAt: new Date(),
              firstSolvedAt: new Date(),
              lastAttemptedAt: new Date(),
              attempts: 1,
              timeSpent: 0,
            });
          } else if (progress.status !== "solved") {
            // Update existing progress to solved
            progress.status = "solved";
            progress.firstSolvedAt = new Date();
            await progress.save();
          }

          // Update user stats if newly solved
          if (!wasAlreadySolved) {
            await updateUserStatsService(
              userId,
              true,
              problem.difficulty,
              problem.platform
            );
            console.log("✅ Synced study plan completion with userProgress:", problemId);
          }
        }
      } catch (syncError: any) {
        console.error("Error syncing with userProgress:", syncError.message);
        // Don't fail the main operation if sync fails
      }
    }

    return plan;
  } catch (error: any) {
    console.error("Error in markProblemCompletedService:", error.message);
    throw new Error(error.message || "Failed to mark problem as completed");
  }
};

/**
 * Delete study plan
 */
export const deleteStudyPlanService = async (userId: string, date: Date) => {
  try {
    const userObjectId = new Types.ObjectId(userId);

    // Normalize date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const result = await StudyPlanModel.deleteOne({
      userId: userObjectId,
      date: startOfDay,
    });

    if (result.deletedCount === 0) {
      throw new Error("Study plan not found");
    }

    return { message: "Study plan deleted successfully" };
  } catch (error: any) {
    console.error("Error in deleteStudyPlanService:", error.message);
    throw new Error(error.message || "Failed to delete study plan");
  }
};

/**
 * Remove problem from study plan
 */
export const removeProblemFromStudyPlanService = async (
  userId: string,
  date: Date,
  problemId: string
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);

    // Normalize date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const plan = await StudyPlanModel.findOne({
      userId: userObjectId,
      date: startOfDay,
    });

    if (!plan) {
      throw new Error("Study plan not found");
    }

    // Remove the item
    plan.items = plan.items.filter(
      (item) => item.problemId.toString() !== problemId
    );

    await plan.save();
    await plan.populate("items.problemId");

    return plan;
  } catch (error: any) {
    console.error("Error in removeProblemFromStudyPlanService:", error.message);
    throw new Error(error.message || "Failed to remove problem from study plan");
  }
};

/**
 * Toggle study plan completion status
 */
export const toggleCompletionService = async (
  userId: string,
  date: Date,
  isCompleted: boolean
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);

    // Normalize date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const plan = await StudyPlanModel.findOne({
      userId: userObjectId,
      date: startOfDay,
    });

    if (!plan) {
      throw new Error("Study plan not found");
    }

    plan.isCompleted = isCompleted;
    await plan.save();
    await plan.populate("items.problemId");

    return plan;
  } catch (error: any) {
    console.error("Error in toggleCompletionService:", error.message);
    throw new Error(error.message || "Failed to toggle completion status");
  }
};
