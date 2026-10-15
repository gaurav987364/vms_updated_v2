"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProblemTestCases = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const http_config_1 = require("../../config/http.config");
const problemModel_1 = __importDefault(require("./problemModel"));
const zod_1 = require("zod");
// Validator for test case update
const updateTestCasesSchema = zod_1.z.object({
    problemId: zod_1.z.string(),
    testCases: zod_1.z.array(zod_1.z.object({
        input: zod_1.z.string(),
        expectedOutput: zod_1.z.string(),
        isHidden: zod_1.z.boolean().optional().default(false),
    })),
});
/**
 * @route   PATCH /api/v1/problems/:id/test-cases
 * @desc    Update test cases for a specific problem (Admin endpoint)
 * @access  Private (Admin only - add auth middleware as needed)
 */
exports.updateProblemTestCases = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const body = updateTestCasesSchema.parse({ problemId: id, ...req.body });
    // Find and update the problem
    const problem = await problemModel_1.default.findByIdAndUpdate(id, {
        $set: {
            testCases: body.testCases,
            testCasesVerified: true, // Mark as verified when manually updated
        },
    }, { new: true });
    if (!problem) {
        return res.status(http_config_1.HTTPSSTATUS.NOT_FOUND).json({
            message: "Problem not found",
        });
    }
    return res.status(http_config_1.HTTPSSTATUS.OK).json({
        message: "Test cases updated successfully",
        data: problem,
    });
});
