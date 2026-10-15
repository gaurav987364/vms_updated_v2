import { Request, Response } from "express";
import { syncLeetCodeProblemsService, getLeetCodeProblemBySlug } from "./leetcodeService";

/**
 * Sync LeetCode problems to database
 */
export const syncLeetCodeProblems = async (req: Request, res: Response) => {
  try {
    const { limit } = req.body;
    const limitNum = parseInt(limit) || 100;

    if (limitNum < 1 || limitNum > 500) {
      return res.status(400).json({
        message: "Limit must be between 1 and 500",
      });
    }

    const result = await syncLeetCodeProblemsService(limitNum);

    res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    console.error("Error in syncLeetCodeProblems:", error);
    res.status(500).json({
      message: error.message || "Failed to sync LeetCode problems",
    });
  }
};

/**
 * Get LeetCode problem details by slug
 */
export const getLeetCodeProblem = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({
        message: "Problem slug is required",
      });
    }

    const problem = await getLeetCodeProblemBySlug(slug);

    res.status(200).json({
      message: "Problem fetched successfully",
      data: problem,
    });
  } catch (error: any) {
    console.error("Error in getLeetCodeProblem:", error);
    res.status(500).json({
      message: error.message || "Failed to get LeetCode problem",
    });
  }
};
