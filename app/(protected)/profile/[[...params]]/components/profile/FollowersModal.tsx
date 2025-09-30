"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

interface UserItem {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  profileImageUrl: string | null;
  bio: string | null;
  primarySport: string | null;
  rank: string | null;
  class: string | null;
  role: string;
  city: string | null;
  country: string | null;
  location: string | null;
  followedAt: string;
  followersCount: number;
  followingCount: number;
  isCurrentUser: boolean;
  isFollowingCurrentUser?: boolean;
  isFollowedByCurrentUser?: boolean;
  showPrivateInfo: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
  type: "followers" | "following";
  initialCount: number;
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  username,
  displayName,
  type,
  initialCount,
}) => {
  const router = useRouter();

  // State management
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch users data
  const fetchUsers = useCallback(
    async (page: number = 1, search: string = "") => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = type === "followers" ? "followers" : "following";
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });

        if (search.trim()) {
          params.append("search", search.trim());
        }

        const response = await fetch(
          `/api/users/${username}/${endpoint}?${params}`
        );
        const data = await response.json();

        if (data.success) {
          setUsers(data.data[type]);
          setPagination(data.data.pagination);
          setCurrentPage(page);
        } else {
          throw new Error(data.error || `Failed to fetch ${type}`);
        }
      } catch (err) {
        console.error(`Fetch ${type} error:`, err);
        setError(err instanceof Error ? err.message : `Failed to load ${type}`);
        setUsers([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    },
    [username, type]
  );

  // Initial load and search effect
  useEffect(() => {
    if (isOpen) {
      fetchUsers(1, debouncedSearchQuery);
    }
  }, [isOpen, debouncedSearchQuery, fetchUsers]);

  // Page change handler
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
        fetchUsers(newPage, debouncedSearchQuery);
      }
    },
    [fetchUsers, debouncedSearchQuery, pagination]
  );

  // Handle user profile click
  const handleUserClick = useCallback(
    (userUsername: string) => {
      onClose();
      router.push(`/profile/${userUsername}`);
    },
    [onClose, router]
  );

  // Handle follow/unfollow action
  const handleFollowAction = useCallback(
    async (
      userId: string,
      userUsername: string,
      isCurrentlyFollowing: boolean
    ) => {
      setUpdatingUsers((prev) => new Set(prev).add(userId));

      try {
        const method = isCurrentlyFollowing ? "DELETE" : "POST";
        const response = await fetch(`/api/users/${userUsername}/friend`, {
          method,
        });
        const data = await response.json();

        if (data.success) {
          // Update local state
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    isFollowedByCurrentUser: !isCurrentlyFollowing,
                    followersCount: isCurrentlyFollowing
                      ? Math.max(0, user.followersCount - 1)
                      : user.followersCount + 1,
                  }
                : user
            )
          );

          console.log(
            `✅ ${
              isCurrentlyFollowing ? "Unfollowed" : "Followed"
            } user: ${userUsername}`
          );
        } else {
          throw new Error(data.error || "Follow action failed");
        }
      } catch (error) {
        console.error("Follow action error:", error);
        // TODO: Show toast notification
      } finally {
        setUpdatingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    []
  );

  // Get rank emoji
  const getRankEmoji = (rank: string | null) => {
    switch (rank) {
      case "KING":
        return "👑";
      case "QUEEN":
        return "👸";
      case "ROOK":
        return "🏰";
      case "BISHOP":
        return "⛪";
      case "KNIGHT":
        return "🐎";
      case "PAWN":
        return "♟️";
      default:
        return "🏆";
    }
  };

  // Get class color
  const getClassColor = (classLevel: string | null) => {
    switch (classLevel) {
      case "A":
        return "text-red-600 bg-red-50";
      case "B":
        return "text-orange-600 bg-orange-50";
      case "C":
        return "text-yellow-600 bg-yellow-50";
      case "D":
        return "text-blue-600 bg-blue-50";
      case "E":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Close modal effect
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUsers([]);
      setPagination(null);
      setSearchQuery("");
      setCurrentPage(1);
      setError(null);
      setUpdatingUsers(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {displayName}'s{" "}
                {type === "followers" ? "Followers" : "Following"}
              </h2>
              <p className="text-sm text-gray-600">
                {pagination ? pagination.totalCount : initialCount}{" "}
                {type === "followers" ? "followers" : "following"}
              </p>
            </div>
            <button
              title="Close modal"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${type}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              // Loading State
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading {type}...</p>
              </div>
            ) : error ? (
              // Error State
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchUsers(currentPage, debouncedSearchQuery)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : users.length === 0 ? (
              // Empty State
              <div className="p-8 text-center">
                <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery
                    ? `No ${type} found matching "${searchQuery}"`
                    : `No ${type} yet`}
                </p>
              </div>
            ) : (
              // Users List
              <div className="divide-y divide-gray-200">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Profile Image */}
                      <button
                        onClick={() => handleUserClick(user.username)}
                        className="flex-shrink-0"
                      >
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserCircleIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </button>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => handleUserClick(user.username)}
                          className="text-left w-full"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {user.displayName}
                            </p>

                            {/* Badges */}
                            <div className="flex items-center space-x-1">
                              {user.rank && (
                                <span
                                  className="text-sm"
                                  title={`Rank: ${user.rank}`}
                                >
                                  {getRankEmoji(user.rank)}
                                </span>
                              )}
                              {user.class && (
                                <span
                                  className={`px-1.5 py-0.5 text-xs font-medium rounded ${getClassColor(
                                    user.class
                                  )}`}
                                  title={`Class: ${user.class}`}
                                >
                                  {user.class}
                                </span>
                              )}
                              {user.role === "BUSINESS" && (
                                <SparklesIcon className="w-3 h-3 text-purple-500" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>@{user.username}</span>
                            {user.primarySport && (
                              <span>{user.primarySport}</span>
                            )}
                            {user.location && <span>{user.location}</span>}
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{user.followersCount} followers</span>
                            <span>{user.followingCount} following</span>
                          </div>
                        </button>
                      </div>

                      {/* Action Button */}
                      {!user.isCurrentUser && (
                        <div className="flex-shrink-0">
                          {type === "followers" ? (
                            // For followers list, show follow/unfollow based on if we follow them back
                            <button
                              onClick={() =>
                                handleFollowAction(
                                  user.id,
                                  user.username,
                                  user.isFollowedByCurrentUser || false
                                )
                              }
                              disabled={updatingUsers.has(user.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                updatingUsers.has(user.id)
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : user.isFollowedByCurrentUser
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {updatingUsers.has(user.id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : user.isFollowedByCurrentUser ? (
                                <>
                                  <UserMinusIcon className="w-4 h-4 inline mr-1" />
                                  Following
                                </>
                              ) : (
                                <>
                                  <UserPlusIcon className="w-4 h-4 inline mr-1" />
                                  Follow
                                </>
                              )}
                            </button>
                          ) : (
                            // For following list, show unfollow since we're already following them
                            <button
                              onClick={() =>
                                handleFollowAction(user.id, user.username, true)
                              }
                              disabled={updatingUsers.has(user.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                updatingUsers.has(user.id)
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {updatingUsers.has(user.id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <>
                                  <UserMinusIcon className="w-4 h-4 inline mr-1" />
                                  Following
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev || isLoading}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext || isLoading}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
