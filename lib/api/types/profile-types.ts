// lib/api/types/profile-types.ts

/**
 * =============================================================================
 * API PROFILE TYPES
 * =============================================================================
 */

export interface ProfileCreateData {
  city: string;
  country: string;
  state: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: "MALE" | "FEMALE";
  bio: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  primarySport: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
}

export interface ProfileCreationResult {
  userId: string;
  profileId: string;
  locationId?: string;
}

export interface UserWithProfile {
  id: string;
  clerkId: string;
  profile?: {
    id: string;
    bio?: string;
    avatarUrl?: string;
    locationId?: string;
  };
}
// lib/api/types/profile-types.ts (Additional types)

// ... Previous types ...

export interface ProfileUpdateData {
  city?: string;
  country?: string;
  state?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  bio?: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  primarySport?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
}

export interface ProfileUpdateResult {
  userId: string;
  profileId: string;
}

export interface ProfileDeletionResult {
  userId: string;
}
// lib/api/types/profile-types.ts (Additional current profile types)

// ... Previous types ...

export interface CurrentProfileData {
  // Basic information
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  bio?: string;
  avatarUrl?: string;

  // Athletic information
  primarySport: string;
  rank?: string;
  class?: string;
  role?: string;

  // Location information
  city: string;
  state: string;
  country: string;
  location?: {
    lat: number;
    lon: number;
    city: string;
    state: string;
    country: string;
  } | null;

  // Personal information
  dateOfBirth?: string;
  gender?: string;
  email?: string;

  // Social counts
  followersCount: number;
  followingCount: number;
  postsCount: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfileData
  extends Omit<CurrentProfileData, "dateOfBirth" | "email"> {
  // Relationship status
  isOwnProfile: boolean;
  friendshipStatus: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
  showDetailedStats: boolean;
}

export interface ProfileSummaryData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  primarySport: string;
  city: string;
  country: string;
  followersCount: number;
}
