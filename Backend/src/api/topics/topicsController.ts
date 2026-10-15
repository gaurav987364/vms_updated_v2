import { Request, Response } from "express";
import { getTopicsService, getProblemsByTopicService } from "./topicsService";

/**
 * Get all topics with hierarchy
 */
export const getTopics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const topics = await getTopicsService(userId);

    res.status(200).json({
      message: "Topics fetched successfully",
      data: topics,
    });
  } catch (error: any) {
    console.error("Error in getTopics:", error.message);
    res.status(500).json({
      message: error.message || "Failed to fetch topics",
    });
  }
};

/**
 * Get problems by topic
 */
export const getProblemsByTopic = async (req: Request, res: Response) => {
  try {
    const topic = req.params.topic as string;
    const userId = (req as any).user?.userId;

    const problems = await getProblemsByTopicService(topic, userId);

    res.status(200).json({
      message: "Problems fetched successfully",
      data: problems,
    });
  } catch (error: any) {
    console.error("Error in getProblemsByTopic:", error.message);
    res.status(500).json({
      message: error.message || "Failed to fetch problems",
    });
  }
};
