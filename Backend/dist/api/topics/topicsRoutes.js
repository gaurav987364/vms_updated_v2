"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const topicsController_1 = require("./topicsController");
const router = express_1.default.Router();
// Get all topics (with user progress if authenticated)
router.get("/", topicsController_1.getTopics);
// Get problems by topic
router.get("/:topic", topicsController_1.getProblemsByTopic);
exports.default = router;
