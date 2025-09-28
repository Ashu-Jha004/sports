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
