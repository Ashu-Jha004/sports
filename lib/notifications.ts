import toast from "react-hot-toast";

// Simple notification helpers
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message, { icon: "ℹ️" }),
  loading: (message: string = "Loading...") => toast.loading(message),
};

// App-specific notifications
export const appNotify = {
  followSuccess: (username: string) =>
    notify.success(`Now following @${username} 👥`),
  comingSoon: (feature: string) => notify.info(`${feature} coming soon! 🚀`),
  copySuccess: () => notify.success("Copied to clipboard! 📋"),
};
// lib/utils/notifications.ts (FIXED response validation)

/**
 * Validates notification API response structure (FIXED)
 */
export const validateNotificationResponse = (
  data: any
): data is NotificationOptions => {
  console.log("🔍 Validating notification response:", {
    success: data?.success,
    hasData: !!data?.data,
    hasNotifications: Array.isArray(data?.data?.notifications),
    hasUnreadCount: typeof data?.data?.unreadCount === "number",
  });

  const isValid =
    data &&
    typeof data === "object" &&
    typeof data.success === "boolean" &&
    data.success === true &&
    data.data &&
    typeof data.data === "object" &&
    Array.isArray(data.data.notifications) &&
    typeof data.data.unreadCount === "number";

  if (!isValid) {
    console.error("❌ Invalid notification response structure:", data);
  }

  return isValid;
};
