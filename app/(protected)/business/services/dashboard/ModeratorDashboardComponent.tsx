"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Trophy,
  FileText,
  Mail,
  Calendar,
  Award,
  Settings,
  Bell,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit3,
  Eye,
  Download,
  Loader2,
  RefreshCw,
  Shield,
  Star,
  Activity,
} from "lucide-react";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface ModeratorProfile {
  id: string;
  userId: string;
  guideEmail: string;
  status: "pending_review" | "approved" | "rejected";
  submittedAt: string;
}

interface ModeratorDetails {
  primarySports: string | null; // ✅ lowercase to match service
  sports: string[]; // ✅ lowercase to match service
  experience: number | null; // ✅ lowercase to match service
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
  };
  documents?: string[];
  reviewNote?: string | null;
  reviewedAt?: string | null;
}

interface DashboardData {
  hasModeratorProfile: boolean;
  profile?: ModeratorProfile;
  details?: ModeratorDetails;
  message?: string;
}

interface DashboardStats {
  totalApplications: number;
  approvedApplications: number;
  pendingReviews: number;
  rejectedApplications: number;
}

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

const ModeratorDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch moderator profile data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching moderator profile data...");
      const timestamp = new Date().getTime();
      const response = await fetch(
        `/business/services/api/moderator/register?_t=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error response:", errorText);
        throw new Error(`Failed to fetch profile data: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Dashboard data received:", result);
      console.log("🔍 Profile:", result.data?.profile);
      console.log("🔍 Details:", result.data?.details);

      setDashboardData(result.data);

      // Calculate stats based on actual status
      const actualStatus = result.data?.profile?.status;
      setStats({
        totalApplications: 1,
        approvedApplications: actualStatus === "approved" ? 1 : 0,
        pendingReviews: actualStatus === "pending_review" ? 1 : 0,
        rejectedApplications: actualStatus === "rejected" ? 1 : 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Make sure you have submitted a moderator application first.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
            <a
              href="/moderator/apply"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Apply as Moderator
            </a>
          </div>
        </div>
      </div>
    );
  }

  // No profile state
  if (!dashboardData?.hasModeratorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Moderator Profile
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't submitted a moderator application yet. Apply now to
            become a trusted moderator in our community.
          </p>
          <a
            href="/moderator/apply"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Apply to Become a Moderator
          </a>
        </div>
      </div>
    );
  }

  const { profile, details } = dashboardData;
  console.log("✅ Final Profile data:", profile);
  console.log("✅ Final Details data:", details);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Moderator Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back to your Sparta moderator panel
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                title="Refresh"
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-md hover:bg-gray-100"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                title="Notifications"
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                title="Settings"
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Status Alert */}
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
                      {new Date(profile.submittedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  {details?.reviewedAt && (
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-2 opacity-70" />
                      <span>
                        <strong>Reviewed:</strong>{" "}
                        {new Date(details.reviewedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Review Note */}
            {details?.reviewNote && (
              <div className="mt-6 p-4 bg-white bg-opacity-70 rounded-lg border">
                <div className="flex items-start">
                  <FileText className="w-4 h-4 mt-0.5 mr-2 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Admin Review Note:
                    </h4>
                    <p className="text-sm text-gray-700">
                      {details.reviewNote}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalApplications || 0}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  Total Applications
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.approvedApplications || 0}
                </p>
                <p className="text-sm text-gray-600 font-medium">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pendingReviews || 0}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  Pending Review
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {details?.sports?.length || 0}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  sports Covered
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Profile Information */}
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
                          {details?.documents?.length || 0} document(s)
                          submitted
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
                      {details.sports.map((sport, index) => (
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
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-start p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-200 transition-all group">
                    <Eye className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                      View Applications
                    </span>
                  </button>

                  <button className="w-full flex items-center justify-start p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-200 transition-all group">
                    <Users className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                      Manage Athletes
                    </span>
                  </button>

                  <button className="w-full flex items-center justify-start p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-200 transition-all group">
                    <Download className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                      Download Reports
                    </span>
                  </button>

                  <button className="w-full flex items-center justify-start p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-200 transition-all group">
                    <Settings className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                      Account Settings
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Application Submitted
                      </p>
                      <p className="text-xs text-gray-500">
                        {profile &&
                          new Date(profile.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                        profile?.status === "approved"
                          ? "bg-green-500"
                          : profile?.status === "rejected"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Status:{" "}
                        {profile?.status?.replace("_", " ").toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {profile?.status === "approved" &&
                          "Congratulations on becoming a moderator!"}
                        {profile?.status === "rejected" &&
                          "Application was not approved"}
                        {profile?.status === "pending_review" &&
                          "Under review by admin team"}
                      </p>
                    </div>
                  </div>

                  {details?.reviewedAt && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Review Completed
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(details.reviewedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moderator Tools (only for approved moderators) */}
        {profile?.status === "approved" && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
              <div className="p-8">
                <div className="text-center mb-8">
                  <Star className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Moderator Tools
                  </h2>
                  <p className="text-gray-600">
                    Access your moderator privileges and manage the community
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                    <Users className="w-10 h-10 text-indigo-600 group-hover:text-indigo-700 mb-4" />
                    <span className="text-lg font-semibold text-gray-900 mb-2">
                      Athlete Management
                    </span>
                    <span className="text-sm text-gray-500 text-center">
                      Manage athlete profiles, evaluations, and performance
                      tracking
                    </span>
                  </button>

                  <button className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                    <TrendingUp className="w-10 h-10 text-indigo-600 group-hover:text-indigo-700 mb-4" />
                    <span className="text-lg font-semibold text-gray-900 mb-2">
                      Performance Analytics
                    </span>
                    <span className="text-sm text-gray-500 text-center">
                      View comprehensive metrics, trends, and performance
                      insights
                    </span>
                  </button>

                  <button className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                    <FileText className="w-10 h-10 text-indigo-600 group-hover:text-indigo-700 mb-4" />
                    <span className="text-lg font-semibold text-gray-900 mb-2">
                      Reports & Documentation
                    </span>
                    <span className="text-sm text-gray-500 text-center">
                      Generate detailed reports and manage documentation
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;
