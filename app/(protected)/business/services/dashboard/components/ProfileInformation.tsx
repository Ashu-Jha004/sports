import React, { useState } from "react";
import {
  User,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  FileText,
  Mail,
  Calendar,
  Award,
  Edit3,
  Activity,
  BarChart3, // NEW: Added for stats update icon
} from "lucide-react";
// NEW: Import the StatUpdateDialog
import { StatUpdateDialog } from "./dialogs/StatUpdateDialog";

//app\(protected)\business\services\dashboard\components\ProfileInformation.tsx
const ProfileInformation = ({ profile, details }: any) => {
  // NEW: State for dialog management
  const [isStatUpdateDialogOpen, setIsStatUpdateDialogOpen] = useState(false);

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

  // NEW: Handler functions for dialog
  const handleOpenStatUpdateDialog = () => {
    console.log("🔓 Opening Stat Update dialog");
    setIsStatUpdateDialogOpen(true);
  };

  const handleCloseStatUpdateDialog = () => {
    console.log("🔒 Closing Stat Update dialog");
    setIsStatUpdateDialogOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced ProfileInformation */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-600" />
                  Profile Information
                </h2>
                <button className="flex items-center text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-50">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.guideEmail || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Applied
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile &&
                            new Date(profile.submittedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                    Location Details
                  </h3>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Location
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {[
                          details?.location?.city,
                          details?.location?.state,
                          details?.location?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* sports Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                    sports Expertise
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Trophy className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Primary Sport
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {details?.primarySports || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Award className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          experience
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {details?.experience
                            ? `${details.experience} years`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                    Documentation
                  </h3>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Documents
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {details?.documents?.length || 0} document(s) submitted
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* sports Tags */}
              {details?.sports && details.sports.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    All sports ({details.sports.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.sports.map((sport: any, index: any) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Quick Status Overview */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                Quick Overview
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      profile?.status || "pending_review"
                    )}`}
                  >
                    {getStatusIcon(profile?.status || "pending_review")}
                    <span className="ml-1 capitalize">
                      {profile?.status?.replace("_", " ") || "pending"}
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    sports Count
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {details?.sports?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    experience
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {details?.experience ? `${details.experience}y` : "N/A"}
                  </span>
                </div>
              </div>

              {/* NEW: Stat Update Section - Only show for approved guides */}
              {profile?.status === "approved" && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Guide Actions
                  </h3>
                  <button
                    onClick={handleOpenStatUpdateDialog}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Stat Update</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Verify OTP to update athlete statistics
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEW: StatUpdateDialog - Rendered at component level */}
      <StatUpdateDialog
        isOpen={isStatUpdateDialogOpen}
        onClose={handleCloseStatUpdateDialog}
      />
    </>
  );
};

export default ProfileInformation;
