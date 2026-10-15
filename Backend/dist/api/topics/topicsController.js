"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProblemsByTopic = exports.getTopics = void 0;
const topicsService_1 = require("./topicsService");
/**
 * Get all topics with hierarchy
 */
const getTopics = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const topics = await (0, topicsService_1.getTopicsService)(userId);
        res.status(200).json({
            message: "Topics fetched successfully",
            data: topics,
        });
    }
    catch (error) {
        console.error("Error in getTopics:", error.message);
        res.status(500).json({
            message: error.message || "Failed to fetch topics",
        });
    }
};
exports.getTopics = getTopics;
/**
 * Get problems by topic
 */
const getProblemsByTopic = async (req, res) => {
    try {
        const topic = req.params.topic;
        const userId = req.user?.userId;
        const problems = await (0, topicsService_1.getProblemsByTopicService)(topic, userId);
        res.status(200).json({
            message: "Problems fetched successfully",
            data: problems,
        });
    }
    catch (error) {
        console.error("Error in getProblemsByTopic:", error.message);
        res.status(500).json({
            message: error.message || "Failed to fetch problems",
        });
    }
};
exports.getProblemsByTopic = getProblemsByTopic;
