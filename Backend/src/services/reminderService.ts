import StudyPlanModel from "../api/studyPlan/studyPlanModel";
import UserModel from "../api/auth/userModel";
import { sendNotification } from "./notification.service";
import { studyPlanReminderTemplate } from "../utils/templates/template";
import { logger } from "../utils/logger/logger";

/**
 * Check and send reminder emails for study plans
 */
export const checkAndSendReminders = async () => {
  try {
    const now = new Date();

    // Find study plans with reminders that are enabled, not sent, and time has passed
    const plansWithReminders = await StudyPlanModel.find({
      "reminder.enabled": true,
      "reminder.sent": false,
      "reminder.reminderDate": { $lte: now },
    }).populate("userId items.problemId");

    logger.info(`Found ${plansWithReminders.length} reminders to send`);

    for (const plan of plansWithReminders) {
      try {
        // Get user details
        const user = await UserModel.findById(plan.userId);
        if (!user || !user.email) {
          logger.error(`User not found or email missing for plan ${plan._id}`);
          continue;
        }

        // Prepare problem details for email
        const problems = plan.items.map((item: any) => ({
          title: item.problemId?.title || "Problem",
          difficulty: item.problemId?.difficulty || "Medium",
        }));

        // Generate email using professional template
        const { subject, html } = studyPlanReminderTemplate({
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
        await sendNotification({
          channel: "email",
          to: user.email,
          subject,
          html,
        });

        // Mark reminder as sent
        plan.reminder!.sent = true;
        await plan.save();

        logger.info(`Reminder sent successfully for plan ${plan._id} to ${user.email}`);
      } catch (error: any) {
        logger.error(`Error sending reminder for plan ${plan._id}:`, error);
        // Continue with next plan even if one fails
      }
    }

    return {
      success: true,
      remindersSent: plansWithReminders.length,
    };
  } catch (error: any) {
    logger.error("Error in checkAndSendReminders:", error);
    throw new Error(`Failed to check and send reminders: ${error.message}`);
  }
};

/**
 * Start reminder checker (runs every 5 minutes)
 */
export const startReminderChecker = () => {
  logger.info("Starting reminder checker service...");

  // Run immediately on start
  checkAndSendReminders().catch((err) =>
    logger.error("Initial reminder check failed:", err)
  );

  // Then run every 5 minutes
  setInterval(() => {
    checkAndSendReminders().catch((err) =>
      logger.error("Reminder check failed:", err)
    );
  }, 5 * 60 * 1000); // 5 minutes

  logger.info("Reminder checker service started (checking every 5 minutes)");
};
