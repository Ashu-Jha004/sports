"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserCircleIcon,
  PencilIcon,
  MapPinIcon,
  CalendarIcon,
  TrophyIcon,
  UserPlusIcon,
  UserMinusIcon,
  SparklesIcon,
  GlobeAltIcon,
  UsersIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface ProfileData {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  avatarUrl: string | null;
  primarySport: string | null;
  rank: string | null;
  class: string | null;
  role: string;
  city: string | null;
  state: string | null;
  country: string | null;
  location: {
    lat: number | null;
    lon: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  dateOfBirth: string | null;
  gender: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  isOwnProfile: boolean;

  // NEW: Social data
  followersCount: number;
  followingCount: number;
  postsCount: number;
  friendshipStatus: "none" | "following" | "follower" | "mutual" | "self";
  isFollowing: boolean;
  isFollowedBy: boolean;
}

interface ProfileHeaderProps {
  profileData: ProfileData;
  onEditProfile: () => void;
  onOpenFollowersModal: (
    type: "followers" | "following",
    count: number
  ) => void; // NEW: Add this prop
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  onEditProfile,
  onOpenFollowersModal, // NEW: Add this prop
}) => {
  const [friendStatus, setFriendStatus] = useState<
    "none" | "following" | "follower" | "mutual"
  >(
    profileData.friendshipStatus === "self"
      ? "none"
      : profileData.friendshipStatus
  );
  const [isUpdatingFriend, setIsUpdatingFriend] = useState(false);
  const [localCounts, setLocalCounts] = useState({
    followersCount: profileData.followersCount,
    followingCount: profileData.followingCount,
    postsCount: profileData.postsCount,
  });

  // Update local state when profileData changes
  useEffect(() => {
    if (profileData.friendshipStatus !== "self") {
      setFriendStatus(profileData.friendshipStatus);
    }
    setLocalCounts({
      followersCount: profileData.followersCount,
      followingCount: profileData.followingCount,
      postsCount: profileData.postsCount,
    });
  }, [profileData]);

  // Get display name
  const displayName =
    profileData.firstName && profileData.lastName
      ? `${profileData.firstName} ${profileData.lastName}`
      : profileData.username || "Unknown User";

  // Get profile image
  const profileImage = profileData.avatarUrl;

  // Get rank emoji and color
  const getRankInfo = (rank: string | null) => {
    switch (rank) {
      case "KING":
        return {
          emoji: "👑",
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        };
      case "QUEEN":
        return {
          emoji: "👸",
          color: "text-purple-600 bg-purple-50 border-purple-200",
        };
      case "ROOK":
        return {
          emoji: "🏰",
          color: "text-blue-600 bg-blue-50 border-blue-200",
        };
      case "BISHOP":
        return {
          emoji: "⛪",
          color: "text-indigo-600 bg-indigo-50 border-indigo-200",
        };
      case "KNIGHT":
        return {
          emoji: "🐎",
          color: "text-green-600 bg-green-50 border-green-200",
        };
      case "PAWN":
        return {
          emoji: "♟️",
          color: "text-gray-600 bg-gray-50 border-gray-200",
        };
      default:
        return {
          emoji: "🏆",
          color: "text-gray-600 bg-gray-50 border-gray-200",
        };
    }
  };

  // Get class info
  const getClassInfo = (classLevel: string | null) => {
    switch (classLevel) {
      case "A":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          label: "Elite",
        };
      case "B":
        return {
          color: "text-orange-600 bg-orange-50 border-orange-200",
          label: "Advanced",
        };
      case "C":
        return {
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
          label: "Intermediate",
        };
      case "D":
        return {
          color: "text-blue-600 bg-blue-50 border-blue-200",
          label: "Beginner",
        };
      case "E":
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          label: "Novice",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          label: "Unranked",
        };
    }
  };

  // Get sport emoji
  const getSportEmoji = (sport: string | null) => {
    if (!sport) return "🏆";
    switch (sport.toLowerCase()) {
      case "football":
        return "🏈";
      case "soccer":
        return "⚽";
      case "basketball":
        return "🏀";
      case "tennis":
        return "🎾";
      case "swimming":
        return "🏊";
      case "running":
        return "🏃";
      case "cycling":
        return "🚴";
      case "golf":
        return "⛳";
      case "baseball":
        return "⚾";
      case "volleyball":
        return "🏐";
      default:
        return "🏆";
    }
  };

  // Calculate member since
  const getMemberSince = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Handle friend action
  const handleFriendAction = useCallback(async () => {
    if (!profileData.username || profileData.isOwnProfile) return;

    setIsUpdatingFriend(true);

    try {
      const method =
        friendStatus === "following" || friendStatus === "mutual"
          ? "DELETE"
          : "POST";
      const response = await fetch(
        `/api/users/${profileData.username}/friend`,
        {
          method,
        }
      );

      const data = await response.json();

      if (data.success) {
        if (method === "POST") {
          // User followed - update local state
          setFriendStatus(profileData.isFollowedBy ? "mutual" : "following");
          setLocalCounts((prev) => ({
            ...prev,
            followersCount:
              prev.followersCount + (profileData.isOwnProfile ? 0 : 1),
          }));
        } else {
          // User unfollowed - update local state
          setFriendStatus(profileData.isFollowedBy ? "follower" : "none");
          setLocalCounts((prev) => ({
            ...prev,
            followersCount: Math.max(
              0,
              prev.followersCount - (profileData.isOwnProfile ? 0 : 1)
            ),
          }));
        }

        console.log(
          `✅ Friend action completed: ${
            method === "POST" ? "followed" : "unfollowed"
          }`
        );
      } else {
        console.error("Friend action failed:", data.error);
        // TODO: Show toast notification
      }
    } catch (error) {
      console.error("Friend action error:", error);
      // TODO: Show toast notification
    } finally {
      setIsUpdatingFriend(false);
    }
  }, [
    profileData.username,
    profileData.isOwnProfile,
    profileData.isFollowedBy,
    friendStatus,
  ]);

  // Get button text and style
  const getFollowButtonInfo = () => {
    if (isUpdatingFriend) {
      return {
        text: "Updating...",
        icon: null,
        className: "bg-gray-300 text-gray-500 cursor-not-allowed",
      };
    }

    switch (friendStatus) {
      case "following":
        return {
          text: "Following",
          icon: <UserMinusIcon className="w-4 h-4" />,
          className:
            "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200",
        };
      case "mutual":
        return {
          text: "Friends",
          icon: <HeartIcon className="w-4 h-4" />,
          className:
            "bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200",
        };
      case "follower":
        return {
          text: "Follow Back",
          icon: <UserPlusIcon className="w-4 h-4" />,
          className: "bg-blue-600 text-white hover:bg-blue-700",
        };
      default:
        return {
          text: "Follow",
          icon: <UserPlusIcon className="w-4 h-4" />,
          className: "bg-blue-600 text-white hover:bg-blue-700",
        };
    }
  };

  const rankInfo = getRankInfo(profileData.rank);
  const classInfo = getClassInfo(profileData.class);
  const followButtonInfo = getFollowButtonInfo();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      {/* Cover Section */}
      <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
        <div className="absolute inset-0 bg-black opacity-20"></div>
      </div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Profile Image */}
        <div className="flex justify-center sm:justify-start -mt-16 mb-4">
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt={displayName}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                <UserCircleIcon className="w-20 h-20 text-gray-400" />
              </div>
            )}

            {/* Online Status Indicator (placeholder for future) */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
          {/* User Info */}
          <div className="text-center sm:text-left">
            {/* Name and Username */}
            <div className="mb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {displayName}
              </h1>
              {profileData.username && (
                <p className="text-gray-600">@{profileData.username}</p>
              )}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-4">
              {/* Rank Badge */}
              {profileData.rank && (
                <div
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${rankInfo.color}`}
                >
                  <span>{rankInfo.emoji}</span>
                  <span>{profileData.rank}</span>
                </div>
              )}

              {/* Class Badge */}
              {profileData.class && (
                <div
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${classInfo.color}`}
                >
                  <span>Class {profileData.class}</span>
                  <span className="text-xs">({classInfo.label})</span>
                </div>
              )}

              {/* Role Badge */}
              {profileData.role === "BUSINESS" && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium">
                  <SparklesIcon className="w-3 h-3" />
                  <span>Business</span>
                </div>
              )}

              {/* Verified Badge (placeholder for future) */}
              <div className="flex items-center space-x-1 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium">
                <CheckBadgeIcon className="w-3 h-3" />
                <span>Verified</span>
              </div>

              {/* Mutual Friends Badge */}
              {friendStatus === "mutual" && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full border border-pink-200 bg-pink-50 text-pink-700 text-sm font-medium">
                  <HeartIcon className="w-3 h-3" />
                  <span>Friends</span>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm text-gray-600 mb-4">
              {/* Primary Sport */}
              {profileData.primarySport && (
                <div className="flex items-center space-x-1">
                  <span>{getSportEmoji(profileData.primarySport)}</span>
                  <span>{profileData.primarySport}</span>
                </div>
              )}

              {/* Location */}
              {(profileData.city || profileData.country) && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>
                    {[profileData.city, profileData.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Joined {getMemberSince(profileData.createdAt)}</span>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="max-w-2xl mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {profileData.bio}
                </p>
              </div>
            )}

            {/* Stats with Real Data */}
            {/* UPDATED: Stats with Modal Triggers */}
            <div className="flex justify-center sm:justify-start space-x-8 mt-4 pt-4 border-t border-gray-100">
              {/* Following Count - Clickable */}
              <button
                onClick={() => {
                  console.log("🔍 Following button clicked"); // Debug log
                  onOpenFollowersModal("following", localCounts.followingCount);
                }}
                className="text-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <div className="text-xl font-bold text-gray-900">
                  {profileData.followingCount}
                </div>
                <div className="text-sm text-gray-600">Following</div>
              </button>

              {/* Followers Count - Clickable */}
              <button
                onClick={() => {
                  console.log("🔍 Followers button clicked"); // Debug log
                  onOpenFollowersModal("followers", localCounts.followersCount);
                }}
                className="text-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <div className="text-xl font-bold text-gray-900">
                  {profileData.followersCount}
                </div>
                <div className="text-sm text-gray-600">Followers</div>
              </button>

              {/* Posts Count - Not clickable (for now) */}
              <div className="text-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <div className="text-xl font-bold text-gray-900">
                  {localCounts.postsCount}
                </div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center sm:justify-end">
            {profileData.isOwnProfile ? (
              // Edit Profile Button (Own Profile)
              <button
                onClick={onEditProfile}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              // Friend Actions (Other's Profile)
              <div className="flex space-x-3">
                <button
                  onClick={handleFriendAction}
                  disabled={isUpdatingFriend}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg ${followButtonInfo.className}`}
                >
                  {isUpdatingFriend ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    followButtonInfo.icon
                  )}
                  <span>{followButtonInfo.text}</span>
                </button>

                {/* Message Button (placeholder for future) */}
                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg border border-gray-300">
                  <span>Message</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
