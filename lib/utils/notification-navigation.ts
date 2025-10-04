// lib/utils/notification-navigation.ts (FIXED VERSION)
/**
 * =============================================================================
 * NOTIFICATION NAVIGATION UTILITIES (TYPESCRIPT FIXED)
 * =============================================================================
 */

import toast from "react-hot-toast";
import { isEvaluationNotification } from "./text-truncation";

export interface NavigationAction {
  type: "route" | "dialog" | "external" | "action";
  path?: string;
  params?: Record<string, any>;
  external?: boolean;
  requiresAuth?: boolean;
}

export interface NotificationClickContext {
  notification: any;
  isNewNotification: boolean;
  isTruncated: boolean;
  userRole?: string;
  currentPath?: string;
}

/**
 * Get loading message for navigation (MOVED TO TOP)
 */
export const getNavigationLoadingMessage = (
  notificationType: string
): string => {
  switch (notificationType) {
    case "FOLLOW":
      return "Opening profile...";
    case "LIKE":
    case "COMMENT":
      return "Loading post...";
    case "TEAM_INVITE":
      return "Opening team details...";
    case "FRIEND_REQUEST":
      return "Loading friend requests...";
    case "MESSAGE":
      return "Opening conversation...";
    case "STAT_UPDATE_APPROVED":
    case "STAT_UPDATE_DENIED":
      return "Loading evaluation details...";
    default:
      return "Loading...";
  }
};

/**
 * Get success message for navigation (MOVED TO TOP)
 */
export const getNavigationSuccessMessage = (
  notificationType: string
): string => {
  switch (notificationType) {
    case "FOLLOW":
      return "Profile loaded";
    case "LIKE":
    case "COMMENT":
      return "Post loaded";
    case "TEAM_INVITE":
      return "Team details loaded";
    case "FRIEND_REQUEST":
      return "Friend requests loaded";
    case "MESSAGE":
      return "Conversation opened";
    case "STAT_UPDATE_APPROVED":
    case "STAT_UPDATE_DENIED":
      return "Evaluation details loaded";
    default:
      return "Content loaded";
  }
};

/**
 * Determine navigation action based on notification type and content
 */
export const getNotificationNavigationAction = (
  context: NotificationClickContext
): NavigationAction => {
  const { notification, isTruncated } = context;
  const isEvaluation = isEvaluationNotification(notification.message);

  // Priority 1: Force dialog for evaluation notifications
  if (
    isEvaluation ||
    notification.type === "STAT_UPDATE_APPROVED" ||
    notification.type === "STAT_UPDATE_DENIED"
  ) {
    return {
      type: "dialog",
      requiresAuth: true,
    };
  }

  // Priority 2: Force dialog for truncated content
  if (
    isTruncated ||
    notification.title.length > 50 ||
    notification.message.length > 80
  ) {
    return {
      type: "dialog",
    };
  }

  // Priority 3: Type-specific navigation
  switch (notification.type) {
    case "FOLLOW":
      return {
        type: "route",
        path: `/profile/${notification.actor?.id || "unknown"}`,
        requiresAuth: true,
      };

    case "LIKE":
    case "COMMENT":
      return {
        type: "route",
        path: `/post/${notification.data?.postId || "unknown"}`,
        params: { scrollTo: "comments" },
        requiresAuth: true,
      };

    case "TEAM_INVITE":
      return {
        type: "route",
        path: `/teams/${notification.data?.teamId || "invitations"}`,
        params: { tab: "invitations" },
        requiresAuth: true,
      };

    case "FRIEND_REQUEST":
      return {
        type: "route",
        path: "/friends",
        params: { tab: "requests" },
        requiresAuth: true,
      };

    case "MESSAGE":
      return {
        type: "route",
        path: `/messages/${notification.actor?.id || "inbox"}`,
        requiresAuth: true,
      };

    case "STAT_UPDATE_REQUEST":
      return {
        type: "dialog", // Show dialog for admin approval
      };

    default:
      return {
        type: "dialog", // Default to dialog for unknown types
      };
  }
};

/**
 * Execute navigation action with proper feedback
 */
export const executeNavigationAction = async (
  action: NavigationAction,
  context: NotificationClickContext,
  callbacks: {
    onRoute: (path: string, params?: any) => void;
    onDialog: () => void;
    onError: (message: string) => void;
  }
): Promise<void> => {
  const { notification } = context;
  const { onRoute, onDialog, onError } = callbacks;

  try {
    switch (action.type) {
      case "route":
        if (!action.path) {
          throw new Error("No path specified for route navigation");
        }

        // Show loading feedback
        const toastId = toast.loading(
          getNavigationLoadingMessage(notification.type)
        );

        // Execute routing (simulate delay)
        await new Promise((resolve) => setTimeout(resolve, 500));
        onRoute(action.path, action.params);

        // Show success feedback
        toast.success(getNavigationSuccessMessage(notification.type), {
          id: toastId,
        });
        break;

      case "dialog":
        onDialog();
        toast.success("Opening detailed view...", {
          icon: "📋",
          duration: 1500,
        });
        break;

      case "external":
        if (!action.path) {
          throw new Error("No URL specified for external navigation");
        }
        window.open(action.path, "_blank", "noopener,noreferrer");
        toast.success("Opening in new tab...", { icon: "🔗" });
        break;

      case "action":
        // Handle custom actions
        toast.custom("Processing action...", { icon: "⚡" });
        break;

      default:
        throw new Error(`Unknown navigation action type: ${action.type}`);
    }
  } catch (error) {
    console.error("Navigation error:", error);
    onError(error instanceof Error ? error.message : "Navigation failed");
  }
};

/**
 * Check if notification should show dialog based on content
 */
export const shouldShowDialog = (notification: any): boolean => {
  // Always show dialog for evaluation notifications
  if (isEvaluationNotification(notification.message)) {
    return true;
  }

  // Show dialog for stat update notifications
  if (
    [
      "STAT_UPDATE_APPROVED",
      "STAT_UPDATE_DENIED",
      "STAT_UPDATE_REQUEST",
    ].includes(notification.type)
  ) {
    return true;
  }

  // Show dialog for truncated content
  if (notification.title.length > 50 || notification.message.length > 80) {
    return true;
  }

  // Show dialog for notifications with additional data
  if (notification.data && Object.keys(notification.data).length > 0) {
    return true;
  }

  return false;
};

/**
 * Get navigation preview text for tooltips
 */
export const getNavigationPreview = (notification: any): string => {
  const action = getNotificationNavigationAction({
    notification,
    isNewNotification: false,
    isTruncated: shouldShowDialog(notification),
  });

  switch (action.type) {
    case "route":
      return `Click to visit ${action.path}`;
    case "dialog":
      return "Click to view full details";
    case "external":
      return "Click to open in new tab";
    default:
      return "Click to interact";
  }
};

/**
 * Handle keyboard navigation
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  notification: any,
  callbacks: {
    onEnter: () => void;
    onSpace: () => void;
    onEscape: () => void;
  }
) => {
  switch (event.key) {
    case "Enter":
      event.preventDefault();
      callbacks.onEnter();
      break;
    case " ":
      event.preventDefault();
      callbacks.onSpace();
      break;
    case "Escape":
      event.preventDefault();
      callbacks.onEscape();
      break;
  }
};

/**
 * Validate navigation permissions
 */
export const validateNavigationPermissions = (
  action: NavigationAction,
  userRole?: string
): boolean => {
  if (!action.requiresAuth) {
    return true;
  }

  // Add role-based validation here
  // For now, just check if user exists
  return !!userRole;
};
