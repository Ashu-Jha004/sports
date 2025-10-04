"use client";

import React, { useState } from "react";
import {
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  TrophyIcon,
  SparklesIcon,
  HeartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { ProfileData } from "../../types/profileDtata";
import { StatsTab } from "./ProfileTabComponents/StatsTab";

interface ProfileTabsProps {
  profileData: ProfileData;
}

type TabType = "about" | "stats" | "activity";

const ProfileTabs: React.FC<ProfileTabsProps> = ({ profileData }) => {
  const [activeTab, setActiveTab] = useState<TabType>("about");

  const tabs = [
    { id: "about" as TabType, label: "About", icon: UserIcon },
    { id: "stats" as TabType, label: "Stats", icon: ChartBarIcon },
    { id: "activity" as TabType, label: "Activity", icon: ClockIcon },
  ];

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate age
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // About Tab Content
  const AboutTab = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <IdentificationIcon className="w-5 h-5" />
          <span>Personal Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Full Name
              </label>
              <p className="text-gray-900">
                {profileData.firstName && profileData.lastName
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : "Not provided"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Username
              </label>
              <p className="text-gray-900">
                @{profileData.username || "Not set"}
              </p>
            </div>

            {profileData.isOwnProfile && (
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <p className="text-gray-900">
                  {profileData.email || "Not provided"}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Gender
              </label>
              <p className="text-gray-900 capitalize">
                {profileData.gender?.toLowerCase() || "Not specified"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Date of Birth
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">
                  {profileData.isOwnProfile
                    ? formatDate(profileData.dateOfBirth)
                    : profileData.dateOfBirth
                    ? `${calculateAge(profileData.dateOfBirth)} years old`
                    : "Not provided"}
                </p>
                {profileData.dateOfBirth && (
                  <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Role
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-gray-900 capitalize">
                  {profileData.role.toLowerCase()}
                </p>
                {profileData.role === "BUSINESS" && (
                  <SparklesIcon className="w-4 h-4 text-purple-500" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Member Since
              </label>
              <p className="text-gray-900">
                {formatDate(profileData.createdAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Last Updated
              </label>
              <p className="text-gray-900">
                {formatDate(profileData.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Athletic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrophyIcon className="w-5 h-5" />
          <span>Athletic Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Primary Sport
            </label>
            <p className="text-gray-900 font-medium">
              {profileData.primarySport || "Not specified"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Rank
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {profileData.rank === "KING"
                  ? "👑"
                  : profileData.rank === "QUEEN"
                  ? "👸"
                  : profileData.rank === "ROOK"
                  ? "🏰"
                  : profileData.rank === "BISHOP"
                  ? "⛪"
                  : profileData.rank === "KNIGHT"
                  ? "🐎"
                  : profileData.rank === "PAWN"
                  ? "♟️"
                  : "🏆"}
              </span>
              <p className="text-gray-900 font-medium">
                {profileData.rank || "Unranked"}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Class
            </label>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  profileData.class === "A"
                    ? "bg-red-100 text-red-700"
                    : profileData.class === "B"
                    ? "bg-orange-100 text-orange-700"
                    : profileData.class === "C"
                    ? "bg-yellow-100 text-yellow-700"
                    : profileData.class === "D"
                    ? "bg-blue-100 text-blue-700"
                    : profileData.class === "E"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {profileData.class
                  ? `Class ${profileData.class}`
                  : "Unclassified"}
              </span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {profileData.bio && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Bio
            </label>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 leading-relaxed">{profileData.bio}</p>
            </div>
          </div>
        )}
      </div>

      {/* Location Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5" />
          <span>Location</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                City
              </label>
              <p className="text-gray-900">
                {profileData.city || "Not specified"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                State
              </label>
              <p className="text-gray-900">
                {profileData.state || "Not specified"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Country
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-gray-900">
                  {profileData.country || "Not specified"}
                </p>
                {profileData.country && (
                  <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Coordinates (if available and own profile) */}
          {profileData.location && profileData.isOwnProfile && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Coordinates
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {profileData.location.lat}, {profileData.location.lon}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>Precise location is private</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  <StatsTab />;

  // Activity Tab Content (Placeholder)
  const ActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Recent Activity
        </h3>
        <p className="text-gray-600 mb-4">
          Posts, achievements, and recent activities will appear here.
        </p>

        {/* Placeholder Activity Items */}
        <div className="space-y-4 mt-8">
          {[
            {
              type: "join",
              text: "Joined the platform",
              time: formatDate(profileData.createdAt),
            },
            {
              type: "profile",
              text: "Updated profile information",
              time: formatDate(profileData.updatedAt),
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-200 flex items-center space-x-4"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {activity.type === "join" ? (
                  <HeartIcon className="w-4 h-4 text-blue-600" />
                ) : (
                  <UserIcon className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900">{activity.text}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "about" && <AboutTab />}
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "activity" && <ActivityTab />}
      </div>
    </div>
  );
};

export default ProfileTabs;
