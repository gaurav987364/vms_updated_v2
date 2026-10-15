"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_config_1 = require("../config/app.config");
const logger_1 = require("../utils/logger/logger");
// Disable buffering - fail fast instead of hanging
mongoose_1.default.set('bufferCommands', false);
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(app_config_1.config.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });
        const dbHost = app_config_1.config.MONGO_URI.split('@')[1]?.split('/')[0] || 'database';
        logger_1.logger.info(`✅ MongoDB Connected Successfully to ${dbHost}`);
    }
    catch (error) {
        logger_1.logger.error("❌ MongoDB connection failed", error);
        logger_1.logger.error("Database operations will fail. Check configuration.");
        // Exit in production, continue in development for debugging
        if (app_config_1.config.NODE_ENV === "production") {
            logger_1.logger.error("Exiting due to database connection failure in production");
            process.exit(1);
        }
    }
};
exports.default = connectDB;
