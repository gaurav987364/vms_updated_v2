import { Router } from "express";
import { runCode, submitCode, getUserSubmissions } from "./codeController";
import { authenticateJWT } from "../../services/passportJwt.service";

const router = Router();

/**
 * POST /code/run
 * Run code against test cases (no authentication required for testing)
 */
router.post("/run", runCode);

/**
 * POST /code/submit
 * Submit code for evaluation (requires authentication)
 */
router.post("/submit", authenticateJWT, submitCode);

/**
 * GET /code/submissions/:problemId
 * Get user submissions for a problem (requires authentication)
 */
router.get("/submissions/:problemId", authenticateJWT, getUserSubmissions);

export default router;
