// components/notifications/EvaluationNotificationDialog.tsx (ENHANCED WITH ADVANCED FEATURES)
"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  MapPinIcon,
  KeyIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ShareIcon,
  QrCodeIcon,
  MapIcon,
  CalendarDaysIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
} from "@heroicons/react/24/solid";
import { formatNotificationTime } from "@/lib/utils/notifications";
import {
  copyEvaluationData,
  generateOTPQRCode,
  createCalendarLinks,
  generateMapsLink,
  validateEvaluationDataCompleteness,
  shareEvaluationData,
  formatEvaluationForSharing,
} from "@/lib/utils/evaluation-advanced-features";
import toast from "react-hot-toast";

interface EvaluationData {
  otp?: string;
  location?: string;
  scheduledTime?: string;
  equipment?: string[];
  evaluatorName?: string;
  evaluatorContact?: string;
  meetingType?: "physical" | "virtual";
  additionalNotes?: string;
  status?: "scheduled" | "approved" | "denied" | "completed";
  venue?: string;
  requirements?: string;
}

interface EvaluationNotificationDialogProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: "STAT_UPDATE_APPROVED" | "STAT_UPDATE_DENIED" | "STAT_UPDATE_REQUEST";
    isRead: boolean;
    createdAt: string;
    data?: EvaluationData;
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

const EvaluationNotificationDialog: React.FC<
  EvaluationNotificationDialogProps
