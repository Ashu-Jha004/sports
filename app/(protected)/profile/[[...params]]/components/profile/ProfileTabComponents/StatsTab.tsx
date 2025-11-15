// app/(protected)/profile/[[...params]]/components/profile/ProfileTabComponents/StatsTab.tsx
import { useEffect } from "react";
import { useStatsStore } from "@/store/statsStore";
import { useLocation } from "../../StatsComponents/hooks/useLocation";
import { EmptyStatsState } from "../../StatsComponents/EmptyStatsState";
import { GuideDiscoveryModal } from "../../StatsComponents/GuideDiscoveryModal";
import { GuideList } from "../../StatsComponents/GuideList";
import { RequestGuideDialog } from "../../StatsComponents/RequestGuideDialog";
import {
  ActualStatsDisplay,
  StatsLoadingSkeleton,
  StatsErrorState,
} from "./sub_components/ActualStatsDisplay";
export const StatsTab = ({ profileData }: any) => {
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
  const { id } = profileData;

  // Fetch user stats on component mount
  useEffect(() => {
    fetchUserStats(id);
  }, [fetchUserStats]);
  console.log("user stats", userStats);
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
    return (
      <StatsErrorState
        onRetry={fetchUserStats(profileData.id)}
        error={statsError}
      />
    );
  }

  // Main render - conditional based on stats availability
  return (
    <div className="space-y-6">
      {userStats ? (
        // User has stats - show actual stats display
        <ActualStatsDisplay
          stats={userStats}
          onFindGuides={handleFindGuides}
          loading={locationLoading}
        />
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
