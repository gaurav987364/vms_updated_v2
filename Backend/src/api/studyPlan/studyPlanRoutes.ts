import { Router } from "express";
import {
  getStudyPlans,
  getStudyPlanByDate,
  upsertStudyPlan,
  addProblemsToStudyPlan,
  markProblemCompleted,
  deleteStudyPlan,
  removeProblemFromStudyPlan,
  toggleCompletion,
} from "./studyPlanController";

const router = Router();

/**
 * GET /study-plans?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get study plans for a date range (typically a month)
 */
router.get("/", getStudyPlans);

/**
 * GET /study-plans/:date
 * Get study plan for a specific date
 */
router.get("/:date", getStudyPlanByDate);

/**
 * POST /study-plans
 * Create or replace study plan for a date
 */
router.post("/", upsertStudyPlan);

/**
 * POST /study-plans/add-problems
 * Add problems to existing study plan (append, don't replace)
 */
router.post("/add-problems", addProblemsToStudyPlan);

/**
 * PATCH /study-plans/mark-completed
 * Mark problem as completed/uncompleted
 */
router.patch("/mark-completed", markProblemCompleted);

/**
 * PATCH /study-plans/:date/toggle-completion
 * Toggle study plan completion status
 */
router.patch("/:date/toggle-completion", toggleCompletion);

/**
 * DELETE /study-plans/:date
 * Delete entire study plan for a date
 */
router.delete("/:date", deleteStudyPlan);

/**
 * DELETE /study-plans/:date/problems/:problemId
 * Remove a single problem from study plan
 */
router.delete("/:date/problems/:problemId", removeProblemFromStudyPlan);

export default router;
