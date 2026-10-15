"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProblemStatsService = exports.getTopicsService = exports.getProblemsService = exports.syncCodeforcesProblemsService = exports.fetchCodeforcesProblems = void 0;
const axios_1 = __importDefault(require("axios"));
const problemModel_1 = __importDefault(require("./problemModel"));
const CODEFORCES_API_URL = "https://codeforces.com/api/problemset.problems";
/**
 * Fetch problems from Codeforces API
 */
const fetchCodeforcesProblems = async () => {
    try {
        const response = await axios_1.default.get(CODEFORCES_API_URL);
        if (response.data.status !== "OK") {
            throw new Error("Failed to fetch problems from Codeforces");
        }
        return response.data.result;
    }
    catch (error) {
        console.error("Error fetching Codeforces problems:", error.message);
        throw new Error("Failed to fetch problems from Codeforces API");
    }
};
exports.fetchCodeforcesProblems = fetchCodeforcesProblems;
/**
 * Map Codeforces rating to difficulty
 */
const mapRatingToDifficulty = (rating) => {
    if (!rating)
        return "Medium";
    if (rating < 1200)
        return "Easy";
    if (rating < 1800)
        return "Medium";
    return "Hard";
};
/**
 * Sync Codeforces problems to database
 */
const syncCodeforcesProblemsService = async (force = false) => {
    try {
        // Check if problems already exist
        const existingCount = await problemModel_1.default.countDocuments({ platform: "codeforces" });
        if (existingCount > 0 && !force) {
            return {
                message: "Problems already synced. Use force=true to re-sync.",
                count: existingCount,
                synced: false,
            };
        }
        // Fetch from Codeforces API
        const { problems, problemStatistics } = await (0, exports.fetchCodeforcesProblems)();
        // Create a map for problem statistics
        const statsMap = new Map();
        problemStatistics.forEach((stat) => {
            const key = `${stat.contestId}-${stat.index}`;
            statsMap.set(key, stat);
        });
        // Transform and prepare problems for insertion
        const transformedProblems = problems.map((problem) => {
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
            await problemModel_1.default.deleteMany({ platform: "codeforces" });
        }
        // Bulk insert
        const inserted = await problemModel_1.default.insertMany(transformedProblems, {
            ordered: false, // Continue even if some fail
        });
        return {
            message: "Problems synced successfully",
            count: inserted.length,
            synced: true,
        };
    }
    catch (error) {
        console.error("Error syncing problems:", error.message);
        throw new Error("Failed to sync problems from Codeforces");
    }
};
exports.syncCodeforcesProblemsService = syncCodeforcesProblemsService;
/**
 * Get problems with filters and pagination
 */
const getProblemsService = async (query) => {
    try {
        const { page = "1", limit = "50", difficulty, tags, search, platform, minRating, maxRating, sortBy = "newest", } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build filter query
        const filter = {};
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
            if (minRating)
                filter.rating.$gte = parseInt(minRating);
            if (maxRating)
                filter.rating.$lte = parseInt(maxRating);
        }
        // Determine sort order based on sortBy parameter
        let sortCriteria;
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
            problemModel_1.default.find(filter)
                .sort(sortCriteria)
                .skip(skip)
                .limit(limitNum)
                .select("-__v")
                .lean(),
            problemModel_1.default.countDocuments(filter),
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
    }
    catch (error) {
        console.error("Error fetching problems:", error.message);
        throw new Error("Failed to fetch problems");
    }
};
exports.getProblemsService = getProblemsService;
/**
 * Get all unique topics/tags with problem counts
 */
const getTopicsService = async (platform) => {
    try {
        const matchStage = platform ? { platform } : {};
        const topics = await problemModel_1.default.aggregate([
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
    }
    catch (error) {
        console.error("Error fetching topics:", error.message);
        throw new Error("Failed to fetch topics");
    }
};
exports.getTopicsService = getTopicsService;
/**
 * Get problem statistics
 */
const getProblemStatsService = async (platform) => {
    try {
        // Build match stage for platform filter
        const matchStage = [];
        if (platform) {
            matchStage.push({ $match: { platform } });
        }
        const stats = await problemModel_1.default.aggregate([
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
    }
    catch (error) {
        console.error("Error fetching problem stats:", error.message);
        throw new Error("Failed to fetch problem statistics");
    }
};
exports.getProblemStatsService = getProblemStatsService;
