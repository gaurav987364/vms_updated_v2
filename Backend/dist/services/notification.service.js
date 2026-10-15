"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.buildTemplate = void 0;
const axios_1 = __importDefault(require("axios"));
const app_config_1 = require("../config/app.config");
// --- Template Builder ---
const buildTemplate = (template, data) => {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        // Escape special regex characters in key to prevent injection
        const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        result = result.replace(new RegExp(`{{${safeKey}}}`, "g"), String(value ?? ""));
    }
    return result;
};
exports.buildTemplate = buildTemplate;
// --- Notification Sender ---
const sendNotification = async (payload) => {
    try {
        const response = await axios_1.default.post(app_config_1.config.EMAIL.URL, payload, {
            headers: {
                "x-api-key": app_config_1.config.EMAIL.API_KEY,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error sending notification:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || "Notification failed");
    }
};
exports.sendNotification = sendNotification;
