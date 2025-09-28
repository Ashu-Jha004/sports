"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor?: {
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=20");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      toast.error("Error loading notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
  };
};
