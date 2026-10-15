// Load environment variables FIRST before anything else
import { configDotenv } from "dotenv";
configDotenv();

import cors from "cors";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import connectDB from "./database/database";
import { config } from "./config/app.config";
import { errorHandler } from "./middlewares/errorHandler";
import { asyncHandler } from "./middlewares/asyncHandler";
import passport from "./middlewares/passport";
import { HTTPSSTATUS } from "./config/http.config";
import authRoute from "./api/auth/authRoutes";
import { authenticateJWT } from "./services/passportJwt.service";
import sessionRoute from "./api/sessions/sessionRoutes";
import problemRoutes from "./api/problems/problemRoutes";
import codeRoutes from "./api/code/codeRoutes";
import leetcodeRoutes from "./api/leetcode/leetcodeRoutes";
import userProgressRoutes from "./api/userProgress/userProgressRoutes";
import topicsRoutes from "./api/topics/topicsRoutes";
import studyPlanRoutes from "./api/studyPlan/studyPlanRoutes";
import { startReminderChecker } from "./services/reminderService";
import { logger } from "./utils/logger/logger";

const BASE_PATH = config.BASE_PATH;

const app = express();
//middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//stratgey / passportjs
app.use(passport.initialize());

//- asyncHandler for handling async errors of the requests-//
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSSTATUS.OK).send({
      message: "🚀 DSA Tracker API - Master Data Structures & Algorithms",
      version: "1.0.0",
      status: "operational",
    });
  }),
);

// Connect to MongoDB
connectDB();

// auth routes;
app.use(`${BASE_PATH}/auth`, authRoute);

//session-routes (passing this authenticateJwt is compulsory otherwise we get empty arrray)
app.use(`${config.BASE_PATH}/session`, authenticateJWT, sessionRoute);

// problem routes - DSA problems from Codeforces
app.use(`${BASE_PATH}/problems`, problemRoutes);

// LeetCode routes - Sync and fetch LeetCode problems
app.use(`${BASE_PATH}/leetcode`, leetcodeRoutes);

// code execution routes - Run and submit code
app.use(`${BASE_PATH}/code`, codeRoutes);

// user progress routes - Track submissions, progress, and streaks (Protected)
app.use(`${BASE_PATH}/progress`, authenticateJWT, userProgressRoutes);

// topics routes - Get DSA sheet topics and hierarchy (Protected)
app.use(`${BASE_PATH}/topics`, authenticateJWT, topicsRoutes);

// study plan routes - Plan and track study schedule (Protected)
app.use(`${BASE_PATH}/study-plans`, authenticateJWT, studyPlanRoutes);

//error handler middleware for handling errors gracefully and return appropriate response codes + messages
app.use(errorHandler);

// Listen to port
app.listen(config.PORT, async () => {
  logger.info(`🚀 Server is running on port ${config.PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`CORS Origin: ${config.APP_ORIGIN}`);
  await connectDB();

  // Start reminder checker service
  startReminderChecker();
});
