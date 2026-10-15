import ProblemModel from "../problems/problemModel";
import UserProgressModel from "../userProgress/userProgressModel";
import { Types } from "mongoose";

/**
 * Get all topics with their subtopics and problem counts
 */
export const getTopicsService = async (userId?: string) => {
  try {
    // Get all problems grouped by topic
    const topicsAggregation = await ProblemModel.aggregate([
      {
        $match: {
          topic: { $exists: true, $nin: [null, ""] }
        }
      },
      {
        $group: {
          _id: {
            topic: "$topic",
            subtopic: "$subtopic"
          },
          problems: {
            $push: {
              _id: "$_id",
              problemId: "$problemId",
              title: "$title",
              difficulty: "$difficulty",
              order: "$order",
              link: "$link",
              youtubeLink: "$youtubeLink",
              articleLink: "$articleLink",
              tags: "$tags"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.topic": 1, "_id.subtopic": 1 }
      }
    ]);

    // Get user progress if userId is provided
    let userProgress: any[] = [];
    if (userId) {
      userProgress = await UserProgressModel.find({
        userId: new Types.ObjectId(userId)
      }).select("problemId status");
    }

    // Create progress map for quick lookup
    const progressMap = new Map(
      userProgress.map(p => [p.problemId.toString(), p.status])
    );

    // Structure the data hierarchically
    const topicsMap = new Map<string, any>();

    for (const item of topicsAggregation) {
      const topicName = item._id.topic;
      const subtopicName = item._id.subtopic || "General";

      if (!topicsMap.has(topicName)) {
        topicsMap.set(topicName, {
          name: topicName,
          subtopics: [],
          totalProblems: 0,
          solvedProblems: 0
        });
      }

      const topic = topicsMap.get(topicName);

      // Sort problems by order
      const sortedProblems = item.problems.sort((a: any, b: any) => a.order - b.order);

      // Add progress status to each problem
      const problemsWithProgress = sortedProblems.map((p: any) => ({
        ...p,
        status: progressMap.get(p._id.toString()) || null
      }));

      const solvedCount = problemsWithProgress.filter((p: any) => p.status === "solved").length;

      topic.subtopics.push({
        name: subtopicName,
        problems: problemsWithProgress,
        totalProblems: item.count,
        solvedProblems: solvedCount
      });

      topic.totalProblems += item.count;
      topic.solvedProblems += solvedCount;
    }

    // Convert map to array
    const topics = Array.from(topicsMap.values());

    return topics;
  } catch (error: any) {
    console.error("Error in getTopicsService:", error.message);
    throw new Error("Failed to get topics");
  }
};

/**
 * Get problems by topic
 */
export const getProblemsByTopicService = async (
  topic: string,
  userId?: string
) => {
  try {
    const problems = await ProblemModel.find({ topic })
      .sort({ order: 1 })
      .lean();

    // Get user progress if userId is provided
    if (userId) {
      const userProgress = await UserProgressModel.find({
        userId: new Types.ObjectId(userId),
        problemId: { $in: problems.map(p => p._id) }
      }).select("problemId status");

      const progressMap = new Map(
        userProgress.map(p => [p.problemId.toString(), p.status])
      );

      return problems.map(p => ({
        ...p,
        status: progressMap.get(p._id.toString()) || null
      }));
    }

    return problems;
  } catch (error: any) {
    console.error("Error in getProblemsByTopicService:", error.message);
    throw new Error("Failed to get problems by topic");
  }
};
