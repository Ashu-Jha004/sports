// lib/api/utils/profile-formatters.ts

import type { CurrentProfileData } from "@/lib/api/types/profile-types";

/**
 * =============================================================================
 * PROFILE DATA FORMATTERS
 * =============================================================================
 */

/**
 * Formats user data for current profile response
 */
export const formatCurrentProfileData = (userData: any): CurrentProfileData => {
  return {
    // Basic user information
    id: userData.id,
    username: userData.username,
    firstName: userData.firstName,
    lastName: userData.lastName,
    profileImageUrl: userData.profileImageUrl,
    bio: userData.profile?.bio,
    avatarUrl: userData.profile?.avatarUrl,

    // Athletic information
    primarySport: userData.PrimarySport,
    rank: userData.Rank,
    class: userData.Class,
    role: userData.role,

    // Location information
    city: userData.city,
    state: userData.state,
    country: userData.country,
    location: formatLocationData(userData.profile?.location),

    // Personal information (full access for own profile)
    dateOfBirth: userData.dateOfBirth?.toISOString(),
    gender: userData.gender,
    email: userData.email,

    // Social counts with fallbacks
    followersCount:
      userData.counters?.followersCount ?? userData._count.followers,
    followingCount:
      userData.counters?.followingCount ?? userData._count.following,
    postsCount: userData.counters?.postsCount ?? 0,

    // Metadata
    createdAt: userData.createdAt.toISOString(),
    updatedAt: userData.updatedAt.toISOString(),
  };
};

/**
 * Formats location data for response
 */
export const formatLocationData = (location: any) => {
  if (!location) return null;

  return {
    lat: location.lat,
    lon: location.lon,
    city: location.city,
    state: location.state,
    country: location.country,
  };
};

/**
 * Formats public profile data (for other users)
 */
export const formatPublicProfileData = (
  userData: any,
  viewerRelationship?: any
) => {
  return {
    // Basic public information
    id: userData.id,
    username: userData.username,
    firstName: userData.firstName,
    lastName: userData.lastName,
    profileImageUrl: userData.profileImageUrl,
    bio: userData.profile?.bio,
    avatarUrl: userData.profile?.avatarUrl,

    // Athletic information
    primarySport: userData.PrimarySport,
    rank: userData.Rank,
    class: userData.Class,

    // Limited location information
    city: userData.city,
    state: userData.state,
    country: userData.country,

    // Public counts
    followersCount:
      userData.counters?.followersCount ?? userData._count.followers,
    followingCount:
      userData.counters?.followingCount ?? userData._count.following,
    postsCount: userData.counters?.postsCount ?? 0,

    // Relationship status
    isOwnProfile: false,
    friendshipStatus: viewerRelationship?.status || "none",
    isFollowing: viewerRelationship?.isFollowing || false,
    isFollowedBy: viewerRelationship?.isFollowedBy || false,
    showDetailedStats: false,

    // Public metadata
    createdAt: userData.createdAt.toISOString(),
  };
};

/**
 * Formats profile summary for listings
 */
export const formatProfileSummary = (userData: any) => {
  return {
    id: userData.id,
    username: userData.username,
    firstName: userData.firstName,
    lastName: userData.lastName,
    profileImageUrl: userData.profileImageUrl,
    primarySport: userData.PrimarySport,
    city: userData.city,
    country: userData.country,
    followersCount:
      userData.counters?.followersCount ?? userData._count?.followers ?? 0,
  };
};

/**
 * Gets display name from user data
 */
export const getDisplayName = (userData: any): string => {
  if (userData.firstName && userData.lastName) {
    return `${userData.firstName} ${userData.lastName}`;
  }
  return userData.username || "Anonymous User";
};

/**
 * Gets profile completion percentage
 */
export const getProfileCompletionPercentage = (userData: any): number => {
  const requiredFields = [
    "username",
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "bio",
    "PrimarySport",
    "city",
    "country",
  ];

  const completedFields = requiredFields.filter(
    (field) => userData[field] && userData[field].toString().trim() !== ""
  ).length;

  return Math.round((completedFields / requiredFields.length) * 100);
};
