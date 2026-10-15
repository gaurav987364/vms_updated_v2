import express from "express";
import { getTopics, getProblemsByTopic } from "./topicsController";

const router = express.Router();

// Get all topics (with user progress if authenticated)
router.get("/", getTopics);

// Get problems by topic
router.get("/:topic", getProblemsByTopic);

export default router;
