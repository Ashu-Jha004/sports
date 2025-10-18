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

interface AthleteHeaderProps {
  athlete: VerifiedUser;
  className?: string;
}

export const AthleteHeader: React.FC<AthleteHeaderProps> = ({
  athlete,
  className = "",
}) => {
  // Helper function to get user initials
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
                src={athlete.profileImageUrl || undefined}
                alt={`${athlete.firstName || "Athlete"}'s profile`}
              />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-semibold">
                {getUserInitials(athlete.firstName, athlete.username)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Athlete Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-2xl font-bold text-gray-900 truncate">
                {safeDisplayValue(athlete.firstName, "Unknown Athlete")}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={getRoleBadgeVariant(athlete.role)}
                  className="flex items-center"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {safeDisplayValue(athlete.role, "User")}
                </Badge>
                <Badge
                  variant={getRankBadgeVariant(athlete.rank)}
                  className="flex items-center"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {safeDisplayValue(athlete.rank, "Unranked")}
                </Badge>
              </div>
            </div>

            {athlete.username && (
              <p className="text-sm text-gray-600 mb-2">@{athlete.username}</p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Primary Sport */}
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-500">Primary Sport</p>
                  <p className="text-sm font-medium text-gray-900">
                    {safeDisplayValue(athlete.primarySport)}
                  </p>
                </div>
              </div>

              {/* Class */}
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="text-sm font-medium text-gray-900">
                    Class {safeDisplayValue(athlete.class, "N/A")}
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
                      athlete.city,
                      athlete.state,
                      athlete.country
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
