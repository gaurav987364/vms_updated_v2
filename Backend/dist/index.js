"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables FIRST before anything else
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = __importDefault(require("./database/database"));
const app_config_1 = require("./config/app.config");
const errorHandler_1 = require("./middlewares/errorHandler");
const asyncHandler_1 = require("./middlewares/asyncHandler");
const passport_1 = __importDefault(require("./middlewares/passport"));
const http_config_1 = require("./config/http.config");
const authRoutes_1 = __importDefault(require("./api/auth/authRoutes"));
const passportJwt_service_1 = require("./services/passportJwt.service");
const sessionRoutes_1 = __importDefault(require("./api/sessions/sessionRoutes"));
const problemRoutes_1 = __importDefault(require("./api/problems/problemRoutes"));
const codeRoutes_1 = __importDefault(require("./api/code/codeRoutes"));
const leetcodeRoutes_1 = __importDefault(require("./api/leetcode/leetcodeRoutes"));
const userProgressRoutes_1 = __importDefault(require("./api/userProgress/userProgressRoutes"));
const topicsRoutes_1 = __importDefault(require("./api/topics/topicsRoutes"));
const studyPlanRoutes_1 = __importDefault(require("./api/studyPlan/studyPlanRoutes"));
const reminderService_1 = require("./services/reminderService");
const logger_1 = require("./utils/logger/logger");
const BASE_PATH = app_config_1.config.BASE_PATH;
const app = (0, express_1.default)();
//middleware setup
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: app_config_1.config.APP_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
//stratgey / passportjs
app.use(passport_1.default.initialize());
//- asyncHandler for handling async errors of the requests-//
app.get("/", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.status(http_config_1.HTTPSSTATUS.OK).send({
        message: "🚀 DSA Tracker API - Master Data Structures & Algorithms",
        version: "1.0.0",
        status: "operational",
    });
}));
// Connect to MongoDB
(0, database_1.default)();
// auth routes;
app.use(`${BASE_PATH}/auth`, authRoutes_1.default);
//session-routes (passing this authenticateJwt is compulsory otherwise we get empty arrray)
app.use(`${app_config_1.config.BASE_PATH}/session`, passportJwt_service_1.authenticateJWT, sessionRoutes_1.default);
// problem routes - DSA problems from Codeforces
app.use(`${BASE_PATH}/problems`, problemRoutes_1.default);
// LeetCode routes - Sync and fetch LeetCode problems
app.use(`${BASE_PATH}/leetcode`, leetcodeRoutes_1.default);
// code execution routes - Run and submit code
app.use(`${BASE_PATH}/code`, codeRoutes_1.default);
// user progress routes - Track submissions, progress, and streaks (Protected)
app.use(`${BASE_PATH}/progress`, passportJwt_service_1.authenticateJWT, userProgressRoutes_1.default);
// topics routes - Get DSA sheet topics and hierarchy (Protected)
app.use(`${BASE_PATH}/topics`, passportJwt_service_1.authenticateJWT, topicsRoutes_1.default);
// study plan routes - Plan and track study schedule (Protected)
app.use(`${BASE_PATH}/study-plans`, passportJwt_service_1.authenticateJWT, studyPlanRoutes_1.default);
//error handler middleware for handling errors gracefully and return appropriate response codes + messages
app.use(errorHandler_1.errorHandler);
// Listen to port
app.listen(app_config_1.config.PORT, async () => {
    logger_1.logger.info(`🚀 Server is running on port ${app_config_1.config.PORT}`);
    logger_1.logger.info(`Environment: ${app_config_1.config.NODE_ENV}`);
    logger_1.logger.info(`CORS Origin: ${app_config_1.config.APP_ORIGIN}`);
    await (0, database_1.default)();
    // Start reminder checker service
    (0, reminderService_1.startReminderChecker)();
});
