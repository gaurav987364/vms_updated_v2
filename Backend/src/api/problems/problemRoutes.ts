import { Router } from "express";
import {
  getProblems,
  getProblemStats,
  getTopics,
  syncProblems,
  getProblemById,
} from "./problemController";
import { updateProblemTestCases } from "./updateTestCases";
import { authenticateJWT } from "../../services/passportJwt.service";

const problemRoutes = Router();

/**
 * Public Routes
 */

// GET /api/v1/problems - Get all problems with filters
problemRoutes.get("/", getProblems);

// GET /api/v1/problems/topics - Get all topics/tags
problemRoutes.get("/topics", getTopics);

// GET /api/v1/problems/stats - Get problem statistics
problemRoutes.get("/stats", getProblemStats);

// GET /api/v1/problems/:id - Get single problem by ID
problemRoutes.get("/:id", getProblemById);

/**
 * Admin Routes (Protected - Requires Authentication)
 */

// POST /api/v1/problems/sync - Sync problems from Codeforces
problemRoutes.post("/sync", authenticateJWT, syncProblems);

// PATCH /api/v1/problems/:id/test-cases - Update test cases for a problem
problemRoutes.patch("/:id/test-cases", authenticateJWT, updateProblemTestCases);

export default problemRoutes;
