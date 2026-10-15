"use strict";
// src/utils/logger/logger.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * Production Logger
 * ------------------------------------------------------
 * Simple logger that outputs to console in development
 * and can be extended for production logging services
 * (e.g., Winston, Pino, or cloud logging services)
 * ------------------------------------------------------
 */
const isDevelopment = process.env.NODE_ENV !== "production";
exports.logger = {
    info: (message, meta) => {
        if (isDevelopment) {
            console.log(`[INFO] ${message}`, meta || "");
        }
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error || "");
    },
    warn: (message, meta) => {
        if (isDevelopment) {
            console.warn(`[WARN] ${message}`, meta || "");
        }
    },
    debug: (message, meta) => {
        if (isDevelopment) {
            console.log(`[DEBUG] ${message}`, meta || "");
        }
    },
};
