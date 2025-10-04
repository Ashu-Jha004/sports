// components/notifications/NotificationDetailDialog.tsx (NEW FILE)
"use client";

import React, { useState } from "react";
import {
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon as BellIconSolid,
} from "@heroicons/react/24/solid";
import { formatNotificationTime } from "@/lib/utils/notifications";
import { isEvaluationNotification } from "@/lib/utils/text-truncation";
import toast from "react-hot-toast";

interface NotificationDetailDialogProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
    actor?: {
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    } | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Render additional data in a user-friendly way
 * Only shows relevant information, hides technical fields
 */
const renderUserFriendlyData = (data: any) => {
  const userFriendlyFields: { [key: string]: string } = {
    // User-relevant fields with friendly labels
    postId: "Related Post",
    teamId: "Team",
    eventId: "Event",
    userId: "User",
    location: "Location",
    venue: "Venue",
    date: "Date",
    time: "Time",
    duration: "Duration",
    category: "Category",
    priority: "Priority",
    status: "Status",
    reason: "Reason",
    notes: "Notes",
    message: "Message",
    description: "Description",
    tags: "Tags",
    participants: "Participants",
    deadline: "Deadline",
    requirements: "Requirements",
    equipment: "Equipment",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    website: "Website",
    address: "Address",
  };

  // Fields to completely hide from users (technical/internal fields)
  const hiddenFields = [
    "id",
    "createdAt",
    "updatedAt",
    "userId",
    "notificationId",
    "metadata",
    "internal",
    "system",
    "debug",
    "trace",
    "version",
    "__typename",
    "_id",
    "hash",
    "token",
    "key",
    "secret",
  ];

  const relevantEntries = Object.entries(data)
    .filter(([key]) => !hiddenFields.includes(key))
    .filter(
      ([key, value]) => value !== null && value !== undefined && value !== ""
    );

  if (relevantEntries.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No additional details available
      </p>
    );
  }

  return relevantEntries.map(([key, value]) => {
    const friendlyLabel =
      userFriendlyFields[key] ||
      key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .toLowerCase();

    return (
      <div key={key} className="flex flex-col space-y-1">
        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {friendlyLabel}
        </span>
        <div className="text-sm text-gray-900">{renderFieldValue(value)}</div>
      </div>
    );
  });
};

/**
 * Render field values in appropriate format
 */
const renderFieldValue = (value: any): React.ReactNode => {
  // Handle different data types appropriately
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400">None</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
          >
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value === "object" && value !== null) {
    // For objects, try to extract meaningful information
    if (value.name) return <span className="font-medium">{value.name}</span>;
    if (value.title) return <span className="font-medium">{value.title}</span>;
    if (value.label) return <span className="font-medium">{value.label}</span>;

    // If it's a simple object with few keys, show key-value pairs
    const entries = Object.entries(value);
    if (entries.length <= 3) {
      return (
        <div className="space-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="text-xs">
              <span className="text-gray-500">{k}:</span>{" "}
              <span className="font-medium">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-400 italic">Complex data available</span>;
  }

  // Handle URLs
  if (
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"))
  ) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        View Link
      </a>
    );
  }

  // Handle emails
  if (typeof value === "string" && value.includes("@") && value.includes(".")) {
    return (
      <a
        href={`mailto:${value}`}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {value}
      </a>
    );
  }

  // Handle phone numbers (basic detection)
  if (typeof value === "string" && /^[\+]?[\d\s\-\(\)]{10,}$/.test(value)) {
    return (
      <a
        href={`tel:${value}`}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {value}
      </a>
    );
  }

  // Handle dates
  if (typeof value === "string" && !isNaN(Date.parse(value))) {
    const date = new Date(value);
    return (
      <span className="font-medium">
        {date.toLocaleDateString()} {date.toLocaleTimeString()}
      </span>
    );
  }

  // Default: show as string, but limit length
  const stringValue = String(value);
  if (stringValue.length > 100) {
    return (
      <div>
        <span>{stringValue.substring(0, 100)}...</span>
        <button
          className="text-blue-600 hover:text-blue-800 text-xs ml-2"
          onClick={() => navigator.clipboard.writeText(stringValue)}
        >
          Copy Full Text
        </button>
      </div>
    );
  }

  return <span className="font-medium">{stringValue}</span>;
};

