import mongoose from "mongoose";
import { config } from "../config/app.config";
import { logger } from "../utils/logger/logger";

// Disable buffering - fail fast instead of hanging
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    const dbHost = config.MONGO_URI.split('@')[1]?.split('/')[0] || 'database';
    logger.info(`✅ MongoDB Connected Successfully to ${dbHost}`);
  } catch (error: any) {
    logger.error("❌ MongoDB connection failed", error);
    logger.error("Database operations will fail. Check configuration.");

    // Exit in production, continue in development for debugging
    if (config.NODE_ENV === "production") {
      logger.error("Exiting due to database connection failure in production");
      process.exit(1);
    }
  }
};

export default connectDB;
