// NotificationDropdown.tsx (ENHANCED WITH DIALOG INTEGRATION)
"use client";

import React, { useEffect, useRef, useState } from "react";
import { BellIcon, EyeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { RefreshCwIcon } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import NotificationDetailDialog from "./NotificationDetailDialog"; // NEW: Import dialog
import toast from "react-hot-toast";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    hasNewNotifications,
    newNotificationIds,
    isLoading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    markNotificationAsSeen,
    refreshNotifications,
  } = useNotifications();

  const hasFetchedOnOpenRef = useRef(false);
  const [indicatorCleared, setIndicatorCleared] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // NEW: Dialog state management
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Enhanced fetch and indicator clearing logic
  useEffect(() => {
    if (isOpen && !hasFetchedOnOpenRef.current) {
      console.log("🔔 Dropdown opened, fetching notifications");
      fetchNotifications();
      hasFetchedOnOpenRef.current = true;

      if (hasNewNotifications && !indicatorCleared) {
        setTimeout(() => {
          console.log("🔔 Auto-clearing new notification indicators");
          newNotificationIds.forEach((id) => {
            markNotificationAsSeen(id);
          });
          setIndicatorCleared(true);

          if (newNotificationIds.size > 0) {
            toast.success(
              `Viewed ${newNotificationIds.size} new notification${
                newNotificationIds.size > 1 ? "s" : ""
              }`,
              {
                icon: "👁️",
                duration: 2000,
              }
            );
          }
        }, 300);
      }
    } else if (!isOpen) {
      hasFetchedOnOpenRef.current = false;
      setIndicatorCleared(false);
    }
  }, [
    isOpen,
    hasNewNotifications,
    newNotificationIds,
    fetchNotifications,
    markNotificationAsSeen,
    indicatorCleared,
  ]);

  // NEW: Enhanced notification click handling with dialog
  const handleNotificationClick = async (notification: any) => {
    console.log("🔔 Notification clicked:", notification.id);

    // Mark as seen immediately if it's new
    if (newNotificationIds.has(notification.id)) {
      markNotificationAsSeen(notification.id);
    }

    // For evaluation notifications or truncated content, open dialog
    const shouldOpenDialog =
      notification.type === "STAT_UPDATE_APPROVED" ||
      notification.type === "STAT_UPDATE_DENIED" ||
      notification.title.length > 50 ||
      notification.message.length > 80;

    if (shouldOpenDialog) {
      // Open dialog for detailed view
      setSelectedNotification(notification);
      setIsDialogOpen(true);

      // Mark as read when opening dialog
      if (!notification.isRead) {
        await handleMarkAsRead(notification.id);
      }

      // Don't close dropdown immediately - let user see dialog
      console.log("🔔 Opening notification detail dialog");
    } else {
      // Handle simple notifications with direct navigation
      if (!notification.isRead) {
        await handleMarkAsRead(notification.id);
      }

      // Close dropdown
      onClose();

      // Enhanced navigation feedback for simple notifications
      switch (notification.type) {
        case "FOLLOW":
          toast.success("Opening profile...", { icon: "👤" });
          break;
        case "LIKE":
        case "COMMENT":
          toast.success("Opening post...", { icon: "💬" });
          break;
        case "TEAM_INVITE":
          toast.success("Opening team invitation...", { icon: "👥" });
          break;
        case "MESSAGE":
          toast.success("Opening message...", { icon: "💬" });
          break;
        default:
          toast.success("Notification viewed", { icon: "👁️" });
          break;
      }
    }
  };

  // NEW: Dialog close handler
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedNotification(null);
    // Don't auto-close dropdown - let user continue browsing
  };

  // NEW: Dialog action handlers
  const handleDialogMarkAsRead = async (notificationId: string) => {
    await handleMarkAsRead(notificationId);
    // Update the selected notification state
    if (selectedNotification && selectedNotification.id === notificationId) {
      setSelectedNotification({
        ...selectedNotification,
        isRead: true,
      });
    }
  };

  const handleDialogDelete = async (notificationId: string) => {
    await handleDelete(notificationId);
    // Close dialog after deletion
    handleDialogClose();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);

    if (
      notification &&
      (notification.type === "STAT_UPDATE_APPROVED" ||
        notification.type === "TEAM_INVITE" ||
        notification.type === "FRIEND_REQUEST")
    ) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this important notification?"
      );
      if (!confirmed) return;
    }

    try {
      await deleteNotification(notificationId);
      toast.success("Notification deleted", { icon: "🗑️" });
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      toast("All notifications are already read", { icon: "✅" });
      return;
    }

    try {
      await markAllAsRead();
      toast.success(`Marked ${unreadCount} notifications as read`, {
        icon: "✅",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  // Enhanced refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log("🔄 Manual refresh triggered");
    hasFetchedOnOpenRef.current = false;
    setIndicatorCleared(false);

    try {
      await refreshNotifications();
      toast.success("Notifications updated", { icon: "✅", duration: 1500 });
    } catch (error) {
      toast.error("Failed to refresh", { icon: "❌" });
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Notification Dropdown */}
      {/* Enhanced Notification Dropdown with Better Sizing */}
      <div
        className="fixed sm:absolute 
  top-16 sm:top-auto sm:mt-2 
  left-4 right-4 sm:left-auto sm:right-0
  w-auto sm:w-[420px] 
  max-w-none sm:max-w-[420px]
  bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
      >
        {" "}
        {/* Enhanced Loading State */}
        {isLoading ? (
          <div className="px-6 py-10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 font-medium">
              Loading notifications...
            </p>
            <p className="text-xs text-gray-400 mt-2">Please wait</p>
          </div>
        ) : notifications.length === 0 ? (
          /* Enhanced Empty State */
          <div className="px-6 py-16 text-center text-gray-500">
            <BellIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <p className="text-lg font-medium mb-2">No notifications</p>
            <p className="text-sm text-gray-400">You're all caught up! 🎉</p>
          </div>
        ) : (
          <>
            {/* Enhanced Header with More Space */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Notifications
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                    {notifications.length}
                  </span>
                  {hasNewNotifications && !indicatorCleared && (
                    <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      <SparklesIcon className="w-4 h-4" />
                      <span>{newNotificationIds.size} new</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-all duration-150 disabled:opacity-50"
                    title="Refresh notifications"
                  >
                    <RefreshCwIcon
                      className={`w-5 h-5 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded-md hover:bg-blue-50 transition-all duration-150"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Mark all read</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold min-w-[18px] text-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Notification List with Better Height */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notification, index) => (
                <div key={notification.id} className="relative">
                  {/* New notification indicator */}
                  {newNotificationIds.has(notification.id) &&
                    !indicatorCleared && (
                      <div className="absolute left-3 top-4 w-2 h-2 bg-red-500 rounded-full animate-pulse z-20 border border-white shadow-sm"></div>
                    )}

                  <div
                    className={`transition-all duration-200 ${
                      newNotificationIds.has(notification.id) &&
                      !indicatorCleared
                        ? "animate-fadeIn"
                        : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onClick={handleNotificationClick}
                      isNew={
                        newNotificationIds.has(notification.id) &&
                        !indicatorCleared
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Footer with More Space */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    onClose();
                    toast("All notifications page coming soon! 🚀", {
                      icon: "📱",
                    });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                >
                  View all notifications
                </button>

                {hasNewNotifications && !indicatorCleared && (
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
                    {newNotificationIds.size} new items viewed
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isRefreshing
                        ? "bg-blue-500 animate-pulse"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <span>{isRefreshing ? "Updating..." : "Up to date"}</span>
                </div>

                <div className="text-sm text-gray-400">Click for details</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* NEW: Notification Detail Dialog */}
      <NotificationDetailDialog
        notification={selectedNotification}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onMarkAsRead={handleDialogMarkAsRead}
        onDelete={handleDialogDelete}
      />
    </>
  );
};

export default NotificationDropdown;
