import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
export type { VerifiedUser } from "../../business/types/otpVerification";

interface VerifiedUser {
  id: string;
  firstName: string;
  username: string | null;
  primarySport: string | null;
  profileImageUrl: string | null;
  role: string;
  rank: string;
  class: string;
  country: string | null;
  state: string | null;
  city: string | null;
  gender: string | null;
  requestId: string;
  scheduledDate: string;
  verifiedAt: number; // timestamp
}

interface ErrorState {
  type:
    | "INVALID_OTP"
    | "DATE_MISMATCH"
    | "EXPIRED_REQUEST"
    | "NETWORK_ERROR"
    | "VALIDATION_ERROR"
    | null;
  message: string | null;
}

interface OTPVerificationStore {
  // Dialog State
  isDialogOpen: boolean;
  isLoading: boolean;

  // Verification State
  currentVerifiedUser: VerifiedUser | null;
  verifiedUsersCache: Record<number, VerifiedUser>; // OTP -> User mapping

  // Error State
  error: ErrorState;

  // Actions
  openDialog: () => void;
  closeDialog: () => void;
  verifyOTP: (otp: number) => Promise<boolean>;
  clearError: () => void;
  clearCurrentUser: () => void;
  cleanExpiredCache: () => void;
  getFromCache: (otp: number) => VerifiedUser | null;
  setError: (error: ErrorState) => void;
  setLoading: (loading: boolean) => void;
  cleanupAfterSubmission: (otp: number, athleteId: string) => Promise<boolean>;
  clearAllData: () => void;
}