> = ({ notification, isOpen, onClose, onMarkAsRead, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  if (!isOpen || !notification) return null;

  // Parse evaluation data with defaults
  const evaluationData: EvaluationData = {
    otp: "EVL-2024-8756",
    location: "Sports Complex, Arena 2",
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    equipment: ["Stopwatch", "Measuring Tape", "Clipboard", "Camera"],
    evaluatorName: "Coach Sarah Johnson",
    evaluatorContact: "+1 (555) 123-4567",
    meetingType: "physical",
    additionalNotes:
      "Please arrive 15 minutes early. Bring water bottle and comfortable athletic wear.",
    status:
      notification.type === "STAT_UPDATE_APPROVED"
        ? "approved"
        : notification.type === "STAT_UPDATE_DENIED"
        ? "denied"
        : "scheduled",
    venue: "Main Training Ground",
    requirements: "Valid ID, Athletic wear, Water bottle",
    ...notification.data,
  };

  // Get validation and completeness
  const validation = validateEvaluationDataCompleteness(evaluationData);

  // Generate QR code on mount
  useEffect(() => {
    if (evaluationData.otp) {
      generateOTPQRCode(evaluationData.otp, evaluationData.evaluatorName)
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [evaluationData.otp, evaluationData.evaluatorName]);

  // Get status styling
  const getStatusInfo = () => {
    switch (evaluationData.status) {
      case "approved":
        return {
          icon: CheckCircleIconSolid,
          color: "text-green-600",
          bgColor: "bg-green-100",
          label: "Evaluation Approved",
          description:
            "Your stats update has been approved! Please complete the evaluation process.",
        };
      case "denied":
        return {
          icon: ExclamationCircleIconSolid,
          color: "text-red-600",
          bgColor: "bg-red-100",
          label: "Evaluation Required",
          description:
            "Additional verification needed. Please complete the evaluation to update your stats.",
        };
      case "scheduled":
        return {
          icon: ClockIcon,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          label: "Evaluation Scheduled",
          description:
            "Your evaluation has been scheduled. Please review the details below.",
        };
      default:
        return {
          icon: ClockIcon,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          label: "Evaluation Pending",
          description: "Evaluation status pending. Please check back later.",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Enhanced copy functionality
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast.success(`${label} copied!`, {
        icon: "📋",
        duration: 2000,
      });

      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();

      setCopiedItem(label);
      toast.success(`${label} copied!`, {
        icon: "📋",
        duration: 2000,
      });
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  // Advanced copy functionality
  const handleAdvancedCopy = async (format: "text" | "json" | "formatted") => {
    const success = await copyEvaluationData(evaluationData, format);
    if (success) {
      toast.success(`Evaluation data copied as ${format}!`, {
        icon: "📋",
        duration: 2000,
      });
    } else {
      toast.error("Failed to copy data");
    }
  };

  // Share functionality
  const handleShare = async () => {
    const success = await shareEvaluationData(evaluationData);
    if (!success) {
      toast.error("Failed to share evaluation data");
    }
  };

  // Calendar integration
  const handleAddToCalendar = (provider: "google" | "outlook" | "ics") => {
    try {
      const links = createCalendarLinks(evaluationData);

      if (provider === "ics") {
        const link = document.createElement("a");
        link.href = links.ics;
        link.download = links.icsFilename;
        link.click();
        toast.success("Calendar file downloaded!", { icon: "📅" });
      } else {
        window.open(links[provider], "_blank", "noopener,noreferrer");
        toast.success(`Opening ${provider} Calendar...`, { icon: "📅" });
      }
    } catch (error) {
      toast.error("Failed to add to calendar");
    }
  };

  // Maps integration
  const handleOpenMaps = () => {
    if (evaluationData.location) {
      const mapsUrl = generateMapsLink(
        evaluationData.location,
        evaluationData.venue
      );
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
      toast.success("Opening location in maps...", { icon: "🗺️" });
    }
  };

  // Print functionality
  const handlePrint = () => {
    const printContent = formatEvaluationForSharing(evaluationData);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sparta Evaluation Details</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                white-space: pre-wrap; 
                margin: 20px; 
                line-height: 1.4;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success("Opening print dialog...", { icon: "🖨️" });
    }
  };

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
    const confirmed = window.confirm(
      "Are you sure you want to delete this important evaluation notification?"
    );
    if (!confirmed) return;

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

  // Format date and time
  const formatScheduledTime = (timeString: string) => {
    const date = new Date(timeString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }),
    };
  };

  const scheduledDateTime = evaluationData.scheduledTime
    ? formatScheduledTime(evaluationData.scheduledTime)
    : null;

  return (
    <>
      {/* Enhanced Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Enhanced Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header with Actions */}
          <div
            className={`${statusInfo.bgColor} px-6 py-4 border-b border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-white shadow-sm">
                  <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {statusInfo.label}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {statusInfo.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-xs text-gray-500">
                      Received {formatNotificationTime(notification.createdAt)}
                    </p>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        validation.completeness === "excellent"
                          ? "bg-green-100 text-green-800"
                          : validation.completeness === "good"
                          ? "bg-blue-100 text-blue-800"
                          : validation.completeness === "fair"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {validation.completeness} ({validation.score}/
                      {validation.maxScore})
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Quick Actions */}
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white hover:bg-opacity-50 rounded-full transition-all duration-200"
                  title="Share evaluation details"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-white hover:bg-opacity-50 rounded-full transition-all duration-200"
                  title="Print evaluation details"
                >
                  <PrinterIcon className="h-5 w-5" />
                </button>

                <button
                  title="close"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 rounded-full transition-all duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Content with Advanced Features */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Status Banner with Recommendations */}
            <div
              className={`rounded-lg p-4 mb-6 border-l-4 ${
                evaluationData.status === "approved"
                  ? "bg-green-50 border-green-400"
                  : evaluationData.status === "denied"
                  ? "bg-red-50 border-red-400"
                  : "bg-blue-50 border-blue-400"
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                {notification.title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                {notification.message}
              </p>

              {/* Recommendations */}
              {validation.recommendations.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    📌 Action Items:
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {validation.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Enhanced OTP Section with QR Code */}
              {evaluationData.otp && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <KeyIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Verification Code (OTP)
                    </h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() =>
                          copyToClipboard(evaluationData.otp!, "OTP")
                        }
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                          copiedItem === "OTP"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        <DocumentDuplicateIcon className="h-3 w-3" />
                        <span>{copiedItem === "OTP" ? "Copied!" : "Copy"}</span>
                      </button>

                      {qrCodeUrl && (
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = qrCodeUrl;
                            link.download = `sparta-otp-${evaluationData.otp}.png`;
                            link.click();
                            toast.success("QR code downloaded!", {
                              icon: "📱",
                            });
                          }}
                          className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-all duration-200"
                        >
                          <QrCodeIcon className="h-3 w-3" />
                          <span>QR</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="bg-white rounded-md p-3 border border-blue-300">
                        <code className="text-2xl font-mono font-bold text-blue-900 tracking-wider">
                          {evaluationData.otp}
                        </code>
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        Share this code with your evaluator for verification
                      </p>
                    </div>

                    {qrCodeUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={qrCodeUrl}
                          alt="OTP QR Code"
                          className="w-16 h-16 border border-blue-300 rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Location Section */}
              {evaluationData.location && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
                      Location
                    </h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() =>
                          copyToClipboard(evaluationData.location!, "Location")
                        }
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                          copiedItem === "Location"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        <DocumentDuplicateIcon className="h-3 w-3" />
                        <span>
                          {copiedItem === "Location" ? "Copied!" : "Copy"}
                        </span>
                      </button>

                      <button
                        onClick={handleOpenMaps}
                        className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-all duration-200"
                      >
                        <MapIcon className="h-3 w-3" />
                        <span>Maps</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 font-medium">
                    {evaluationData.location}
                  </p>
                  {evaluationData.venue && (
                    <p className="text-sm text-gray-600 mt-1">
                      Venue: {evaluationData.venue}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Schedule Section */}
            {scheduledDateTime && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-yellow-600" />
                    Scheduled Time
                  </h4>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleAddToCalendar("google")}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all duration-200"
                    >
                      <CalendarDaysIcon className="h-3 w-3" />
                      <span>Google</span>
                    </button>

                    <button
                      onClick={() => handleAddToCalendar("outlook")}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-all duration-200"
                    >
                      <CalendarDaysIcon className="h-3 w-3" />
                      <span>Outlook</span>
                    </button>

                    <button
                      onClick={() => handleAddToCalendar("ics")}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-all duration-200"
                    >
                      <DocumentArrowDownIcon className="h-3 w-3" />
                      <span>ICS</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {scheduledDateTime.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {scheduledDateTime.time}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      evaluationData.meetingType === "physical"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {evaluationData.meetingType === "physical"
                      ? "🏟️ Physical"
                      : "💻 Virtual"}
                  </span>
                </div>
              </div>
            )}

            {/* Equipment & Requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Equipment Section */}
              {evaluationData.equipment &&
                evaluationData.equipment.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                      <WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Required Equipment
                    </h4>
                    <ul className="space-y-2">
                      {evaluationData.equipment.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center text-gray-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Requirements Section */}
              {evaluationData.requirements && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-600" />
                    Requirements
                  </h4>
                  <p className="text-gray-700">{evaluationData.requirements}</p>
                </div>
              )}
            </div>

            {/* Evaluator Information */}
            {(evaluationData.evaluatorName ||
              evaluationData.evaluatorContact) && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                  <UserIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Evaluator Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluationData.evaluatorName && (
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">
                        {evaluationData.evaluatorName}
                      </p>
                    </div>
                  )}
                  {evaluationData.evaluatorContact && (
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">
                          {evaluationData.evaluatorContact}
                        </p>
                        <button
                          title="close"
                          onClick={() =>
                            copyToClipboard(
                              evaluationData.evaluatorContact!,
                              "Contact"
                            )
                          }
                          className={`p-1 rounded ${
                            copiedItem === "Contact"
                              ? "bg-green-100 text-green-600"
                              : "hover:bg-indigo-100 text-indigo-600"
                          }`}
                        >
                          <DocumentDuplicateIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {evaluationData.additionalNotes && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Additional Notes
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {evaluationData.additionalNotes}
                </p>
              </div>
            )}

            {/* Advanced Options Toggle */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>Advanced Options</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    showAdvancedOptions ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdvancedOptions && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleAdvancedCopy("formatted")}
                      className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <DocumentDuplicateIcon className="h-3 w-3" />
                      <span>Copy Formatted</span>
                    </button>

                    <button
                      onClick={() => handleAdvancedCopy("json")}
                      className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      <DocumentDuplicateIcon className="h-3 w-3" />
                      <span>Copy JSON</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <ShareIcon className="h-3 w-3" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <PrinterIcon className="h-3 w-3" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Mark as Read</span>
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Completeness:</span>{" "}
                {validation.completeness}
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
      </div>
    </>
  );
};

export default EvaluationNotificationDialog;
