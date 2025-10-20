import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Trophy,
  Crown,
  Shield,
  MapPin,
  Calendar,
  Activity,
} from "lucide-react";
import { VerifiedUser } from "../../../types/otpVerification";
// ✅ ADD: Import new type definitions
import type { AthleteInfo } from "@/types/stats";

// ✅ REPLACE: Update the props interface to support both VerifiedUser and AthleteInfo
interface AthleteHeaderProps {
  athlete: VerifiedUser | AthleteInfo; // ✅ Allow both types
  className?: string;
  showStatsInfo?: boolean; // ✅ ADD: Optional flag to show stats metadata
  lastUpdatedBy?: string | null; // ✅ ADD: Optional stats metadata
  lastUpdatedAt?: string | null; // ✅ ADD: Optional stats metadata
  lastUpdatedByName?: string | null; // ✅ ADD: Optional stats metadata
}
// ✅ ADD: Helper function to normalize athlete data (add after the AthleteHeaderProps interface)
const normalizeAthleteData = (athlete: VerifiedUser | AthleteInfo) => {
  // Handle VerifiedUser type
  if ("firstName" in athlete && "rank" in athlete) {
    return {
      id: athlete.id,
      firstName: athlete.firstName,
      username: athlete.username || null,
      primarySport: athlete.primarySport || null,
      profileImageUrl: athlete.profileImageUrl || null,
      role: athlete.role || null,
      rank: athlete.rank || null,
      class: athlete.class || null,
      city: athlete.city || null,
      state: athlete.state || null,
      country: athlete.country || null,
    };
  }

  // Handle AthleteInfo type (simpler structure)
  return {
    id: athlete.id,
    firstName: athlete.firstName,
    lastName: athlete.lastName || null,
    username: null,
    primarySport: null,
    profileImageUrl: null,
    role: null,
    rank: null,
    class: null,
    city: null,
    state: null,
    country: null,
  };
};

export const AthleteHeader: React.FC<AthleteHeaderProps> = ({
  athlete,
  className = "",
  showStatsInfo = false, // ✅ ADD
  lastUpdatedBy, // ✅ ADD
  lastUpdatedAt, // ✅ ADD
  lastUpdatedByName,
}) => {
  // Helper function to get user initials
  const normalizedAthlete = normalizeAthleteData(athlete);
  const getUserInitials = (
    firstName: string | null,
    username: string | null
  ): string => {
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return "A";
  };

  // Helper function to format location
  const formatLocation = (
    city: string | null,
    state: string | null,
    country: string | null
  ): string => {
    const locationParts = [city, state, country].filter(Boolean);
    return locationParts.length > 0
      ? locationParts.join(", ")
      : "Location not specified";
  };

  // Helper function to get role badge color
  const getRoleBadgeVariant = (
    role: string | null
  ): "default" | "secondary" | "destructive" | "outline" => {
    // ✅ FIX: Add null check
    if (!role) {
      return "outline";
    }

    switch (role.toLowerCase()) {
      case "athlete":
        return "default";
      case "coach":
        return "secondary";
      case "admin":
        return "destructive";
      default:
        return "outline";
    }
  };

  // ✅ FIX: Helper function to get rank badge color with null safety
  const getRankBadgeVariant = (
    rank: string | null
  ): "default" | "secondary" | "destructive" | "outline" => {
    // ✅ FIX: Add null/undefined check
    if (!rank) {
      return "outline";
    }

    const rankColors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PAWN: "outline",
      KNIGHT: "secondary",
      BISHOP: "default",
      ROOK: "secondary",
      QUEEN: "destructive",
      KING: "destructive",
    };
    return rankColors[rank.toUpperCase()] || "outline";
  };

  // ✅ FIX: Safe display function
  const safeDisplayValue = (
    value: string | null,
    fallback: string = "Not specified"
  ): string => {
    return value || fallback;
  };

  return (
    <Card
      className={`w-full border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Athlete Stats Update
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <Avatar className="h-16 w-16 border-2 border-indigo-200">
              <AvatarImage
                src={normalizedAthlete.profileImageUrl || undefined}
                alt={`${normalizedAthlete.firstName || "Athlete"}'s profile`}
              />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-semibold">
                {getUserInitials(
                  normalizedAthlete.firstName,
                  normalizedAthlete.username
                )}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Athlete Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-2xl font-bold text-gray-900 truncate">
                {safeDisplayValue(
                  normalizedAthlete.firstName,
                  "Unknown Athlete"
                )}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={getRoleBadgeVariant(normalizedAthlete.role)}
                  className="flex items-center"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {safeDisplayValue(normalizedAthlete.role, "User")}
                </Badge>
                <Badge
                  variant={getRankBadgeVariant(normalizedAthlete.rank)}
                  className="flex items-center"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {safeDisplayValue(normalizedAthlete.rank, "Unranked")}
                </Badge>
              </div>
            </div>
            {normalizedAthlete.username && (
              <p className="text-sm text-gray-600 mb-2">
                @{normalizedAthlete.username}
              </p>
            )}
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Primary Sport */}
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-500">Primary Sport</p>
                  <p className="text-sm font-medium text-gray-900">
                    {safeDisplayValue(normalizedAthlete.primarySport)}
                  </p>
                </div>
              </div>

              {/* Class */}
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="text-sm font-medium text-gray-900">
                    Class {safeDisplayValue(normalizedAthlete.class, "N/A")}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formatLocation(
                      normalizedAthlete.city,
                      normalizedAthlete.state,
                      normalizedAthlete.country
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* Verification Status */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-green-800">
                  OTP Verified • Ready for Stats Update
                </p>
              </div>
            </div>
            {showStatsInfo && (lastUpdatedBy || lastUpdatedAt) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm font-medium text-blue-800">
                    Stats Information
                  </p>
                </div>
                <div className="mt-2 text-xs text-blue-700 space-y-1">
                  {lastUpdatedByName && (
                    <p>Last updated by: {lastUpdatedByName}</p>
                  )}
                  {lastUpdatedAt && (
                    <p>Updated: {new Date(lastUpdatedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
