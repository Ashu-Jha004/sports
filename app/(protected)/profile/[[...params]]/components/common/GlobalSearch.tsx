"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchUser {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  PrimarySport: string | null;
  Rank: string | null;
  Class: string | null;
  city: string | null;
  country: string | null;
  role: string;
  profile: {
    bio: string | null;
  } | null;
}

interface SearchResponse {
  success: boolean;
  data?: SearchUser[];
  error?: string;
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  showIcon?: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className = "",
  placeholder = "Search athletes...",
  showIcon = true,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Search function
  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=8`
      );
      const data: SearchResponse = await response.json();

      if (data.success && data.data) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [debouncedQuery, searchUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : -1
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > -1 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleUserSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, results, selectedIndex]
  );

  // Handle user selection
  const handleUserSelect = useCallback(
    (user: SearchUser) => {
      setQuery("");
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);

      // Navigate to user profile
      if (user.username) {
        router.push(`/profile/${user.username}`);
      }
    },
    [router]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

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

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        {showIcon && (
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query && results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full py-3 px-4 ${showIcon ? "pl-10" : ""} ${
            query ? "pr-10" : ""
          } border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
        />

        {/* Clear Button */}
        {query && (
          <button title="Clear search"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Searching...</span>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No athletes found for "{query}"</p>
              <p className="text-sm">Try searching by name or username</p>
            </div>
          )}

          {/* Search Results */}
          {results.map((user, index) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                selectedIndex === index ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username}
                    </p>

                    {/* Rank & Class Badges */}
                    <div className="flex items-center space-x-1">
                      {user.Rank && (
                        <span className="text-sm" title={`Rank: ${user.Rank}`}>
                          {getRankEmoji(user.Rank)}
                        </span>
                      )}
                      {user.Class && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getClassColor(
                            user.Class
                          )}`}
                          title={`Class: ${user.Class}`}
                        >
                          {user.Class}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {user.username && <span>@{user.username}</span>}
                    {user.PrimarySport && (
                      <span className="flex items-center space-x-1">
                        <SparklesIcon className="w-3 h-3" />
                        <span>{user.PrimarySport}</span>
                      </span>
                    )}
                  </div>

                  {user.city && user.country && (
                    <p className="text-xs text-gray-500 mt-1">
                      {user.city}, {user.country}
                    </p>
                  )}
                </div>

                {/* Role Badge */}
                {user.role === "BUSINESS" && (
                  <div className="flex-shrink-0">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                      Business
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-2 text-center border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
