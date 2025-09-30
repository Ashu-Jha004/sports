// hooks/useNotifications.ts (FIXED - No more infinite loops)
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import type { DatabaseNotification } from "@/types/notification";
import {
  validateNotificationResponse,
  formatNotificationError,
  shouldShowNotificationToast,
} from "@/lib/utils/notifications";

export const useNotifications = () => {
  // State management
  const [notifications, setNotifications] = useState<DatabaseNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // CRITICAL: Use ref to prevent infinite loops
  const fetchInProgressRef = useRef(false);
  const hasFetchedInitialRef = useRef(false);

  /**
   * FIXED: Stable fetchNotifications function
   */
  const fetchNotifications = useCallback(async (options = {}) => {
    const { limit = 20, offset = 0, append = false } = options;

    // CRITICAL: Prevent concurrent/duplicate requests
    if (fetchInProgressRef.current) {
      console.log("⚠️ Fetch already in progress, skipping");
      return;
    }

    // CRITICAL: Prevent initial fetch if already done
    if (!append && hasFetchedInitialRef.current && offset === 0) {
      console.log("⚠️ Initial fetch already done, skipping");
      return;
    }

    fetchInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 fetchNotifications called:", { limit, offset, append });

      const url = new URL("/api/notifications", window.location.origin);
      url.searchParams.set("limit", limit.toString());
      if (offset > 0) url.searchParams.set("offset", offset.toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📡 Response received:", data);

      // Validate response structure
      if (!validateNotificationResponse(data)) {
        throw new Error("Invalid response format from server");
      }

      // Update state based on append mode
      if (append) {
        setNotifications((prev) => [...prev, ...data.data.notifications]);
      } else {
        setNotifications(data.data.notifications);
        hasFetchedInitialRef.current = true; // Mark initial fetch as done
      }

      setUnreadCount(data.data.unreadCount);
      setHasMore(data.data.notifications.length === limit);

      console.log("✅ Notifications state updated");
    } catch (error) {
      console.error("❌ fetchNotifications error:", error);

      const errorMessage = formatNotificationError(error);
      setError(errorMessage);

      if (shouldShowNotificationToast(error)) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, []); // CRITICAL: Empty dependencies array

  /**
   * FIXED: Other methods with proper refs
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Optimistic update
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Optimistic update
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  }, []);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }

        // Remove from state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update unread count if necessary
        const deletedNotification = notifications.find(
          (n) => n.id === notificationId
        );
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
        toast.error("Failed to delete notification");
      }
    },
    [notifications]
  );

  const refreshNotifications = useCallback(() => {
    console.log("🔄 Refreshing notifications");
    hasFetchedInitialRef.current = false; // Reset the flag
    setNotifications([]);
    setHasMore(true);
    fetchNotifications({ limit: 20, offset: 0 });
  }, [fetchNotifications]);

  // CRITICAL: Memoized return value to prevent object recreation
  return useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      hasMore,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      hasMore,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications,
    ]
  );
};
