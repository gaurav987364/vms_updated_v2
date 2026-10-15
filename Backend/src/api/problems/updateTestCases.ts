import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSSTATUS } from "../../config/http.config";
import ProblemModel from "./problemModel";
import { z } from "zod";

// Validator for test case update
const updateTestCasesSchema = z.object({
  problemId: z.string(),
  testCases: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
      isHidden: z.boolean().optional().default(false),
    })
  ),
});

/**
 * @route   PATCH /api/v1/problems/:id/test-cases
 * @desc    Update test cases for a specific problem (Admin endpoint)
 * @access  Private (Admin only - add auth middleware as needed)
 */
export const updateProblemTestCases = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const body = updateTestCasesSchema.parse({ problemId: id, ...req.body });

    // Find and update the problem
    const problem = await ProblemModel.findByIdAndUpdate(
      id,
      {
        $set: {
          testCases: body.testCases,
          testCasesVerified: true, // Mark as verified when manually updated
        },
      },
      { new: true }
    );

    if (!problem) {
      return res.status(HTTPSSTATUS.NOT_FOUND).json({
        message: "Problem not found",
      });
    }

    return res.status(HTTPSSTATUS.OK).json({
      message: "Test cases updated successfully",
      data: problem,
    });
  }
);