const NotificationDetailDialog: React.FC<NotificationDetailDialogProps> = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onDelete,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !notification) return null;

  // Get notification type icon and styling
  const getNotificationTypeInfo = (type: string) => {
    switch (type) {
      case "STAT_UPDATE_APPROVED":
        return {
          icon: CheckCircleIcon,
          color: "text-green-600",
          bgColor: "bg-green-100",
          label: "Stats Update Approved",
          priority: "high",
        };
      case "STAT_UPDATE_DENIED":
        return {
          icon: ExclamationTriangleIcon,
          color: "text-red-600",
          bgColor: "bg-red-100",
          label: "Stats Update Denied",
          priority: "high",
        };
      case "STAT_UPDATE_REQUEST":
        return {
          icon: ClockIcon,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          label: "Stats Update Request",
          priority: "medium",
        };
      case "FOLLOW":
        return {
          icon: UserIcon,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          label: "New Follower",
          priority: "low",
        };
      case "LIKE":
        return {
          icon: BellIconSolid,
          color: "text-pink-600",
          bgColor: "bg-pink-100",
          label: "Like Received",
          priority: "low",
        };
      case "COMMENT":
        return {
          icon: BellIconSolid,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          label: "New Comment",
          priority: "medium",
        };
      case "TEAM_INVITE":
        return {
          icon: UserIcon,
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
          label: "Team Invitation",
          priority: "high",
        };
      case "FRIEND_REQUEST":
        return {
          icon: UserIcon,
          color: "text-green-600",
          bgColor: "bg-green-100",
          label: "Friend Request",
          priority: "high",
        };
      case "MESSAGE":
        return {
          icon: BellIconSolid,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          label: "New Message",
          priority: "high",
        };
      default:
        return {
          icon: BellIconSolid,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          label: "Notification",
          priority: "medium",
        };
    }
  };

  const typeInfo = getNotificationTypeInfo(notification.type);
  const TypeIcon = typeInfo.icon;
  const isEvaluation = isEvaluationNotification(notification.message);

  // Handle actions
  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      setIsLoading(true);
      try {
        onMarkAsRead(notification.id);
        toast.success("Marked as read", { icon: "✅" });
      } catch (error) {
        toast.error("Failed to mark as read");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    const isImportant = [
      "STAT_UPDATE_APPROVED",
      "TEAM_INVITE",
      "FRIEND_REQUEST",
    ].includes(notification.type);

    if (isImportant) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this important notification?"
      );
      if (!confirmed) return;
    }

    setIsLoading(true);
    try {
      onDelete(notification.id);
      toast.success("Notification deleted", { icon: "🗑️" });
      onClose();
    } catch (error) {
      toast.error("Failed to delete notification");
    } finally {
      setIsLoading(false);
    }
  };

  // Parse additional data
  const additionalData = notification.data
    ? JSON.parse(JSON.stringify(notification.data))
    : {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div
          className="bg-white rounded-lg sm:rounded-xl shadow-2xl 
    w-full max-w-full sm:max-w-3xl 
    h-full sm:h-auto sm:max-h-[95vh] 
    overflow-hidden border border-gray-200 
    flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Notification Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {typeInfo.label} •{" "}
                  {formatNotificationTime(notification.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Priority badge */}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  typeInfo.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : typeInfo.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {typeInfo.priority} priority
              </span>

              <button
                title="close"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Status indicators */}
            <div className="flex items-center space-x-4 mb-6">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  notification.isRead
                    ? "bg-gray-100 text-gray-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    notification.isRead ? "bg-gray-500" : "bg-blue-500"
                  }`}
                />
                <span>{notification.isRead ? "Read" : "Unread"}</span>
              </div>

              {isEvaluation && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Evaluation</span>
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="space-y-6">
              {/* Title section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {notification.title}
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {notification.message}
                  </p>
                </div>
              </div>

              {/* Actor information */}
              {notification.actor && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    From
                  </h4>
                  <div className="flex items-center space-x-3">
                    {notification.actor.profileImageUrl ? (
                      <img
                        src={notification.actor.profileImageUrl}
                        alt={`${notification.actor.firstName} ${notification.actor.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.actor.firstName}{" "}
                        {notification.actor.lastName}
                      </p>
                      <p className="text-xs text-gray-500">User</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <InformationCircleIcon className="h-4 w-4 mr-2" />
                  Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <TagIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{typeInfo.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Received:</span>
                    <span className="font-medium">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BellIconSolid className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">
                      {notification.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Priority:</span>
                    <span
                      className={`font-medium capitalize ${
                        typeInfo.priority === "high"
                          ? "text-red-600"
                          : typeInfo.priority === "medium"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      {typeInfo.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional data section */}
              {/* ENHANCED: Smart Additional Information Section */}
              {additionalData && Object.keys(additionalData).length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <InformationCircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                    Additional Information
                  </h4>
                  <div className="space-y-3">
                    {renderUserFriendlyData(additionalData)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Mark as Read</span>
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDetailDialog;
