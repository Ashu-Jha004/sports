// Enhanced Request Card Component with Scheduling Details
import {
  User,
  Trophy,
  MapPin,
  Loader2,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Package,
  Shield,
  Copy,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface RequestCardProps {
  request: any;
  actionLoading: string | null;
  onAction: (requestId: string, action: "ACCEPT" | "REJECT") => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  actionLoading,
  onAction,
}) => {
  const [otpCopied, setOtpCopied] = useState(false);

  // Copy OTP to clipboard
  const copyOTP = async () => {
    if (request.OTP) {
      await navigator.clipboard.writeText(request.OTP.toString());
      setOtpCopied(true);
      toast.success("OTP copied to clipboard!");
      setTimeout(() => setOtpCopied(false), 2000);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time helper
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
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
                  <span>{formatDate(request.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Original User Message */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{request.message}"
              </p>
            </div>

            {/* Guide Response - Enhanced for ACCEPTED requests */}
            {request.MessageFromModerator && (
              <div className="bg-indigo-50 rounded-lg p-4 mb-3 border border-indigo-200">
                <div className="flex items-start">
                  <MessageSquare className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-indigo-900 mb-2">
                      Your Response:
                    </p>
                    <p className="text-sm text-indigo-800 mb-3">
                      {request.MessageFromModerator}
                    </p>

                    {/* Scheduling Details for ACCEPTED requests */}
                    {request.status === "ACCEPTED" && (
                      <div className="space-y-3 border-t border-indigo-200 pt-3">
                        {/* Meeting Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Location */}
                          {request.location && (
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-indigo-900">
                                  Location
                                </p>
                                <p className="text-xs text-indigo-800">
                                  {request.location}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Date & Time */}
                          {request.scheduledDate && request.scheduledTime && (
                            <div className="flex items-start">
                              <Clock className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-indigo-900">
                                  When
                                </p>
                                <p className="text-xs text-indigo-800">
                                  {formatDate(request.scheduledDate)}
                                </p>
                                <p className="text-xs text-indigo-800">
                                  {formatTime(request.scheduledTime)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Equipment */}
                        {request.equipment && request.equipment.length > 0 && (
                          <div className="flex items-start">
                            <Package className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-indigo-900 mb-1">
                                Required Equipment
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {request.equipment.map(
                                  (item: string, index: number) => (
                                    <span
                                      key={index}
                                      className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs"
                                    >
                                      {item}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Verification OTP */}
                        {request.OTP && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Shield className="w-4 h-4 text-green-600 mr-2" />
                                <div>
                                  <p className="text-xs font-medium text-green-900">
                                    Verification OTP
                                  </p>
                                  <p className="text-lg font-mono font-bold text-green-800">
                                    {request.OTP}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={copyOTP}
                                className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 
                                         text-green-800 rounded text-xs transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                {otpCopied ? "Copied!" : "Copy"}
                              </button>
                            </div>
                            <p className="text-xs text-green-700 mt-2">
                              Share this code with the athlete for identity
                              verification during the meeting.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
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
            {request.status === "ACCEPTED" && (
              <CheckCircle className="w-3 h-3" />
            )}
            {request.status === "REJECTED" && (
              <AlertCircle className="w-3 h-3" />
            )}
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
              {formatDate(request.respondedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
