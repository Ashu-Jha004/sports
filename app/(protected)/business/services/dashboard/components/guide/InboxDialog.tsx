// components/guide/InboxDialog.tsx (NEW)
"use client";

import React, { useState } from "react";
import {
  X,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Trophy,
  MapPin,
  Calendar,
  MessageSquare,
  UserCheck,
  UserX,
  Send,
  Loader2,
} from "lucide-react";
import { useGuideRequests } from "../../../hooks/useGuideRequests";

interface InboxDialogProps {
  isOpen: boolean;
  onClose: () => void;
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
  const [responseMessage, setResponseMessage] = useState("");
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [actionType, setActionType] = useState<"ACCEPT" | "REJECT">("ACCEPT");

  if (!isOpen) return null;

  const handleAction = (requestId: string, action: "ACCEPT" | "REJECT") => {
    setSelectedRequest(requestId);
    setActionType(action);
    setShowResponseDialog(true);
    setResponseMessage("");
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    const success =
      actionType === "ACCEPT"
        ? await acceptRequest(
            selectedRequest,
            responseMessage.trim() || undefined
          )
        : await rejectRequest(
            selectedRequest,
            responseMessage.trim() || undefined
          );

    if (success) {
      setShowResponseDialog(false);
      setSelectedRequest(null);
      setResponseMessage("");
    }
  };

  const cancelAction = () => {
    setShowResponseDialog(false);
    setSelectedRequest(null);
    setResponseMessage("");
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

      {/* Response Dialog */}
      {showResponseDialog && (
        <ResponseDialog
          isOpen={showResponseDialog}
          actionType={actionType}
          responseMessage={responseMessage}
          onResponseChange={setResponseMessage}
          onConfirm={confirmAction}
          onCancel={cancelAction}
        />
      )}
    </>
  );
};

// Request Card Component
interface RequestCardProps {
  request: any;
  actionLoading: string | null;
  onAction: (requestId: string, action: "ACCEPT" | "REJECT") => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  actionLoading,
  onAction,
}) => (
  <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all hover:shadow-sm">
    <div className="flex items-start justify-between">
      {/* Request Info */}
      <div className="flex gap-4 flex-1">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {request.user.profileImageUrl ? (
            <img
              src={request.user.profileImageUrl}
              alt={`${request.user.firstName} ${request.user.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-1">
              {request.user.firstName} {request.user.lastName}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {request.user.PrimarySport && (
                <div className="flex items-center">
                  <Trophy className="w-3 h-3 mr-1" />
                  <span>{request.user.PrimarySport}</span>
                </div>
              )}
              {(request.user.city || request.user.state) && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>
                    {[request.user.city, request.user.state]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-gray-700 text-sm leading-relaxed italic">
              "{request.message}"
            </p>
          </div>

          {/* Response (if any) */}
          {request.guideResponse && (
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <div className="flex items-start">
                <MessageSquare className="w-3 h-3 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-indigo-900 mb-1">
                    Your Response:
                  </p>
                  <p className="text-xs text-indigo-800">
                    {request.guideResponse}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status & Actions */}
      <div className="ml-4 flex flex-col items-end gap-2">
        {/* Status Badge */}
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            request.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : request.status === "ACCEPTED"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {request.status === "PENDING" && <Clock className="w-3 h-3" />}
          {request.status === "ACCEPTED" && <CheckCircle className="w-3 h-3" />}
          {request.status === "REJECTED" && <AlertCircle className="w-3 h-3" />}
          {request.status}
        </div>

        {/* Action Buttons */}
        {request.status === "PENDING" && (
          <div className="flex gap-2">
            <button
              onClick={() => onAction(request.id, "ACCEPT")}
              disabled={actionLoading === request.id}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white 
                       text-xs font-medium rounded-md transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-1"
            >
              {actionLoading === request.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <UserCheck className="w-3 h-3" />
              )}
              Accept
            </button>
            <button
              onClick={() => onAction(request.id, "REJECT")}
              disabled={actionLoading === request.id}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white 
                       text-xs font-medium rounded-md transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-1"
            >
              {actionLoading === request.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <UserX className="w-3 h-3" />
              )}
              Reject
            </button>
          </div>
        )}

        {/* Timestamp for processed requests */}
        {request.status !== "PENDING" && request.respondedAt && (
          <p className="text-xs text-gray-500">
            {new Date(request.respondedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Response Dialog Component
interface ResponseDialogProps {
  isOpen: boolean;
  actionType: "ACCEPT" | "REJECT";
  responseMessage: string;
  onResponseChange: (message: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ResponseDialog: React.FC<ResponseDialogProps> = ({
  isOpen,
  actionType,
  responseMessage,
  onResponseChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-60"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {actionType === "ACCEPT" ? (
                  <>
                    <UserCheck className="w-5 h-5 text-green-600" />
                    Accept Request
                  </>
                ) : (
                  <>
                    <UserX className="w-5 h-5 text-red-600" />
                    Reject Request
                  </>
                )}
              </h3>
              <button
                title="close"
                onClick={onCancel}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Message{" "}
                <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => onResponseChange(e.target.value)}
                placeholder={
                  actionType === "ACCEPT"
                    ? "Great! I'd be happy to help with your evaluation..."
                    : "Thank you for your interest. Unfortunately..."
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {responseMessage.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200
                         rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium 
                         transition-colors flex items-center justify-center gap-2 ${
                           actionType === "ACCEPT"
                             ? "bg-green-600 hover:bg-green-700"
                             : "bg-red-600 hover:bg-red-700"
                         }`}
              >
                <Send className="w-4 h-4" />
                {actionType === "ACCEPT" ? "Accept" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
