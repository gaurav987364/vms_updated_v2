import { Router } from "express";
import {
  submitCode,
  getUserProgress,
  getUserStats,
  getProblemProgress,
  toggleFavorite,
  updateNotes,
} from "./userProgressController";

const router = Router();

/**
 * POST /progress/submit
 * Submit code and track progress
 */
router.post("/submit", submitCode);

/**
 * GET /progress
 * Get user progress for all problems
 */
router.get("/", getUserProgress);

/**
 * GET /progress/stats
 * Get user statistics and streak
 */
router.get("/stats", getUserStats);

/**
 * GET /progress/:problemId
 * Get progress for a specific problem
 */
router.get("/:problemId", getProblemProgress);

/**
 * POST /progress/favorite
 * Toggle favorite status for a problem
 */
router.post("/favorite", toggleFavorite);

/**
 * POST /progress/notes
 * Update notes for a problem
 */
router.post("/notes", updateNotes);

export default router;
