"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ProfileHeader from "./components/profile/ProfileHeader";
import ProfileTabs from "./components/profile/ProfileTabs";
import EditProfileModal from "../../profile/[[...params]]/components/profile/EditProfileModal";
import FollowersModal from "./components/profile/FollowersModal";
import { ProfileData } from "./types/profileDtata";
import ErrorPage from "@/app/error/page";
interface ProfileResponse {
  success: boolean;
  data?: ProfileData;
  error?: string;
}

export default function ProfilePage({
  params,
}: {
  params: { params?: string | any };
}) {
  const Params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Determine if this is own profile or someone else's
  const username = Params?.params?.[0] as string;
  const isOwnProfile = !username; // /profile = own profile, /profile/username = other's profile
  const [followersModalState, setFollowersModalState] = useState<{
    isOpen: boolean;
    type: "followers" | "following";
    count: number;
  }>({
    isOpen: false,
    type: "followers",
    count: 0,
  });
  const handleOpenFollowersModal = (
    type: "followers" | "following",
    count: number
  ) => {
    console.log("🔍 Opening followers modal:", { type, count }); // NEW: Debug log
    setFollowersModalState({
      isOpen: true,
      type,
      count,
    });
    console.log("🔍 Modal state updated"); // NEW: Debug log
  };
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded || !user) return;

      setIsLoading(true);
      setError(null);

      try {
        let url: string;

        if (isOwnProfile) {
          // Fetch own profile - we need to get the current user's username first
          console.log("📋 Fetching own profile...");

          // First get current user data to find username
          const currentUserResponse = await fetch(
            "/api/users/search?q=" + encodeURIComponent(user.firstName || ""),
            {
              method: "GET",
              cache: "force-cache",
              next: { revalidate: 4600 },
            }
          );

          const currentUserData = await currentUserResponse.json();

          // Find current user by matching clerkId (we'll need a separate endpoint for this)
          // For now, let's use a different approach - get profile by current user
          url = `/api/profile/current`; // We'll need to create this endpoint
        } else {
          // Fetch other user's profile
          console.log(`👤 Fetching profile for username: ${username}`);
          url = `/api/users/${username}`;
        }

        const response = await fetch(url);
        const data: ProfileResponse = await response.json();

        if (data.success && data.data) {
          setProfileData(data.data);
        } else {
          throw new Error(data.error || "Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, isOwnProfile, user, isLoaded]);

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  // Handle profile update
  const handleProfileUpdate = (updatedData: any) => {
    // Refetch profile data
    if (profileData) {
      // Update local state with new data
      setProfileData({
        ...profileData,
        ...updatedData,
      });
    }
    setIsEditModalOpen(false);
  };
  const handleCloseFollowersModal = () => {
    setFollowersModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Search */}

        {/* Loading Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Profile Header Skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex space-x-8 border-b border-gray-200 mb-6">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    <ErrorPage />;
  }

  // No profile data
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">Profile data not available</p>
          </div>
        </main>
      </div>
    );
  }

  // Main profile content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <ProfileHeader
          profileData={profileData}
          onEditProfile={handleEditProfile}
          onOpenFollowersModal={handleOpenFollowersModal} // ADD: This line
        />

        {/* Profile Tabs */}
        <ProfileTabs profileData={profileData} />
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && profileData.isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleProfileUpdate}
          currentData={profileData}
        />
      )}
      {followersModalState.isOpen && profileData && (
        <FollowersModal
          isOpen={followersModalState.isOpen}
          onClose={handleCloseFollowersModal}
          username={profileData.username}
          displayName={
            profileData.firstName && profileData.lastName
              ? `${profileData.firstName} ${profileData.lastName}`
              : profileData.username
          }
          type={followersModalState.type}
          initialCount={followersModalState.count}
        />
      )}
    </div>
  );
}
