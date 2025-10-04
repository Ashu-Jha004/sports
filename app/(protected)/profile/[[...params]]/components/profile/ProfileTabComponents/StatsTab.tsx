// app/(protected)/profile/[[...params]]/components/profile/ProfileTabComponents/StatsTab.tsx
import { useEffect } from "react";
import { ChartBarIcon } from "lucide-react";
import { useStatsStore } from "@/store/statsStore";
import { useLocation } from "../../StatsComponents/hooks/useLocation";
import { EmptyStatsState } from "../../StatsComponents/EmptyStatsState";
import { GuideDiscoveryModal } from "../../StatsComponents/GuideDiscoveryModal";
import { GuideList } from "../../StatsComponents/GuideList";
import { RequestGuideDialog } from "../../StatsComponents/RequestGuideDialog";

export const StatsTab = () => {
  const {
    userStats,
    statsLoading,
    statsError,
    nearbyGuides,
    guidesLoading,
    guidesError,
    isGuideModalOpen,
    selectedGuide,
    isRequestDialogOpen,
    requestLoading,
    fetchUserStats,
    fetchNearbyGuides,
    sendEvaluationRequest,
    setGuideModalOpen,
    setSelectedGuide,
    setRequestDialogOpen,
    clearErrors,
  } = useStatsStore();

  const {
    location,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useLocation();

  // Fetch user stats on component mount
  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // Handle find guides action
  const handleFindGuides = async () => {
    clearErrors();
    setGuideModalOpen(true);

    // Try to get current location first
    const currentLocation = await requestLocation();

    if (currentLocation) {
      // Use current location
      await fetchNearbyGuides(currentLocation.lat, currentLocation.lon);
    } else {
      // Fallback to profile location from database
      // You'll need to implement this API call to get user's profile location
      try {
        const response = await fetch("/api/user/profile-location");
        if (response.ok) {
          const profileLocation = await response.json();
          if (profileLocation?.lat && profileLocation?.lon) {
            await fetchNearbyGuides(profileLocation.lat, profileLocation.lon);
          } else {
            // No location available at all
            console.error("No location data available");
          }
        }
      } catch (error) {
        console.error("Failed to get profile location:", error);
      }
    }
  };

  // Handle guide request
  const handleRequestGuide = (guideId: string) => {
    const guide = nearbyGuides.find((g) => g.id === guideId);
    if (guide) {
      setSelectedGuide(guide);
      setRequestDialogOpen(true);
    }
  };

  // Handle send request
  const handleSendRequest = async (guideId: string, message: string) => {
    const success = await sendEvaluationRequest(guideId, message);
    if (success) {
      setRequestDialogOpen(false);
      // Optionally refresh guides list to update UI
    }
    return success;
  };

  // Handle close modal
  const handleCloseModal = () => {
    setGuideModalOpen(false);
    setRequestDialogOpen(false);
  };

  // Loading state
  if (statsLoading) {
    return <StatsLoadingSkeleton />;
  }

  // Error state
  if (statsError) {
    return <StatsErrorState onRetry={fetchUserStats} error={statsError} />;
  }

  // Main render - conditional based on stats availability
  return (
    <div className="space-y-6">
      {userStats ? (
        // User has stats - show actual stats display
        <ActualStatsDisplay stats={userStats} />
      ) : (
        // User has no stats - show empty state with guide discovery
        <EmptyStatsState
          onFindGuides={handleFindGuides}
          loading={locationLoading}
        />
      )}

      {/* Guide Discovery Modal */}
      <GuideDiscoveryModal
        isOpen={isGuideModalOpen}
        onClose={handleCloseModal}
        userLocation={location}
        onLocationPermission={requestLocation}
      >
        <GuideList
          guides={nearbyGuides}
          loading={guidesLoading}
          onRequestGuide={handleRequestGuide}
          userLocation={location!}
        />
      </GuideDiscoveryModal>

      {/* Request Guide Dialog */}
      <RequestGuideDialog
        isOpen={isRequestDialogOpen}
        onClose={handleCloseModal}
        guide={selectedGuide}
        onSendRequest={handleSendRequest}
        loading={requestLoading}
      />
    </div>
  );
};

// Actual Stats Display Component (for when user has stats)
const ActualStatsDisplay = ({ stats }: { stats: any }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Performance Statistics
        </h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View Details
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Height",
            value: stats.height ? `${stats.height} cm` : "--",
            icon: "📏",
          },
          {
            label: "Weight",
            value: stats.weight ? `${stats.weight} kg` : "--",
            icon: "⚖️",
          },
          {
            label: "Age",
            value: stats.age ? `${stats.age} yrs` : "--",
            icon: "🎂",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 border border-gray-100"
          >
            <div className="text-xl mb-2">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Loading Skeleton
const StatsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 rounded-lg p-8">
      <div className="animate-pulse">
        <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <div className="w-8 h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error State
const StatsErrorState = ({
  onRetry,
  error,
}: {
  onRetry: () => void;
  error: string;
}) => (
  <div className="bg-red-50 rounded-lg p-8 text-center border border-red-200">
    <ChartBarIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-red-900 mb-2">
      Failed to Load Statistics
    </h3>
    <p className="text-red-700 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 
               text-white rounded-lg font-medium transition-colors duration-200"
    >
      Try Again
    </button>
  </div>
);
