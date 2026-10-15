import UserProgressModel, { IUserProgress } from "./userProgressModel";
import UserStatsModel from "./userStatsModel";
import ProblemModel from "../problems/problemModel";
import { Types } from "mongoose";
import type { GetProgressQuery } from "./userProgressValidators";

/**
 * Submit code and track progress
 */
export const submitCodeService = async (
  userId: string,
  problemId: string,
  code: string,
  language: string,
  status: "passed" | "failed" | "partial",
  testsPassed: number,
  testsTotal: number,
  timeSpent: number = 0,
  executionTime?: number,
  memoryUsed?: number,
  errorMessage?: string
) => {
  try {
    const problemObjectId = new Types.ObjectId(problemId);
    const userObjectId = new Types.ObjectId(userId);

    // Get problem details for difficulty and platform
    const problem = await ProblemModel.findById(problemObjectId);
    if (!problem) {
      throw new Error("Problem not found");
    }

    // Check if progress exists
    let progress = await UserProgressModel.findOne({
      userId: userObjectId,
      problemId: problemObjectId,
    });

    const submission = {
      code,
      language,
      submittedAt: new Date(),
      status,
      testsPassed,
      testsTotal,
      executionTime,
      memoryUsed,
      errorMessage,
    };

    const isSolved = status === "passed" && testsPassed === testsTotal;

    const wasAlreadySolved = progress?.status === "solved";

    if (!progress) {
      // Create new progress entry
      progress = await UserProgressModel.create({
        userId: userObjectId,
        problemId: problemObjectId,
        status: isSolved ? "solved" : "attempted",
        submissions: [submission],
        firstAttemptedAt: new Date(),
        firstSolvedAt: isSolved ? new Date() : undefined,
        lastAttemptedAt: new Date(),
        attempts: 1,
        timeSpent,
      });
    } else {
      // Update existing progress
      progress.submissions.push(submission);
      progress.attempts += 1;
      progress.timeSpent += timeSpent;
      progress.lastAttemptedAt = new Date();

      // Mark as solved if not already solved and this submission passed
      if (isSolved && progress.status !== "solved") {
        progress.status = "solved";
        progress.firstSolvedAt = new Date();
      }

      await progress.save();
    }

    // Update user stats - consider it "newly solved" if it was just marked as solved (wasn't solved before)
    const isNewlySolved = isSolved && !wasAlreadySolved;
    await updateUserStatsService(
      userId,
      isNewlySolved,
      problem.difficulty,
      problem.platform
    );

    return progress;
  } catch (error: any) {
    console.error("Error in submitCodeService:", error.message);
    throw new Error("Failed to submit code");
  }
};

/**
 * Update user statistics and streak
 */
export const updateUserStatsService = async (
  userId: string,
  newlySolved: boolean,
  difficulty: string,
  platform: string
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let stats = await UserStatsModel.findOne({ userId: userObjectId });

    if (!stats) {
      // Create new stats
      stats = await UserStatsModel.create({
        userId: userObjectId,
        totalSolved: newlySolved ? 1 : 0,
        totalAttempted: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
        solvedByDifficulty: {
          easy: newlySolved && difficulty === "Easy" ? 1 : 0,
          medium: newlySolved && difficulty === "Medium" ? 1 : 0,
          hard: newlySolved && difficulty === "Hard" ? 1 : 0,
        },
        solvedByPlatform: {
          leetcode: newlySolved && platform === "leetcode" ? 1 : 0,
          codeforces: newlySolved && platform === "codeforces" ? 1 : 0,
        },
        activityCalendar: [
          {
            date: today,
            problemsSolved: newlySolved ? 1 : 0,
            problemsAttempted: 1,
          },
        ],
      });
    } else {
      // Update existing stats
      stats.totalAttempted += 1;

      if (newlySolved) {
        stats.totalSolved += 1;

        // Update difficulty count
        if (difficulty === "Easy") stats.solvedByDifficulty.easy += 1;
        else if (difficulty === "Medium") stats.solvedByDifficulty.medium += 1;
        else if (difficulty === "Hard") stats.solvedByDifficulty.hard += 1;

        // Update platform count
        if (platform === "leetcode") stats.solvedByPlatform.leetcode += 1;
        else if (platform === "codeforces")
          stats.solvedByPlatform.codeforces += 1;
      }

      // Update streak
      const lastActive = stats.lastActiveDate
        ? new Date(stats.lastActiveDate)
        : null;
      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
        const diffDays = Math.floor(
          (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          // Same day - no streak change
        } else if (diffDays === 1) {
          // Consecutive day - increment streak
          stats.currentStreak += 1;
          if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
          }
        } else {
          // Streak broken - reset to 1
          stats.currentStreak = 1;
        }
      } else {
        stats.currentStreak = 1;
      }

      stats.lastActiveDate = new Date();

      // Update activity calendar
      const todayEntry = stats.activityCalendar.find(
        (entry) =>
          new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
      );

      if (todayEntry) {
        todayEntry.problemsAttempted += 1;
        if (newlySolved) todayEntry.problemsSolved += 1;
      } else {
        stats.activityCalendar.push({
          date: today,
          problemsSolved: newlySolved ? 1 : 0,
          problemsAttempted: 1,
        });
      }

      // Keep only last 365 days of activity
      if (stats.activityCalendar.length > 365) {
        stats.activityCalendar = stats.activityCalendar.slice(-365);
      }

      await stats.save();
    }

    return stats;
  } catch (error: any) {
    console.error("Error in updateUserStatsService:", error.message);
    throw new Error("Failed to update user stats");
  }
};

