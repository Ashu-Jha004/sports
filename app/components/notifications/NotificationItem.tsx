// NotificationItem.tsx (ENHANCED WITH SMART TRUNCATION)
"use client";

import React, { useState } from "react";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import {
  truncateNotificationTitle,
  truncateNotificationMessage,
  truncateActorName,
  getPreviewText,
  isEvaluationNotification,
  formatTimeWithTruncation,
} from "@/lib/utils/text-truncation";

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
  isNew?: boolean; // Support for new notification indicator
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  isNew = false,
}) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

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
      case "STAT_UPDATE_APPROVED":
        return "✅";
      case "STAT_UPDATE_DENIED":
        return "❌";
      case "STAT_UPDATE_REQUEST":
        return "📊";
      case "TEAM_INVITE":
        return "👥";
      case "FRIEND_REQUEST":
        return "🤝";
      default:
        return "🔔";
    }
  };

  // NEW: Smart truncation with tooltip support
  const titleData = truncateNotificationTitle(notification.title);
  const messageData = truncateNotificationMessage(notification.message);

  // NEW: Actor name truncation
  const actorName = notification.actor
    ? `${notification.actor.firstName || ""} ${
        notification.actor.lastName || ""
      }`.trim()
    : "";
  const actorData = actorName
    ? truncateActorName(actorName)
    : { truncated: "", isTruncated: false };

  // NEW: Check if this is an evaluation notification
  const isEvaluation = isEvaluationNotification(notification.message);

  // NEW: Enhanced tooltip content
  const getTooltipContent = (type: "title" | "message" | "actor") => {
    switch (type) {
      case "title":
        return titleData.isTruncated ? notification.title : null;
      case "message":
        return messageData.isTruncated
          ? getPreviewText(notification.message, 200)
          : null;
      case "actor":
        return actorData.isTruncated ? actorName : null;
      default:
        return null;
    }
  };

  // NEW: Enhanced time formatting
  const formattedTime = formatTimeWithTruncation(notification.createdAt);

  return (
    <div
      className={`relative px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group cursor-pointer transition-colors ${
        !notification.isRead ? "bg-blue-50" : ""
      } ${isNew ? "bg-gradient-to-r from-blue-50 to-indigo-50" : ""}`}
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
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                isEvaluation ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              {getNotificationIcon(notification.type)}
            </div>
          )}
          {/* NEW: Special evaluation indicator */}
          {isEvaluation && (
            <div className="absolute -mt-2 -ml-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            {/* NEW: Enhanced title with truncation and tooltip */}
            <div className="relative">
              <p
                className={`text-sm font-medium text-gray-900 truncate ${
                  titleData.isTruncated ? "cursor-help" : ""
                }`}
                onMouseEnter={() =>
                  titleData.isTruncated && setShowTooltip("title")
                }
                onMouseLeave={() => setShowTooltip(null)}
                title={titleData.isTruncated ? notification.title : undefined}
              >
                {titleData.truncated}
                {/* NEW: Evaluation badge */}
                {isEvaluation && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Evaluation
                  </span>
                )}
              </p>

              {/* Tooltip for title (if truncated) */}
              {showTooltip === "title" && titleData.isTruncated && (
                <div className="absolute z-50 top-6 left-0 bg-gray-900 text-white text-xs rounded py-1 px-2 max-w-xs shadow-lg">
                  {notification.title}
                  <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              )}
            </div>

            {/* Unread indicator */}
            <div className="flex items-center space-x-2">
              {isNew && (
                <div className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  New
                </div>
              )}
              {!notification.isRead && !isNew && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </div>

          {/* NEW: Enhanced message with truncation and tooltip */}
          <div className="relative mt-1">
            <p
              className={`text-sm text-gray-600 ${
                messageData.isTruncated ? "cursor-help" : ""
              }`}
              onMouseEnter={() =>
                messageData.isTruncated && setShowTooltip("message")
              }
              onMouseLeave={() => setShowTooltip(null)}
              title={
                messageData.isTruncated
                  ? getPreviewText(notification.message, 150)
                  : undefined
              }
            >
              {messageData.truncated}
            </p>

            {/* Tooltip for message (if truncated) */}
            {showTooltip === "message" && messageData.isTruncated && (
              <div className="absolute z-50 top-6 left-0 bg-gray-900 text-white text-xs rounded py-2 px-3 max-w-sm shadow-lg">
                {getPreviewText(notification.message, 200)}
                <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            )}
          </div>

          {/* NEW: Enhanced bottom section with better spacing */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {/* Enhanced time display */}
              <span className="font-medium">{formattedTime}</span>

              {/* NEW: Actor name with truncation */}
              {notification.actor && actorName && (
                <>
                  <span>•</span>
                  <div className="relative">
                    <span
                      className={actorData.isTruncated ? "cursor-help" : ""}
                      onMouseEnter={() =>
                        actorData.isTruncated && setShowTooltip("actor")
                      }
                      onMouseLeave={() => setShowTooltip(null)}
                      title={actorData.isTruncated ? actorName : undefined}
                    >
                      by {actorData.truncated}
                    </span>

                    {/* Tooltip for actor name (if truncated) */}
                    {showTooltip === "actor" && actorData.isTruncated && (
                      <div className="absolute z-50 top-6 left-0 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                        by {actorName}
                        <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* NEW: Notification type indicator */}
              <span className="text-gray-400">•</span>
              <span className="text-gray-400 capitalize">
                {notification.type.toLowerCase().replace("_", " ")}
              </span>
            </div>

            {/* NEW: Click to expand indicator for truncated content */}
            {(titleData.isTruncated || messageData.isTruncated) && (
              <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view full
              </div>
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
            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
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
          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
          title="Delete notification"
        >
          <TrashIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
