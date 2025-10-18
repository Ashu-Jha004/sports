import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  MapPin,
  Trophy,
  Award,
  Crown,
  Shield,
  Calendar,
} from "lucide-react";
import {
  UserDetailsDisplayProps,
  VerifiedUser,
} from "../../../../types/otpVerification";

export const UserDetailsDisplay: React.FC<UserDetailsDisplayProps> = ({
  user,
  className = "",
}) => {
  console.log("👤 Rendering user details for:", user.firstName);

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
    return "U";
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
      : "Not specified";
  };

  // Helper function to get role badge color
  const getRoleBadgeVariant = (
    role: string
  ): "default" | "secondary" | "destructive" | "outline" => {
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

  // Helper function to get rank badge color
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

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        {/* Header Section - Avatar and Basic Info */}
        <div className="flex items-start space-x-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-indigo-100">
            <AvatarImage
              src={user.profileImageUrl || undefined}
              alt={`${user.firstName || "User"}'s profile`}
            />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-semibold">
              {getUserInitials(user.firstName, user.username)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900 truncate">
                {user.firstName || "Unknown User"}
              </h3>
              <Badge
                variant={getRoleBadgeVariant(user.role)}
                className="flex items-center"
              >
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </Badge>
            </div>

            {user.username && (
              <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
            )}

            <div className="flex items-center space-x-2">
              <Badge
                variant={getRankBadgeVariant(user.rank)}
                className="flex items-center"
              >
                <Crown className="w-3 h-3 mr-1" />
                {user.rank}
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <Award className="w-3 h-3 mr-1" />
                Class {user.class}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Sport */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <Trophy className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Primary Sport
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.primarySport || "Not specified"}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Location
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {formatLocation(user.city, user.state, user.country)}
              </p>
            </div>
          </div>

          {/* Gender */}
          {user.gender && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Gender
                </p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.gender}
                </p>
              </div>
            </div>
          )}

          {/* Verification Date */}
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                Verified On
              </p>
              <p className="text-sm font-medium text-green-800 truncate">
                {new Date(user.verifiedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm font-medium text-green-800">
              OTP Verified Successfully - Ready for Stats Update
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
