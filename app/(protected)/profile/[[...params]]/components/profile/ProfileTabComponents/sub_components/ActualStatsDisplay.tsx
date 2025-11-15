// ActualStatsDisplay.tsx
// ActualStatsDisplay.tsx
"use client";

import React, { useState } from "react";
import { UserSearch, ChartBarIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { AthleteStats, recordHolderStats } from "../utils/recordHolderStats";
import { aggregateUserStats } from "../utils/aggregateUserStats";
import { HexagramChart } from "../sub_components/HexagramChart/HexagramChart";
import { AthleteStatsFullReport } from "../sub_components/HexagramChart/FullReport";

export const ActualStatsDisplay = ({
  stats,
  onFindGuides,
  loading = false,
  error = null,
}: any) => {
  const { user }: any = useUser();
  const { id } = user;

  const [isReportOpen, setIsReportOpen] = useState(false);

  if (loading) return <div>Loading stats...</div>;
  if (error)
    return <div className="text-red-600 font-semibold">Error: {error}</div>;

  // Aggregate user's composite stats from raw data
  const userStats: AthleteStats = aggregateUserStats(stats);

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Comparison
            </h3>
            <button
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => setIsReportOpen(true)}
            >
              View Full Report
            </button>
          </div>

          {/* HexagramChart Comparison */}
          <HexagramChart
            userStats={userStats}
            onOpenReport={() => setIsReportOpen(true)}
          />
        </div>

        {id === stats.athlete.clerkId && (
          <button
            onClick={onFindGuides}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Finding Guides...
              </>
            ) : (
              <>
                <UserSearch className="w-4 h-4" />
                Find Nearby Guides
              </>
            )}
          </button>
        )}
      </div>

      {/* Full Report Modal */}

      <AthleteStatsFullReport
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        rawDetails={stats}
      />
    </>
  );
};

// Loading Skeleton
export const StatsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 rounded-lg p-8">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <div className="w-8 h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error State
export const StatsErrorState = ({
  onRetry,
  error,
}: {
  onRetry: any;
  error: string;
}) => (
  <div className="bg-red-50 rounded-lg p-8 text-center border border-red-200">
    <ChartBarIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-red-900 mb-2">
      Failed to Load Statistics
    </h3>
    <p className="text-red-700 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 
               text-white rounded-lg font-medium transition-colors duration-200"
    >
      Try Again
    </button>
  </div>
);
