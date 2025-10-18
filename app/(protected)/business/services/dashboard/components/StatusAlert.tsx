import React from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
} from "lucide-react";
const StatusAlert = ({ profile }: any) => {
      const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending_review":
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5" />;
      case "pending_review":
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "approved":
        return "Congratulations! Your moderator application has been approved. You now have full moderator privileges.";
      case "rejected":
        return "Your application was not approved. Contact support for more information or to reapply.";
      case "pending_review":
      default:
        return "Your application is under review. You will be contacted within 48 hours.";
    }
  };
  return (
    <div>
      {" "}
      {profile && (
        <div
          className={`mb-8 p-6 rounded-xl border-2 ${getStatusColor(
            profile.status
          )} shadow-sm`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 p-1">
              {getStatusIcon(profile.status)}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">
                  Application Status:{" "}
                  {profile.status.replace("_", " ").toUpperCase()}
                </h3>
                {profile.status === "approved" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Star className="w-4 h-4 mr-1" />
                    Active Moderator
                  </span>
                )}
              </div>

              <p className="text-sm mb-4 leading-relaxed">
                {getStatusMessage(profile.status)}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 opacity-70" />
                  <span>
                    <strong>Submitted:</strong>{" "}
                    {new Date(profile.submittedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusAlert;
