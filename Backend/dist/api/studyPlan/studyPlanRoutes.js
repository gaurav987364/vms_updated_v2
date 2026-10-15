"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studyPlanController_1 = require("./studyPlanController");
const router = (0, express_1.Router)();
/**
 * GET /study-plans?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get study plans for a date range (typically a month)
 */
router.get("/", studyPlanController_1.getStudyPlans);
/**
 * GET /study-plans/:date
 * Get study plan for a specific date
 */
router.get("/:date", studyPlanController_1.getStudyPlanByDate);
/**
 * POST /study-plans
 * Create or replace study plan for a date
 */
router.post("/", studyPlanController_1.upsertStudyPlan);
/**
 * POST /study-plans/add-problems
 * Add problems to existing study plan (append, don't replace)
 */
router.post("/add-problems", studyPlanController_1.addProblemsToStudyPlan);
/**
 * PATCH /study-plans/mark-completed
 * Mark problem as completed/uncompleted
 */
router.patch("/mark-completed", studyPlanController_1.markProblemCompleted);
/**
 * PATCH /study-plans/:date/toggle-completion
 * Toggle study plan completion status
 */
router.patch("/:date/toggle-completion", studyPlanController_1.toggleCompletion);
/**
 * DELETE /study-plans/:date
 * Delete entire study plan for a date
 */
router.delete("/:date", studyPlanController_1.deleteStudyPlan);
/**
 * DELETE /study-plans/:date/problems/:problemId
 * Remove a single problem from study plan
 */
router.delete("/:date/problems/:problemId", studyPlanController_1.removeProblemFromStudyPlan);
exports.default = router;
