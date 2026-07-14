import axios from "axios";
import { config } from "../config/app.config";

// --- Types ---
interface EmailNotification {
  channel: "email";
  to: string;
  subject: string;
  html: string;
}

interface WhatsAppNotification {
  channel: "whatsapp";
  to: string;
  message: string;
}

type NotificationPayload = EmailNotification | WhatsAppNotification;

interface NotificationResponse {
  id?: string;
  [key: string]: any;
}

// --- Template Builder ---
export const buildTemplate = (
  template: string,
  data: Record<string, string | number | boolean | undefined | null>,
): string => {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    // Escape special regex characters in key to prevent injection
    const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`{{${safeKey}}}`, "g"),
      String(value ?? ""),
    );
  }
  return result;
};

// --- Notification Sender ---
export const sendNotification = async (
  payload: NotificationPayload,
): Promise<NotificationResponse> => {
  try {
    const response = await axios.post<NotificationResponse>(
      config.EMAIL.URL,
      payload,
      {
        headers: {
          "x-api-key": config.EMAIL.API_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending notification:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || error.message || "Notification failed",
    );
  }
};
