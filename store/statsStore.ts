// lib/stores/statsStore.ts (ENHANCED WITH REQUEST TRACKING)
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import toast from "react-hot-toast";

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
type RequestStatusType = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

interface RequestStatus {
  id: string;
  status: RequestStatusType;
  createdAt: string;
  updatedAt: string;
}

interface StatsState {
  // Stats data
  userStats: any | null;
  statsLoading: boolean;
  statsError: string | null;

  // Nearby guides
  nearbyGuides: Guide[];
  guidesLoading: boolean;
  guidesError: string | null;

  // Request tracking
  requestStatusMap: Record<string, RequestStatus>;
  requestStatusLoading: boolean;

  // Modal states
  isGuideModalOpen: boolean;
  isStatsModalOpen: boolean;
  selectedGuide: Guide | null;
  isRequestDialogOpen: boolean;

  // Request state
  requestLoading: boolean;

  // Actions
  fetchUserStats: (userId: any) => Promise<void>;
  fetchNearbyGuides: (
    lat: number,
    lon: number,
    radius?: number
  ) => Promise<void>;
  fetchUserRequestStatus: () => Promise<void>;
  sendEvaluationRequest: (guideId: string, message: string) => Promise<boolean>;

  // Modal controls
  setGuideModalOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  setSelectedGuide: (guide: Guide | null) => void;
  setRequestDialogOpen: (open: boolean) => void;

  // Utilities
  clearErrors: () => void;
  reset: () => void;
  getGuideRequestStatus: (guideId: string) => RequestStatus | null;
}

export const useStatsStore = create<StatsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      userStats: null,
      statsLoading: false,
      statsError: null,
      nearbyGuides: [],
      guidesLoading: false,
      guidesError: null,
      requestStatusMap: {},
      requestStatusLoading: false,
      isGuideModalOpen: false,
      isStatsModalOpen: false,
      selectedGuide: null,
      isRequestDialogOpen: false,
      requestLoading: false,

      // Fetch user stats
      fetchUserStats: async (userId: any) => {
        set({ statsLoading: true, statsError: null });
        try {
          const response = await fetch(`/api/stats/${userId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch stats");
          }

          const data = await response.json();
          console.log("response by store", data);
          set({ userStats: data, statsLoading: false });
        } catch (error) {
          set({
            statsError:
              error instanceof Error ? error.message : "Unknown error",
            statsLoading: false,
          });
          toast.error("Failed to load stats");
        }
      },

      // Fetch user's request status for all guides
      fetchUserRequestStatus: async () => {
        set({ requestStatusLoading: true });
        try {
          const response = await fetch("/api/user/guide-requests");
          if (response.ok) {
            const data = await response.json();
            set({ requestStatusMap: data.requestStatusMap });
          }
        } catch (error) {
          console.error("Failed to fetch request status:", error);
        } finally {
          set({ requestStatusLoading: false });
        }
      },

      // Fetch nearby guides and request status
      fetchNearbyGuides: async (lat: number, lon: number, radius = 50) => {
        set({ guidesLoading: true, guidesError: null });
        try {
          // Fetch guides and request status in parallel
          const [guidesResponse] = await Promise.all([
            fetch(`/api/guides/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
            get().fetchUserRequestStatus(), // Fetch request status simultaneously
          ]);

          if (!guidesResponse.ok) {
            const errorData = await guidesResponse.json();
            throw new Error(errorData.error || "Failed to fetch guides");
          }

          const guidesData = await guidesResponse.json();
          set({ nearbyGuides: guidesData.guides, guidesLoading: false });

          if (guidesData.guides.length === 0) {
            toast("No guides found in your area", {
              icon: "📍",
              duration: 3000,
            });
          }
        } catch (error) {
          set({
            guidesError:
              error instanceof Error ? error.message : "Unknown error",
            guidesLoading: false,
          });
          toast.error("Failed to find nearby guides");
        }
      },

      // Send evaluation request
      sendEvaluationRequest: async (guideId: string, message: string) => {
        set({ requestLoading: true });

        const toastId = toast.loading("Sending request...");

        try {
          const response = await fetch("/api/guides/evaluation-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guideId, message }),
          });

          const data = await response.json();

          if (!response.ok) {
            // ADDED: Handle self-request error specifically
            if (data.errorType === "SELF_REQUEST_NOT_ALLOWED") {
              toast.error("You cannot request an evaluation from yourself!", {
                id: toastId,
                duration: 4000,
                icon: "🚫",
              });
            } else if (
              data.requestStatus &&
              typeof data.requestStatus === "string"
            ) {
              const statusMessages: Record<RequestStatusType, string> = {
                PENDING: "You already have a pending request with this guide",
                ACCEPTED:
                  "You already have an accepted evaluation with this guide",
                REJECTED: "Previous request was rejected",
                CANCELLED: "Previous request was cancelled",
              };

              const status = data.requestStatus as RequestStatusType;
              const message = statusMessages[status] || data.error;
              toast.error(message, { id: toastId });
            } else {
              toast.error(data.error || "Failed to send request", {
                id: toastId,
              });
            }
            set({ requestLoading: false });
            return false;
          }

          // Success - update request status map
          const currentMap = get().requestStatusMap;
          set({
            requestStatusMap: {
              ...currentMap,
              [guideId]: {
                id: data.requestId,
                status: "PENDING",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          });

          toast.success("Request sent successfully!", { id: toastId });
          set({ requestLoading: false });
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to send request";
          toast.error(errorMessage, { id: toastId });
          set({ requestLoading: false });
          return false;
        }
      },

      // Get request status for a specific guide
      getGuideRequestStatus: (guideId: string) => {
        return get().requestStatusMap[guideId] || null;
      },

      // Modal controls
      setGuideModalOpen: (open) => {
        set({ isGuideModalOpen: open });
        if (!open) {
          set({ nearbyGuides: [], guidesError: null });
        }
      },

      setStatsModalOpen: (open) => set({ isStatsModalOpen: open }),

      setSelectedGuide: (guide) => set({ selectedGuide: guide }),

      setRequestDialogOpen: (open) => {
        set({ isRequestDialogOpen: open });
        if (!open) {
          set({ selectedGuide: null });
        }
      },

      // Utilities
      clearErrors: () =>
        set({
          statsError: null,
          guidesError: null,
        }),

      reset: () =>
        set({
          userStats: null,
          nearbyGuides: [],
          requestStatusMap: {},
          isGuideModalOpen: false,
          isStatsModalOpen: false,
          selectedGuide: null,
          isRequestDialogOpen: false,
          statsError: null,
          guidesError: null,
          statsLoading: false,
          guidesLoading: false,
          requestLoading: false,
          requestStatusLoading: false,
        }),
    }),
    { name: "stats-store" }
  )
);
