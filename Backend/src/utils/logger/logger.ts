// src/utils/logger/logger.ts

/**
 * Production Logger
 * ------------------------------------------------------
 * Simple logger that outputs to console in development
 * and can be extended for production logging services
 * (e.g., Winston, Pino, or cloud logging services)
 * ------------------------------------------------------
 */

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = {
  info: (message: string, meta?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, meta || "");
    }
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || "");
  },

  warn: (message: string, meta?: any) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, meta || "");
    }
  },

  debug: (message: string, meta?: any) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, meta || "");
    }
  },
};
