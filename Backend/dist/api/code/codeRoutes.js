"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const codeController_1 = require("./codeController");
const passportJwt_service_1 = require("../../services/passportJwt.service");
const router = (0, express_1.Router)();
/**
 * POST /code/run
 * Run code against test cases (no authentication required for testing)
 */
router.post("/run", codeController_1.runCode);
/**
 * POST /code/submit
 * Submit code for evaluation (requires authentication)
 */
router.post("/submit", passportJwt_service_1.authenticateJWT, codeController_1.submitCode);
/**
 * GET /code/submissions/:problemId
 * Get user submissions for a problem (requires authentication)
 */
router.get("/submissions/:problemId", passportJwt_service_1.authenticateJWT, codeController_1.getUserSubmissions);
exports.default = router;
