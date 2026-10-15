"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCompletion = exports.removeProblemFromStudyPlan = exports.deleteStudyPlan = exports.markProblemCompleted = exports.addProblemsToStudyPlan = exports.upsertStudyPlan = exports.getStudyPlanByDate = exports.getStudyPlans = void 0;
const studyPlanService_1 = require("./studyPlanService");
/**
 * GET /study-plans?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get study plans for a date range
 */
const getStudyPlans = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?._id;
        const { startDate, endDate } = req.query;
        console.log("📥 GET /study-plans - userId from JWT:", userId);
        console.log("📥 Full user object:", req.user);
        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated - userId missing",
            });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "startDate and endDate are required",
            });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const plans = await (0, studyPlanService_1.getStudyPlansService)(userId, start, end);
        res.status(200).json({
            message: "Study plans fetched successfully",
            data: plans,
        });
    }
    catch (error) {
        console.error("Error in getStudyPlans:", error.message);
        res.status(500).json({
            message: error.message || "Failed to fetch study plans",
        });
    }
};
exports.getStudyPlans = getStudyPlans;
/**
 * GET /study-plans/:date
 * Get study plan for a specific date
 */
const getStudyPlanByDate = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const date = req.params.date;
        const planDate = new Date(date);
        const plan = await (0, studyPlanService_1.getStudyPlanByDateService)(userId, planDate);
        res.status(200).json({
            message: "Study plan fetched successfully",
            data: plan,
        });
    }
    catch (error) {
        console.error("Error in getStudyPlanByDate:", error.message);
        res.status(500).json({
            message: error.message || "Failed to fetch study plan",
        });
    }
};
exports.getStudyPlanByDate = getStudyPlanByDate;
/**
 * POST /study-plans
 * Create or update study plan for a date
 */
const upsertStudyPlan = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?._id;
        const { date, problemIds, goal, title, description, startTime, endTime, reminder } = req.body;
        console.log("📥 POST /study-plans - userId from JWT:", userId);
        console.log("📥 Full user object:", req.user);
        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated - userId missing",
            });
        }
        if (!date || !problemIds || !Array.isArray(problemIds)) {
            return res.status(400).json({
                message: "date and problemIds array are required",
            });
        }
        const planDate = new Date(date);
        console.log("📅 Date received from frontend:", date);
        console.log("📅 Date parsed as:", planDate);
        console.log("📅 Date in UTC:", planDate.toISOString());
        const plan = await (0, studyPlanService_1.upsertStudyPlanService)(userId, planDate, problemIds, goal, title, description, startTime, endTime, reminder);
        console.log("✅ Plan saved with date:", plan?.date);
        res.status(200).json({
            message: "Study plan created/updated successfully",
            data: plan,
        });
    }
    catch (error) {
        console.error("Error in upsertStudyPlan:", error.message);
        res.status(500).json({
            message: error.message || "Failed to create/update study plan",
        });
    }
};
exports.upsertStudyPlan = upsertStudyPlan;
/**
 * POST /study-plans/add-problems
 * Add problems to existing study plan
 */
const addProblemsToStudyPlan = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { date, problemIds } = req.body;
        if (!date || !problemIds || !Array.isArray(problemIds)) {
            return res.status(400).json({
                message: "date and problemIds array are required",
            });
        }
        const planDate = new Date(date);
        const plan = await (0, studyPlanService_1.addProblemsToStudyPlanService)(userId, planDate, problemIds);
        res.status(200).json({
            message: "Problems added to study plan successfully",
            data: plan,
        });
    }
    catch (error) {
        console.error("Error in addProblemsToStudyPlan:", error.message);
        res.status(500).json({
            message: error.message || "Failed to add problems to study plan",
        });
    }
};
exports.addProblemsToStudyPlan = addProblemsToStudyPlan;
/**
 * PATCH /study-plans/mark-completed
 * Mark problem as completed/uncompleted in study plan
 */
const markProblemCompleted = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { date, problemId, completed, notes } = req.body;
        if (!date || !problemId || completed === undefined) {
            return res.status(400).json({
                message: "date, problemId, and completed are required",
            });
        }
        const planDate = new Date(date);
        const plan = await (0, studyPlanService_1.markProblemCompletedService)(userId, planDate, problemId, completed, notes);
        res.status(200).json({
            message: "Problem completion status updated successfully",
            data: plan,
        });
    }
    catch (error) {
        console.error("Error in markProblemCompleted:", error.message);
        res.status(500).json({
            message: error.message || "Failed to update completion status",
        });
    }
};
exports.markProblemCompleted = markProblemCompleted;
/**
 * DELETE /study-plans/:date
 * Delete study plan for a date
 */
const deleteStudyPlan = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const date = req.params.date;
        const planDate = new Date(date);
        const result = await (0, studyPlanService_1.deleteStudyPlanService)(userId, planDate);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error in deleteStudyPlan:", error.message);
        res.status(500).json({
            message: error.message || "Failed to delete study plan",
        });
    }
};
exports.deleteStudyPlan = deleteStudyPlan;
/**
 * DELETE /study-plans/:date/problems/:problemId
 * Remove problem from study plan
 */
const removeProblemFromStudyPlan = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const date = req.params.date;
        const problemId = req.params.problemId;
        const planDate = new Date(date);
        const plan = await (0, studyPlanService_1.removeProblemFromStudyPlanService)(userId, planDate, problemId);
        res.status(200).json({
            message: "Problem removed from study plan successfully",
            data: plan,
        });
    }
    catch (error) {
        console.error("Error in removeProblemFromStudyPlan:", error.message);
        res.status(500).json({
            message: error.message || "Failed to remove problem from study plan",
        });
    }
};
exports.removeProblemFromStudyPlan = removeProblemFromStudyPlan;
/**
 * PATCH /study-plans/:date/toggle-completion
 * Toggle study plan completion status
 */
const toggleCompletion = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const date = req.params.date;
        const { isCompleted } = req.body;
        if (isCompleted === undefined) {
            return res.status(400).json({
                message: "isCompleted is required",
            });
        }
        const planDate = new Date(date);
        const plan = await (0, studyPlanService_1.toggleCompletionService)(userId, planDate, isCompleted);
        res.status(200).json({
            message: "Completion status updated successfully",
            data: plan,
        });
    }
    catch (error) {
        console.error("Error in toggleCompletion:", error.message);
        res.status(500).json({
            message: error.message || "Failed to toggle completion status",
        });
    }
};
exports.toggleCompletion = toggleCompletion;
