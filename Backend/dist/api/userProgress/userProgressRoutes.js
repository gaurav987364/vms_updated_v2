"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userProgressController_1 = require("./userProgressController");
const router = (0, express_1.Router)();
/**
 * POST /progress/submit
 * Submit code and track progress
 */
router.post("/submit", userProgressController_1.submitCode);
/**
 * GET /progress
 * Get user progress for all problems
 */
router.get("/", userProgressController_1.getUserProgress);
/**
 * GET /progress/stats
 * Get user statistics and streak
 */
router.get("/stats", userProgressController_1.getUserStats);
/**
 * GET /progress/:problemId
 * Get progress for a specific problem
 */
router.get("/:problemId", userProgressController_1.getProblemProgress);
/**
 * POST /progress/favorite
 * Toggle favorite status for a problem
 */
router.post("/favorite", userProgressController_1.toggleFavorite);
/**
 * POST /progress/notes
 * Update notes for a problem
 */
router.post("/notes", userProgressController_1.updateNotes);
exports.default = router;
