// components/guide/InboxDialog.tsx (UPDATED)
"use client";

import React, { useState } from "react";
import { X, Bell, AlertCircle, Loader2 } from "lucide-react";
import { useGuideRequests } from "../../../hooks/useGuideRequests";
import { RequestCard } from "./RequestCard";
import { ResponseDialog } from "./ResponseDialogBox";

interface InboxDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced form data interface
interface EvaluationFormData {
  message: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  equipment: string;
}

export const InboxDialog: React.FC<InboxDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    requests,
    stats,
    loading,
    actionLoading,
    error,
    acceptRequest,
    rejectRequest,
  } = useGuideRequests();

  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [actionType, setActionType] = useState<"ACCEPT" | "REJECT">("ACCEPT");

  // Enhanced form data state
  const [formData, setFormData] = useState<EvaluationFormData>({
    message: "",
    location: "",
    scheduledDate: "",
    scheduledTime: "",
    equipment: "",
  });

  if (!isOpen) return null;

  // Reset form data
  const resetFormData = () => {
    setFormData({
      message: "",
      location: "",
      scheduledDate: "",
      scheduledTime: "",
      equipment: "",
    });
  };

  // Handle form data changes
  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle action initiation
  const handleAction = (requestId: string, action: "ACCEPT" | "REJECT") => {
    setSelectedRequest(requestId);
    setActionType(action);
    setShowResponseDialog(true);
    resetFormData();
  };

  // Confirm action with enhanced data
  // Confirm action with enhanced data - FIXED VERSION
  const confirmAction = async () => {
    if (!selectedRequest) return;

    let success;

    if (actionType === "ACCEPT") {
      // ACCEPT: Use structured data with proper typing
      const acceptData = {
        message: formData.message.trim(),
        location: formData.location.trim(),
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        equipment: formData.equipment.trim(),
      };
      success = await acceptRequest(selectedRequest, acceptData);
    } else {
      // REJECT: Use simple message data
      const rejectData = {
        message: formData.message.trim() || undefined,
      };
      success = await rejectRequest(selectedRequest, rejectData);
    }

    if (success) {
      setShowResponseDialog(false);
      setSelectedRequest(null);
      resetFormData();
    }
  };

  // Cancel action
  const cancelAction = () => {
    setShowResponseDialog(false);
    setSelectedRequest(null);
    resetFormData();
  };

  return (
    <>
      {/* Main Dialog Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Main Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-4xl bg-white rounded-xl shadow-2xl 
                       flex flex-col h-[85vh] max-h-[700px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Evaluation Requests
                </h2>
                <p className="text-sm text-gray-600">
                  {stats.total} total requests • {stats.pending} pending review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats Pills */}
              <div className="flex items-center gap-2">
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  {stats.pending} pending
                </div>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {stats.accepted} accepted
                </div>
              </div>

              <button
                title="close"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full
                         hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : error ? (
              <div className="p-8">
                <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <div>
                      <p className="text-red-700 font-medium">
                        Failed to load requests
                      </p>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No requests yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Evaluation requests from athletes will appear here. Athletes
                  can find and request evaluations from you through the
                  platform.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    actionLoading={actionLoading}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Response Dialog */}
      {showResponseDialog && (
        <ResponseDialog
          isOpen={showResponseDialog}
          actionType={actionType}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onConfirm={confirmAction}
          onCancel={cancelAction}
        />
      )}
    </>
  );
};
