import { Request, Response } from "express";
import { runCodeService, submitCodeService, getUserSubmissionsService } from "./codeService";

/**
 * Run code against test cases
 */
export const runCode = async (req: Request, res: Response) => {
  try {
    const { problemId, code, language, testCases } = req.body;

    if (!problemId || !code || !language || !testCases) {
      return res.status(400).json({
        message: "Missing required fields: problemId, code, language, testCases",
      });
    }

    const results = await runCodeService({
      problemId,
      code,
      language,
      testCases,
    });

    res.status(200).json({
      message: "Code executed successfully",
      data: results,
    });
  } catch (error: any) {
    console.error("Error in runCode:", error);
    res.status(500).json({
      message: error.message || "Failed to execute code",
    });
  }
};

/**
 * Submit code for evaluation
 */
export const submitCode = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id; // From JWT authentication
    const { problemId, code, language } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    if (!problemId || !code || !language) {
      return res.status(400).json({
        message: "Missing required fields: problemId, code, language",
      });
    }

    const result = await submitCodeService(userId, {
      problemId,
      code,
      language,
    });

    res.status(200).json({
      message: result.accepted ? "Solution accepted!" : "Solution not accepted",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in submitCode:", error);
    res.status(500).json({
      message: error.message || "Failed to submit code",
    });
  }
};

/**
 * Get user submissions for a problem
 */
export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id; // From JWT authentication
    const problemId = typeof req.params.problemId === 'string'
      ? req.params.problemId
      : req.params.problemId?.[0];

    if (!problemId || !userId) {
      return res.status(400).json({
        message: "Problem ID and user authentication are required",
      });
    }

    const submissions = await getUserSubmissionsService(userId, problemId);

    res.status(200).json({
      message: "Submissions fetched successfully",
      data: submissions,
      count: submissions.length,
    });
  } catch (error: any) {
    console.error("Error in getUserSubmissions:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch submissions",
    });
  }
};
