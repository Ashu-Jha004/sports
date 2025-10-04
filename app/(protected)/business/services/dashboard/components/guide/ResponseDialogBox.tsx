// Enhanced Response Dialog Component with Evaluation Scheduling Form
import React from "react";
import {
  X,
  UserCheck,
  UserX,
  Send,
  MapPin,
  Calendar,
  Clock,
  Package,
} from "lucide-react";

interface ResponseDialogProps {
  isOpen: boolean;
  actionType: "ACCEPT" | "REJECT";
  formData: {
    message: string;
    location: string;
    scheduledDate: string;
    scheduledTime: string;
    equipment: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResponseDialog: React.FC<ResponseDialogProps> = ({
  isOpen,
  actionType,
  formData,
  onFormDataChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isAccepting = actionType === "ACCEPT";

  // Validation for required fields (only when accepting)
  const isFormValid =
    !isAccepting ||
    (formData.message.trim() &&
      formData.location.trim() &&
      formData.scheduledDate &&
      formData.scheduledTime);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-60"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {isAccepting ? (
                  <>
                    <UserCheck className="w-5 h-5 text-green-600" />
                    Schedule Evaluation
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
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Message Field - Always shown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message{" "}
                  {isAccepting && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => onFormDataChange("message", e.target.value)}
                  placeholder={
                    isAccepting
                      ? "Great! I'd be happy to help with your evaluation. Here are the details..."
                      : "Thank you for your interest. Unfortunately, I'm not available..."
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm
                           transition-colors"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/500 characters
                </p>
              </div>

              {/* Scheduling Fields - Only for ACCEPT */}
              {isAccepting && (
                <>
                  {/* Location Field */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      Evaluation Location{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        onFormDataChange("location", e.target.value)
                      }
                      placeholder="Enter the meeting location (address, gym, field, etc.)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm
                               transition-colors"
                      maxLength={200}
                    />
                  </div>

                  {/* Date and Time Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        title="date"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) =>
                          onFormDataChange("scheduledDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]} // Minimum today
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm
                                 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 mr-1 text-gray-500" />
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        title="time"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) =>
                          onFormDataChange("scheduledTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm
                                 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Equipment Field */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Package className="w-4 h-4 mr-1 text-gray-500" />
                      Required Equipment{" "}
                      <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.equipment}
                      onChange={(e) =>
                        onFormDataChange("equipment", e.target.value)
                      }
                      placeholder="e.g., Stopwatch, Measuring tape, Sports shoes, Water bottle"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm
                               transition-colors"
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple items with commas
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> A verification OTP will be
                      automatically generated and shared with both you and the
                      athlete for identity confirmation during the physical
                      meeting.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200
                         rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!isFormValid}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium 
                         transition-colors flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed ${
                           isAccepting
                             ? "bg-green-600 hover:bg-green-700 disabled:hover:bg-green-600"
                             : "bg-red-600 hover:bg-red-700 disabled:hover:bg-red-600"
                         }`}
              >
                <Send className="w-4 h-4" />
                {isAccepting ? "Schedule Evaluation" : "Reject Request"}
              </button>
            </div>

            {/* Required Fields Note */}
            {isAccepting && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                <span className="text-red-500">*</span> Required fields
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
