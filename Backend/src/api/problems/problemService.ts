import axios from "axios";
import ProblemModel, { IProblem } from "./problemModel";
import { GetProblemsQuery } from "./problemValidators";

const CODEFORCES_API_URL = "https://codeforces.com/api/problemset.problems";

/**
 * Fetch problems from Codeforces API
 */
export const fetchCodeforcesProblems = async () => {
  try {
    const response = await axios.get(CODEFORCES_API_URL);

    if (response.data.status !== "OK") {
      throw new Error("Failed to fetch problems from Codeforces");
    }

    return response.data.result;
  } catch (error: any) {
    console.error("Error fetching Codeforces problems:", error.message);
    throw new Error("Failed to fetch problems from Codeforces API");
  }
};

/**
 * Map Codeforces rating to difficulty
 */
const mapRatingToDifficulty = (rating?: number): "Easy" | "Medium" | "Hard" => {
  if (!rating) return "Medium";
  if (rating < 1200) return "Easy";
  if (rating < 1800) return "Medium";
  return "Hard";
};

/**
 * Sync Codeforces problems to database
 */
export const syncCodeforcesProblemsService = async (force: boolean = false) => {
  try {
    // Check if problems already exist
    const existingCount = await ProblemModel.countDocuments({ platform: "codeforces" });

    if (existingCount > 0 && !force) {
      return {
        message: "Problems already synced. Use force=true to re-sync.",
        count: existingCount,
        synced: false,
      };
    }

    // Fetch from Codeforces API
    const { problems, problemStatistics } = await fetchCodeforcesProblems();

    // Create a map for problem statistics
    const statsMap = new Map();
    problemStatistics.forEach((stat: any) => {
      const key = `${stat.contestId}-${stat.index}`;
      statsMap.set(key, stat);
    });

    // Transform and prepare problems for insertion
    const transformedProblems = problems.map((problem: any) => {
      const key = `${problem.contestId}-${problem.index}`;
      const stats = statsMap.get(key);

      return {
        problemId: `CF-${problem.contestId}${problem.index}`,
        platform: "codeforces",
        title: problem.name,
        difficulty: mapRatingToDifficulty(problem.rating),
        tags: problem.tags || [],
        link: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
        rating: problem.rating,
        contestId: problem.contestId,
        index: problem.index,
        totalSubmissions: stats?.submittedCount || 0,
        totalAccepted: stats?.solvedCount || 0,
        acceptance: stats?.solvedCount && stats?.submittedCount
          ? ((stats.solvedCount / stats.submittedCount) * 100).toFixed(2)
          : 0,
      };
    });

    // Delete existing if force sync
    if (force) {
      await ProblemModel.deleteMany({ platform: "codeforces" });
    }

    // Bulk insert
    const inserted = await ProblemModel.insertMany(transformedProblems, {
      ordered: false, // Continue even if some fail
    });

    return {
      message: "Problems synced successfully",
      count: inserted.length,
      synced: true,
    };
  } catch (error: any) {
    console.error("Error syncing problems:", error.message);
    throw new Error("Failed to sync problems from Codeforces");
  }
};

/**
 * Get problems with filters and pagination
 */
export const getProblemsService = async (query: GetProblemsQuery) => {
  try {
    const {
      page = "1",
      limit = "50",
      difficulty,
      tags,
      search,
      platform,
      minRating,
      maxRating,
      sortBy = "newest",
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (platform) {
      filter.platform = platform;
    }

    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = parseInt(minRating);
      if (maxRating) filter.rating.$lte = parseInt(maxRating);
    }

    // Determine sort order based on sortBy parameter
    let sortCriteria: any;
    switch (sortBy) {
      case "rating":
        // Sort by highest rating first
        sortCriteria = { rating: -1, contestId: -1, index: 1 };
        break;
      case "acceptance":
        // Sort by highest acceptance rate first
        sortCriteria = { acceptance: -1, rating: -1, index: 1 };
        break;
      case "newest":
      default:
        // Sort by newest first (latest contest)
        sortCriteria = { contestId: -1, rating: -1, index: 1 };
        break;
    }

    // Execute query with pagination
    const [problems, total] = await Promise.all([
      ProblemModel.find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .select("-__v")
        .lean(),
      ProblemModel.countDocuments(filter),
    ]);

    return {
      problems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    };
  } catch (error: any) {
    console.error("Error fetching problems:", error.message);
    throw new Error("Failed to fetch problems");
  }
};

/**
 * Get all unique topics/tags with problem counts
 */
export const getTopicsService = async (platform?: string) => {
  try {
    const matchStage = platform ? { platform } : {};

    const topics = await ProblemModel.aggregate([
      { $match: matchStage },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return topics;
  } catch (error: any) {
    console.error("Error fetching topics:", error.message);
    throw new Error("Failed to fetch topics");
  }
};

/**
 * Get problem statistics
 */
export const getProblemStatsService = async (platform?: string) => {
  try {
    // Build match stage for platform filter
    const matchStage: any[] = [];
    if (platform) {
      matchStage.push({ $match: { platform } });
    }

    const stats = await ProblemModel.aggregate([
      ...matchStage,
      {
        $facet: {
          total: [{ $count: "count" }],
          byDifficulty: [
            {
              $group: {
                _id: "$difficulty",
                count: { $sum: 1 },
              },
            },
          ],
          byPlatform: [
            {
              $group: {
                _id: "$platform",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    return {
      total: stats[0].total[0]?.count || 0,
      byDifficulty: stats[0].byDifficulty,
      byPlatform: stats[0].byPlatform,
    };
  } catch (error: any) {
    console.error("Error fetching problem stats:", error.message);
    throw new Error("Failed to fetch problem statistics");
  }
};
