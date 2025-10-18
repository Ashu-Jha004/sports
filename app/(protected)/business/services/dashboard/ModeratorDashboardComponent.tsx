"use client";
//app\(protected)\business\services\dashboard\ModeratorDashboardComponent.tsx
import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, Shield } from "lucide-react";
import ProfileInformation from "./components/ProfileInformation";
import Header from "./components/Header";
import StatusAlert from "./components/StatusAlert";
import ModeratorTools from "./components/ModeratorTools";
import { DashboardData, DashboardStats } from "../../types/service";

const ModeratorDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header profile={profile} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusAlert profile={profile} />
        <ProfileInformation details={details} profile={profile} />
        <ModeratorTools profile={profile} />
      </div>
    </div>
  );
};

export default ModeratorDashboard;
