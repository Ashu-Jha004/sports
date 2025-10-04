// components/guide/InboxButton.tsx (NEW)
"use client";

import React from "react";
import { Bell, Loader2 } from "lucide-react";
import { useGuideRequests } from "../../../hooks/useGuideRequests";

interface InboxButtonProps {
  onClick: () => void;
  className?: string;
}

export const InboxButton: React.FC<InboxButtonProps> = ({
  onClick,
  className = "",
}) => {
  const { stats, loading } = useGuideRequests();

  if (loading) {
    return (
      <button
        title="loader"
        disabled
        className={`relative p-2 text-gray-400 rounded-md ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 
                 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 ${className}`}
      title="Evaluation Requests"
    >
      <Bell className="w-5 h-5" />

      {/* Notification Badge */}
      {stats.pending > 0 && (
        <span
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white 
                       text-xs font-bold rounded-full flex items-center justify-center
                       animate-pulse"
        >
          {stats.pending > 9 ? "9+" : stats.pending}
        </span>
      )}
    </button>
  );
};