export const useOTPVerificationStore = create<OTPVerificationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        isDialogOpen: false,
        isLoading: false,
        currentVerifiedUser: null,
        verifiedUsersCache: {},
        error: { type: null, message: null },

        // Actions
        openDialog: () => {
          console.log("🔓 Opening OTP verification dialog");
          set({ isDialogOpen: true, error: { type: null, message: null } });
        },

        closeDialog: () => {
          console.log("🔒 Closing OTP verification dialog");
          set({
            isDialogOpen: false,
            currentVerifiedUser: null,
            error: { type: null, message: null },
            isLoading: false,
          });
        },

        setError: (error: ErrorState) => {
          console.log("❌ Setting error:", error);
          set({ error, isLoading: false });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
          if (loading) {
            set({ error: { type: null, message: null } });
          }
        },

        clearError: () => {
          set({ error: { type: null, message: null } });
        },

        clearCurrentUser: () => {
          set({ currentVerifiedUser: null });
        },

        getFromCache: (otp: number) => {
          const cache = get().verifiedUsersCache;
          const user = cache[otp];

          if (!user) return null;

          // Check if cache entry is expired (1 day = 24 * 60 * 60 * 1000 ms)
          const isExpired = Date.now() - user.verifiedAt > 24 * 60 * 60 * 1000;

          if (isExpired) {
            console.log("⏰ Cache entry expired for OTP:", otp);
            // Remove expired entry
            const { [otp]: removed, ...remainingCache } = cache;
            set({ verifiedUsersCache: remainingCache });
            return null;
          }

          console.log("💾 Retrieved from cache for OTP:", otp);
          return user;
        },

        cleanExpiredCache: () => {
          const cache = get().verifiedUsersCache;
          const now = Date.now();
          const dayInMs = 24 * 60 * 60 * 1000;

          const cleanedCache = Object.entries(cache).reduce(
            (acc, [otp, user]) => {
              if (now - user.verifiedAt <= dayInMs) {
                acc[parseInt(otp)] = user;
              }
              return acc;
            },
            {} as Record<number, VerifiedUser>
          );

          const removedCount =
            Object.keys(cache).length - Object.keys(cleanedCache).length;
          if (removedCount > 0) {
            console.log(`🧹 Cleaned ${removedCount} expired cache entries`);
            set({ verifiedUsersCache: cleanedCache });
          }
        },

        // Make sure your verifyOTP function properly updates the store:

        verifyOTP: async (otp: number) => {
          const { setLoading, setError, clearError } = get();

          setLoading(true);
          clearError();

          try {
            console.log("🔍 Verifying OTP:", `${otp}`.slice(0, 3) + "***");

            const response = await fetch("/api/guides/verify-otp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ otp }),
            });

            const result = await response.json();
            console.log("📥 OTP API Response:", result);

            if (response.ok && result.success) {
              localStorage.setItem("current-otp", otp.toString());
              console.log(
                "✅ OTP Verification successful, creating verified user object"
              );

              // ✅ FIX: Create properly structured VerifiedUser object
              const verifiedUser: VerifiedUser = {
                id: result.user.id,
                firstName: result.user.firstName,
                username: result.user.username,
                primarySport:
                  result.user.primarySport || result.user.PrimarySport, // Handle both variants
                profileImageUrl: result.user.profileImageUrl,
                role: result.user.role || "athlete",
                rank: result.user.rank || result.user.Rank || "PAWN", // Handle both variants
                class: result.user.class || result.user.Class || "A", // Handle both variants
                country: result.user.country,
                state: result.user.state,
                city: result.user.city,
                gender: result.user.gender,
                requestId: result.requestId || "",
                scheduledDate: result.scheduledDate || new Date().toISOString(),
                verifiedAt: Date.now(),
              };

              console.log("🎯 Setting verified user in store:", verifiedUser);

              // ✅ FIX: Update store state properly
              set((state) => {
                const newState = {
                  ...state,
                  currentVerifiedUser: verifiedUser,
                  verifiedUsersCache: {
                    ...state.verifiedUsersCache,
                    [otp]: verifiedUser,
                  },
                  isLoading: false,
                };

                console.log(
                  "💾 Store updated with verified user:",
                  newState.currentVerifiedUser?.firstName
                );
                return newState;
              });

              return true;
            } else {
              console.log("❌ OTP Verification failed:", result.error);
              setError({
                type: result.error?.type || "NETWORK_ERROR",
                message: result.error?.message || "Verification failed",
              });
              return false;
            }
          } catch (error) {
            console.error("❌ OTP verification error:", error);
            setError({
              type: "NETWORK_ERROR",
              message: "Network error occurred. Please try again.",
            });
            return false;
          } finally {
            setLoading(false);
          }
        },
        cleanupAfterSubmission: async (otp: number, athleteId: string) => {
          try {
            console.log("🧹 Starting post-submission cleanup");

            // Step 1: Delete OTP record from database
            const response = await fetch("/api/guides/cleanup-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ otp, athleteId }),
            });

            if (response.ok) {
              console.log("✅ OTP record deleted from database");
            } else {
              console.error("❌ Failed to delete OTP record from database");
            }

            // Step 2: Clear store data
            set({
              currentVerifiedUser: null,
              verifiedUsersCache: {},
              isLoading: false,
              error: { type: null, message: null },
            });

            // Step 3: Clear localStorage
            localStorage.removeItem("otp-verification-storage");
            localStorage.removeItem(`stats-draft-${athleteId}`);

            console.log("✅ All local data cleared");
            return true;
          } catch (error) {
            console.error("❌ Cleanup error:", error);
            return false;
          }
        },

        // ✅ NEW: Manual clear all data method
        clearAllData: () => {
          set({
            currentVerifiedUser: null,
            verifiedUsersCache: {},
            isLoading: false,
            error: { type: null, message: null },
          });
          localStorage.removeItem("otp-verification-storage");
          console.log("✅ All OTP data cleared manually");
        },
      }),

      {
        name: "otp-verification-storage",
        // ✅ FIX: Make sure partialize includes currentVerifiedUser
        partialize: (state) => ({
          currentVerifiedUser: state.currentVerifiedUser,
          verifiedUsersCache: state.verifiedUsersCache,
          // Don't persist loading/error states
        }),
      }
    ),
    { name: "OTPVerificationStore" }
  )
);