/**
 * Get user progress for all problems
 */
export const getUserProgressService = async (
  userId: string,
  query: GetProgressQuery
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const { status, difficulty, platform, page, limit, sortBy } = query;

    // Build filter
    const filter: any = { userId: userObjectId };
    if (status !== "all") {
      filter.status = status;
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: "problems",
          localField: "problemId",
          foreignField: "_id",
          as: "problem",
        },
      },
      { $unwind: "$problem" },
    ];

    // Filter by difficulty
    if (difficulty) {
      pipeline.push({ $match: { "problem.difficulty": difficulty } });
    }

    // Filter by platform
    if (platform) {
      pipeline.push({ $match: { "problem.platform": platform } });
    }

    // Sort
    let sortCriteria: any;
    switch (sortBy) {
      case "recent":
        sortCriteria = { lastAttemptedAt: -1 };
        break;
      case "oldest":
        sortCriteria = { firstAttemptedAt: 1 };
        break;
      case "difficulty":
        sortCriteria = { "problem.difficulty": 1, lastAttemptedAt: -1 };
        break;
      case "attempts":
        sortCriteria = { attempts: -1 };
        break;
      default:
        sortCriteria = { lastAttemptedAt: -1 };
    }

    pipeline.push({ $sort: sortCriteria });

    // Count total
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await UserProgressModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    const progress = await UserProgressModel.aggregate(pipeline);

    return {
      progress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error: any) {
    console.error("Error in getUserProgressService:", error.message);
    throw new Error("Failed to get user progress");
  }
};

/**
 * Get user statistics
 */
export const getUserStatsService = async (userId: string) => {
  try {
    const userObjectId = new Types.ObjectId(userId);

    let stats = await UserStatsModel.findOne({ userId: userObjectId });

    if (!stats) {
      // Create default stats if not exists
      stats = await UserStatsModel.create({
        userId: userObjectId,
        totalSolved: 0,
        totalAttempted: 0,
        currentStreak: 0,
        longestStreak: 0,
        solvedByDifficulty: { easy: 0, medium: 0, hard: 0 },
        solvedByPlatform: { leetcode: 0, codeforces: 0 },
        activityCalendar: [],
      });
    }

    return stats;
  } catch (error: any) {
    console.error("Error in getUserStatsService:", error.message);
    throw new Error("Failed to get user stats");
  }
};

/**
 * Toggle favorite status for a problem
 */
export const toggleFavoriteService = async (
  userId: string,
  problemId: string
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const problemObjectId = new Types.ObjectId(problemId);

    let progress = await UserProgressModel.findOne({
      userId: userObjectId,
      problemId: problemObjectId,
    });

    if (!progress) {
      // Create progress entry if it doesn't exist
      progress = await UserProgressModel.create({
        userId: userObjectId,
        problemId: problemObjectId,
        status: "attempted",
        submissions: [],
        isFavorite: true,
      });
    } else {
      progress.isFavorite = !progress.isFavorite;
      await progress.save();
    }

    return progress;
  } catch (error: any) {
    console.error("Error in toggleFavoriteService:", error.message);
    throw new Error("Failed to toggle favorite");
  }
};

/**
 * Update notes for a problem
 */
export const updateNotesService = async (
  userId: string,
  problemId: string,
  notes: string
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const problemObjectId = new Types.ObjectId(problemId);

    let progress = await UserProgressModel.findOne({
      userId: userObjectId,
      problemId: problemObjectId,
    });

    if (!progress) {
      // Create progress entry if it doesn't exist
      progress = await UserProgressModel.create({
        userId: userObjectId,
        problemId: problemObjectId,
        status: "attempted",
        submissions: [],
        notes,
      });
    } else {
      progress.notes = notes;
      await progress.save();
    }

    return progress;
  } catch (error: any) {
    console.error("Error in updateNotesService:", error.message);
    throw new Error("Failed to update notes");
  }
};

/**
 * Get progress for a specific problem
 */
export const getProblemProgressService = async (
  userId: string,
  problemId: string
) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const problemObjectId = new Types.ObjectId(problemId);

    const progress = await UserProgressModel.findOne({
      userId: userObjectId,
      problemId: problemObjectId,
    }).populate("problemId");

    return progress;
  } catch (error: any) {
    console.error("Error in getProblemProgressService:", error.message);
    throw new Error("Failed to get problem progress");
  }
};
