// app/(protected)/profile/[[...params]]/components/StatsComponents/GuideList.tsx (COMPLETE ENHANCED VERSION)
import { useState, useMemo } from "react";
import { useSearchDebounce } from "@/hooks/useDebounce"; // Import your debounce hook

import {
  Search,
  MapPin,
  Trophy,
  Zap,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  User,
  Loader2,
} from "lucide-react";
import { useStatsStore } from "@/store/statsStore";

interface Guide {
  id: string;
  PrimarySports: string | null;
  Sports: string[];
  Experience: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  reviewNote: string | null;
  distance: number;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    Rank: string;
    Class: string;
  };
}

interface GuideListProps {
  guides: Guide[];
  loading: boolean;
  onRequestGuide: (guideId: string) => void;
  userLocation: { lat: number; lon: number; city?: string; state?: string };
}

type SortOption = "distance" | "experience" | "class" | "name";

export const GuideList = ({
  guides,
  loading,
  onRequestGuide,
  userLocation,
}: GuideListProps) => {
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [distanceRange, setDistanceRange] = useState<number>(50);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { debouncedSearchTerm, isSearching, shouldSearch } = useSearchDebounce(
    searchQuery,
    300,
    1
  ); // 300ms delay, minimum 1 character

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const sports = new Set<string>();
    const classes = new Set<string>();
    const ranks = new Set<string>();
    let maxDistance = 0;
    let maxExperience = 0;

    guides.forEach((guide) => {
      if (guide.PrimarySports) sports.add(guide.PrimarySports);
      guide.Sports?.forEach((sport) => sports.add(sport));
      classes.add(guide.user.Class);
      ranks.add(guide.user.Rank);
      maxDistance = Math.max(maxDistance, guide.distance);
      if (guide.Experience)
        maxExperience = Math.max(maxExperience, guide.Experience);
    });

    return {
      sports: Array.from(sports).sort(),
      classes: Array.from(classes).sort(),
      ranks: Array.from(ranks).sort(),
      maxDistance: Math.max(Math.ceil(maxDistance), 50),
      maxExperience: Math.max(maxExperience, 20),
    };
  }, [guides]);

  // Enhanced filtering and sorting logic
  // Enhanced filtering and sorting logic with debounced search
  const filteredAndSortedGuides = useMemo(() => {
    let filtered = guides.filter((guide) => {
      // Debounced text search - only search if shouldSearch is true
      const matchesSearch =
        !shouldSearch ||
        !debouncedSearchTerm.trim() ||
        [
          `${guide.user.firstName} ${guide.user.lastName}`,
          guide.city,
          guide.state,
          guide.country,
          guide.PrimarySports,
          ...(guide.Sports || []),
          guide.reviewNote,
        ].some((field) =>
          field
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase().trim())
        );

      // Other filters (not debounced for immediate feedback)
      const matchesSport =
        !selectedSport ||
        guide.PrimarySports === selectedSport ||
        guide.Sports?.includes(selectedSport);

      const matchesClass = !selectedClass || guide.user.Class === selectedClass;
      const matchesRank = !selectedRank || guide.user.Rank === selectedRank;
      const withinDistance = guide.distance <= distanceRange;
      const meetsExperience =
        !minExperience || (guide.Experience || 0) >= minExperience;

      return (
        matchesSearch &&
        matchesSport &&
        matchesClass &&
        matchesRank &&
        withinDistance &&
        meetsExperience
      );
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return a.distance - b.distance;
        case "experience":
          return (b.Experience || 0) - (a.Experience || 0);
        case "class":
          return a.user.Class.localeCompare(b.user.Class);
        case "name":
          const nameA = `${a.user.firstName || ""} ${
            a.user.lastName || ""
          }`.trim();
          const nameB = `${b.user.firstName || ""} ${
            b.user.lastName || ""
          }`.trim();
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    guides,
    debouncedSearchTerm,
    shouldSearch,
    selectedSport,
    selectedClass,
    selectedRank,
    distanceRange,
    minExperience,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSport("");
    setSelectedClass("");
    setSelectedRank("");
    setDistanceRange(filterOptions.maxDistance);
    setMinExperience(0);
    setSortBy("distance");
  };

  const hasActiveFilters =
    searchQuery.trim() ||
    selectedSport ||
    selectedClass ||
    selectedRank ||
    distanceRange < filterOptions.maxDistance ||
    minExperience > 0;

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search & Filter Header */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
        <div className="p-6 space-y-4">
          {/* Main Search Bar */}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, location, or sport..."
              value={searchQuery}
              onChange={(e) => {
                console.log("Search input changed:", e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       text-sm placeholder-gray-500 bg-white shadow-sm
                       transition-all duration-200"
            />

            {/* Search Loading Indicator */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Search Status Indicator */}
          {searchQuery.length > 0 && (
            <div className="text-xs text-gray-500">
              {isSearching ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Searching...
                </span>
              ) : shouldSearch ? (
                <span className="text-green-600">
                  ✓ Showing results for "{debouncedSearchTerm}"
                </span>
              ) : (
                <span className="text-amber-600">
                  Type more characters to search
                </span>
              )}
            </div>
          )}

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                title="sortby"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              >
                <option value="distance">Distance</option>
                <option value="experience">Experience</option>
                <option value="class">Class</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Sport Filter */}
            {filterOptions.sports.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Sport:
                </label>
                <select
                  title="select sports"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                >
                  <option value="">All Sports</option>
                  {filterOptions.sports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 
                       hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50
                       transition-colors duration-200 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Advanced
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showAdvancedFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Active Filters Count */}
            {hasActiveFilters && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 
                           text-sm rounded-md border border-blue-200"
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">
                  {
                    [
                      searchQuery.trim(),
                      selectedSport,
                      selectedClass,
                      selectedRank,
                      distanceRange < filterOptions.maxDistance
                        ? "distance"
                        : "",
                      minExperience > 0 ? "experience" : "",
                    ].filter(Boolean).length
                  }{" "}
                  active
                </span>
              </div>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Advanced Filters</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reset All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Distance Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Max Distance:{" "}
                    <span className="text-blue-600 font-semibold">
                      {distanceRange}km
                    </span>
                  </label>
                  <input
                    title="range"
                    type="range"
                    min="1"
                    max={filterOptions.maxDistance}
                    value={distanceRange}
                    onChange={(e) => setDistanceRange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                             range-slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1km</span>
                    <span>{filterOptions.maxDistance}km</span>
                  </div>
                </div>

                {/* Experience Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Min Experience:{" "}
                    <span className="text-blue-600 font-semibold">
                      {minExperience}+ years
                    </span>
                  </label>
                  <input
                    title="range2"
                    type="range"
                    min="0"
                    max={filterOptions.maxExperience}
                    value={minExperience}
                    onChange={(e) => setMinExperience(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                             range-slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 yrs</span>
                    <span>{filterOptions.maxExperience}+ yrs</span>
                  </div>
                </div>

                {/* Class Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Class
                  </label>
                  <select
                    title="selectclass"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Classes</option>
                    {filterOptions.classes.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rank Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Rank
                  </label>
                  <select
                    title="seleRank"
                    value={selectedRank}
                    onChange={(e) => setSelectedRank(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Ranks</option>
                    {filterOptions.ranks.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">
                {filteredAndSortedGuides.length}
              </span>{" "}
              guide{filteredAndSortedGuides.length !== 1 ? "s" : ""} found
              {userLocation.city && (
                <span className="text-gray-500"> near {userLocation.city}</span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline
                         transition-all duration-200"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Guide List */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
        {filteredAndSortedGuides.length === 0 ? (
          <EmptyResults
            searchQuery={searchQuery}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
          />
        ) : (
          <div className="p-6 space-y-4 pb-8">
            {filteredAndSortedGuides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onRequest={() => onRequestGuide(guide.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Guide Card Sub-Component
const GuideCard = ({
  guide,
  onRequest,
}: {
  guide: Guide;
  onRequest: () => void;
}) => {
  const { getGuideRequestStatus } = useStatsStore();
  const requestStatus = getGuideRequestStatus(guide.id);

  const getRankIcon = (rank: string) => {
    const icons = {
      KING: "👑",
      QUEEN: "♛",
      ROOK: "🏰",
      BISHOP: "⛪",
      KNIGHT: "🐴",
      PAWN: "♟️",
    };
    return icons[rank as keyof typeof icons] || "⭐";
  };

  const getClassColor = (cls: string) => {
    const colors = {
      A: "text-green-600 bg-green-50 border-green-200",
      B: "text-blue-600 bg-blue-50 border-blue-200",
      C: "text-yellow-600 bg-yellow-50 border-yellow-200",
      D: "text-orange-600 bg-orange-50 border-orange-200",
      E: "text-red-600 bg-red-50 border-red-200",
    };
    return (
      colors[cls as keyof typeof colors] ||
      "text-gray-600 bg-gray-50 border-gray-200"
    );
  };

  const getRequestButton = () => {
    if (!requestStatus) {
      // No existing request - show normal button
      return (
        <button
          onClick={onRequest}
          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                   text-white text-sm font-medium rounded-md transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   flex-shrink-0 group-hover:shadow-md"
        >
          Request
        </button>
      );
    }

    // Handle different request statuses
    switch (requestStatus.status) {
      case "PENDING":
        return (
          <div className="ml-4 flex-shrink-0">
            <div
              className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium 
                          rounded-md border border-yellow-200 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              Pending
            </div>
          </div>
        );

      case "ACCEPTED":
        return (
          <div className="ml-4 flex-shrink-0">
            <div
              className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium 
                          rounded-md border border-green-200 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Accepted
            </div>
          </div>
        );

      case "REJECTED":
        return (
          <button
            onClick={onRequest}
            className="ml-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700
                     text-sm font-medium rounded-md transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                     flex-shrink-0"
            title="Request was rejected - you can try again"
          >
            Try Again
          </button>
        );

      default:
        return (
          <button
            onClick={onRequest}
            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
                     text-sm font-medium rounded-md transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     flex-shrink-0"
          >
            Request
          </button>
        );
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 
                   transition-all duration-200 hover:shadow-md group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Guide Info */}
          <div className="flex gap-4 flex-1">
            {/* Avatar */}
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all duration-200">
              {guide.user.profileImageUrl ? (
                <img
                  src={guide.user.profileImageUrl}
                  alt={`${guide.user.firstName} ${guide.user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {guide.user.firstName} {guide.user.lastName}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium border ${getClassColor(
                      guide.user.Class
                    )}`}
                  >
                    Class {guide.user.Class}
                  </span>
                  <span className="text-lg" title={`Rank: ${guide.user.Rank}`}>
                    {getRankIcon(guide.user.Rank)}
                  </span>
                </div>
              </div>

              {/* Location & Distance */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {guide.city}, {guide.state}
                </span>
                <span className="mx-2">•</span>
                <span className="font-medium text-blue-600 flex-shrink-0">
                  {guide.distance.toFixed(1)}km away
                </span>
              </div>

              {/* Experience & Sports */}
              <div className="space-y-1">
                {guide.Experience && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{guide.Experience}+ years experience</span>
                  </div>
                )}

                {guide.PrimarySports && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Zap className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      Specializes in {guide.PrimarySports}
                    </span>
                  </div>
                )}

                {/* Additional Sports */}
                {guide.Sports && guide.Sports.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {guide.Sports.slice(0, 3).map((sport, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                      >
                        {sport}
                      </span>
                    ))}
                    {guide.Sports.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                        +{guide.Sports.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Review Note */}
              {guide.reviewNote && (
                <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-sm text-green-800 flex items-start gap-1">
                    <span className="text-green-600 flex-shrink-0">✓</span>
                    {guide.reviewNote}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Request Button */}
          {getRequestButton()}
        </div>
        {requestStatus && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              {requestStatus.status === "PENDING" && (
                <span className="text-yellow-600">
                  Request sent{" "}
                  {new Date(requestStatus.createdAt).toLocaleDateString()}
                </span>
              )}
              {requestStatus.status === "ACCEPTED" && (
                <span className="text-green-600">
                  Request accepted{" "}
                  {new Date(requestStatus.updatedAt).toLocaleDateString()}
                </span>
              )}
              {requestStatus.status === "REJECTED" && (
                <span className="text-red-600">
                  Request rejected{" "}
                  {new Date(requestStatus.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="p-6 space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse flex-shrink-0" />
        </div>
      </div>
    ))}
  </div>
);

// Empty Results Component
const EmptyResults = ({
  searchQuery,
  hasActiveFilters,
  onClearFilters,
}: {
  searchQuery: string;
  hasActiveFilters: string | boolean;
  onClearFilters: () => void;
}) => (
  <div className="p-12 text-center h-full flex flex-col items-center justify-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Search className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No guides found</h3>
    <p className="text-gray-600 mb-6 max-w-md">
      {hasActiveFilters
        ? "No guides match your current search criteria. Try adjusting your filters to see more results."
        : "No verified guides are available in your area at the moment."}
    </p>
    {hasActiveFilters && (
      <div className="space-y-3">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm 
                   font-medium rounded-md transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Clear all filters
        </button>
        <p className="text-sm text-gray-500">
          Or try searching with different keywords
        </p>
      </div>
    )}
  </div>
);
