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
  primarySports: string;
  sports: string[];
  experience: number | null;
  location: {
    city: string | null;
    state: string | null;
    country: string;
  };
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

      const response = await fetch(
        "/business/services/api/moderator/register",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profile data: ${response.status}`);
      }

      const result = await response.json();
      setDashboardData(result.data);
      console.log(result);

      // Mock stats for now - you can create another API endpoint for this
      setStats({
        totalApplications: 2,
        approvedApplications: 0,
        pendingReviews: 1,
        rejectedApplications: 0,
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
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No profile state
  if (!dashboardData?.hasModeratorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Moderator Profile
          </h2>
          <p className="text-gray-600 mb-4">
            You haven't submitted a moderator application yet.
          </p>
          <a
            href="/moderator/apply"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Apply to Become a Moderator
          </a>
        </div>
      </div>
    );
  }

  const { profile, details } = dashboardData;
  console.log("details", details);
  console.log("profile", profile);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Moderator Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back to your Sparta moderator panel
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Alert */}

        <div
          className={`mb-8 p-4 rounded-lg border ${getStatusColor(
            profile!.status
          )}`}
        >
          <div className="flex items-center">
            {getStatusIcon(profile!.status)}
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                Application Status:{" "}
                {profile!.status.replace("_", " ").toUpperCase()}
              </h3>
              <p className="text-sm mt-1">
                {profile!.status === "pending_review" &&
                  "Your application is under review. You will be contacted within 48 hours."}
                {profile!.status === "approved" &&
                  "Congratulations! Your moderator application has been approved."}
                {profile!.status === "rejected" &&
                  "Your application was not approved. Contact support for more information."}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalApplications || 0}
                </p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.approvedApplications || 0}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.pendingReviews || 0}
                </p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {details?.sports?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Sports Covered</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </h2>
                  <button className="flex items-center text-indigo-600 hover:text-indigo-700">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">
                          {profile!.guideEmail}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">
                          Applied{" "}
                          {new Date(profile!.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Location
                    </h3>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">
                        {[
                          details?.location?.city,
                          details?.location?.state,
                          details?.location?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Sports & Experience */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Primary Sport
                    </h3>
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">
                        {details?.primarySports}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Experience
                    </h3>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">
                        {details?.experience
                          ? `${details.experience} years`
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sports List */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Sports Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details?.sports?.map((sport, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        View Applications
                      </span>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        Manage Athletes
                      </span>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex items-center">
                      <Download className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        Download Reports
                      </span>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        Account Settings
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                        {new Date(profile!.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Under Review
                      </p>
                      <p className="text-xs text-gray-500">
                        Status changed to pending review
                      </p>
                    </div>
                  </div>

                  {profile!.status === "approved" && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Application Approved
                        </p>
                        <p className="text-xs text-gray-500">
                          Congratulations on becoming a moderator!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features (only show for approved moderators) */}
        {profile!.status === "approved" && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Moderator Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Users className="w-8 h-8 text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Athlete Management
                    </span>
                    <span className="text-xs text-gray-500">
                      Manage athlete profiles and evaluations
                    </span>
                  </button>

                  <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <TrendingUp className="w-8 h-8 text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Performance Analytics
                    </span>
                    <span className="text-xs text-gray-500">
                      View performance metrics and trends
                    </span>
                  </button>

                  <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <FileText className="w-8 h-8 text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Reports & Documentation
                    </span>
                    <span className="text-xs text-gray-500">
                      Generate and manage reports
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
