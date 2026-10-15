"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const problemController_1 = require("./problemController");
const updateTestCases_1 = require("./updateTestCases");
const passportJwt_service_1 = require("../../services/passportJwt.service");
const problemRoutes = (0, express_1.Router)();
/**
 * Public Routes
 */
// GET /api/v1/problems - Get all problems with filters
problemRoutes.get("/", problemController_1.getProblems);
// GET /api/v1/problems/topics - Get all topics/tags
problemRoutes.get("/topics", problemController_1.getTopics);
// GET /api/v1/problems/stats - Get problem statistics
problemRoutes.get("/stats", problemController_1.getProblemStats);
// GET /api/v1/problems/:id - Get single problem by ID
problemRoutes.get("/:id", problemController_1.getProblemById);
/**
 * Admin Routes (Protected - Requires Authentication)
 */
// POST /api/v1/problems/sync - Sync problems from Codeforces
problemRoutes.post("/sync", passportJwt_service_1.authenticateJWT, problemController_1.syncProblems);
// PATCH /api/v1/problems/:id/test-cases - Update test cases for a problem
problemRoutes.patch("/:id/test-cases", passportJwt_service_1.authenticateJWT, updateTestCases_1.updateProblemTestCases);
exports.default = problemRoutes;
