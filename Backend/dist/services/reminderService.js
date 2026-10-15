"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderChecker = exports.checkAndSendReminders = void 0;
const studyPlanModel_1 = __importDefault(require("../api/studyPlan/studyPlanModel"));
const userModel_1 = __importDefault(require("../api/auth/userModel"));
const notification_service_1 = require("./notification.service");
const template_1 = require("../utils/templates/template");
const logger_1 = require("../utils/logger/logger");
/**
 * Check and send reminder emails for study plans
 */
const checkAndSendReminders = async () => {
    try {
        const now = new Date();
        // Find study plans with reminders that are enabled, not sent, and time has passed
        const plansWithReminders = await studyPlanModel_1.default.find({
            "reminder.enabled": true,
            "reminder.sent": false,
            "reminder.reminderDate": { $lte: now },
        }).populate("userId items.problemId");
        logger_1.logger.info(`Found ${plansWithReminders.length} reminders to send`);
        for (const plan of plansWithReminders) {
            try {
                // Get user details
                const user = await userModel_1.default.findById(plan.userId);
                if (!user || !user.email) {
                    logger_1.logger.error(`User not found or email missing for plan ${plan._id}`);
                    continue;
                }
                // Prepare problem details for email
                const problems = plan.items.map((item) => ({
                    title: item.problemId?.title || "Problem",
                    difficulty: item.problemId?.difficulty || "Medium",
                }));
                // Generate email using professional template
                const { subject, html } = (0, template_1.studyPlanReminderTemplate)({
                    userName: user.username || user.name || user.email.split("@")[0],
                    title: plan.title || "Study Session",
                    description: plan.description,
                    date: plan.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                    startTime: plan.startTime,
                    endTime: plan.endTime,
                    problemsCount: plan.items.length,
                    problems: problems.slice(0, 5), // Show max 5 problems in email
                });
                // Send email notification
                await (0, notification_service_1.sendNotification)({
                    channel: "email",
                    to: user.email,
                    subject,
                    html,
                });
                // Mark reminder as sent
                plan.reminder.sent = true;
                await plan.save();
                logger_1.logger.info(`Reminder sent successfully for plan ${plan._id} to ${user.email}`);
            }
            catch (error) {
                logger_1.logger.error(`Error sending reminder for plan ${plan._id}:`, error);
                // Continue with next plan even if one fails
            }
        }
        return {
            success: true,
            remindersSent: plansWithReminders.length,
        };
    }
    catch (error) {
        logger_1.logger.error("Error in checkAndSendReminders:", error);
        throw new Error(`Failed to check and send reminders: ${error.message}`);
    }
};
exports.checkAndSendReminders = checkAndSendReminders;
/**
 * Start reminder checker (runs every 5 minutes)
 */
const startReminderChecker = () => {
    logger_1.logger.info("Starting reminder checker service...");
    // Run immediately on start
    (0, exports.checkAndSendReminders)().catch((err) => logger_1.logger.error("Initial reminder check failed:", err));
    // Then run every 5 minutes
    setInterval(() => {
        (0, exports.checkAndSendReminders)().catch((err) => logger_1.logger.error("Reminder check failed:", err));
    }, 5 * 60 * 1000); // 5 minutes
    logger_1.logger.info("Reminder checker service started (checking every 5 minutes)");
};
exports.startReminderChecker = startReminderChecker;
