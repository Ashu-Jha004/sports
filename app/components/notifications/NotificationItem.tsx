"use client";

import React from "react";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

interface NotificationItemProps {
  notification: {
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
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: any) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "FOLLOW":
        return "👥";
      case "LIKE":
        return "❤️";
      case "COMMENT":
        return "💬";
      case "MESSAGE":
        return "📩";
      default:
        return "🔔";
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div
      className={`relative px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group cursor-pointer ${
        !notification.isRead ? "bg-blue-50" : ""
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start space-x-3">
        {/* Profile Image or Icon */}
        <div className="flex-shrink-0 mt-1">
          {notification.actor?.profileImageUrl ? (
            <img
              src={notification.actor.profileImageUrl}
              alt={notification.actor.firstName || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              {formatTime(notification.createdAt)}
            </p>
            {notification.actor && (
              <p className="text-xs text-gray-400">
                by {notification.actor.firstName} {notification.actor.lastName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons (show on hover) */}
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
            title="Mark as read"
          >
            <EyeIcon className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1 text-gray-400 hover:text-red-600 rounded"
          title="Delete notification"
        >
          <TrashIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
