// NotificationDropdown.tsx (FIXED - No more infinite loops)
"use client";

import React, { useEffect, useRef } from "react";
import { BellIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
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
    isLoading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  // CRITICAL: Use ref to track if we've already fetched when opened
  const hasFetchedOnOpenRef = useRef(false);

  // FIXED: Only fetch once when dropdown opens
  useEffect(() => {
    if (isOpen && !hasFetchedOnOpenRef.current) {
      console.log("🔔 Dropdown opened, fetching notifications");
      fetchNotifications();
      hasFetchedOnOpenRef.current = true;
    } else if (!isOpen) {
      // Reset when dropdown closes
      hasFetchedOnOpenRef.current = false;
    }
  }, [isOpen]); // CRITICAL: Remove fetchNotifications from dependencies

  // FIXED: Use hook methods instead of manual API calls
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId); // Uses optimistic updates
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId); // Uses optimistic updates
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(); // Uses optimistic updates
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    hasFetchedOnOpenRef.current = false; // Reset flag
    refreshNotifications();
  };

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Close dropdown
    onClose();

    // Handle navigation based on type
    switch (notification.type) {
      case "FOLLOW":
        toast.success("Opening profile...");
        break;
      case "LIKE":
      case "COMMENT":
        toast.success("Opening post...");
        break;
      default:
        toast.success("Notification opened");
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto z-50">
      {isLoading ? (
        <div className="px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
          <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No notifications</p>
          <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Notifications ({notifications.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh} // FIXED: Use proper refresh method
                className="text-xs text-gray-500 hover:text-gray-700"
                title="Refresh"
              >
                🔄
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  <EyeIcon className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onClick={handleNotificationClick}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                onClose();
                toast("All notifications page coming soon! 🚀");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
