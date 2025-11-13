// ============================================
// FILE: actions/api.actions.ts
// API integration with retry logic and error handling
// ============================================

import type { VerifiedUser } from "@/app/(protected)/business/types/otpVerification";
import type { StatsResponse } from "@/types/stats";
import type {
  WizardFormData,
  StatsSubmissionPayload,
} from "@/types/wizard.types";
import { API_ENDPOINTS } from "@/types/config/wizard.config";
import {
  safeFetch,
  retryWithBackoff,
  parseApiError,
} from "@/lib/utils/error-handler";
import { StorageManager } from "@/lib/utils/storage-manager";

/**
 * Maps API response to form data structure
 */
function mapStatsResponseToFormData(
  statsData: StatsResponse
): Partial<WizardFormData> {
  return {
    basicMetrics: {
      height: statsData.height || null,
      weight: statsData.weight || null,
      age: statsData.age || null,
      bodyFat: statsData.bodyFat || null,
    },
    strengthPower: {
      athleteBodyWeight: statsData.weight || 0,
      muscleMass: statsData.currentStrength?.muscleMass || 0,
      enduranceStrength: statsData.currentStrength?.enduranceStrength || 0,
      explosivePower: statsData.currentStrength?.explosivePower || 0,
    } as any,
    speedAgility: {
      sprintSpeed: (statsData.currentSpeed as any)?.sprintSpeed || 0,
      Ten_Meter_Sprint: (statsData.currentSpeed as any)?.Ten_Meter_Sprint,
      Fourty_Meter_Dash: (statsData.currentSpeed as any)?.Fourty_Meter_Dash,
      Repeated_Sprint_Ability: (statsData.currentSpeed as any)
        ?.Repeated_Sprint_Ability,
      Five_0_Five_Agility_Test: (statsData.currentSpeed as any)
        ?.Five_0_Five_Agility_Test,
      T_Test: (statsData.currentSpeed as any)?.T_Test,
      Illinois_Agility_Test: (statsData.currentSpeed as any)
        ?.Illinois_Agility_Test,
      Visual_Reaction_Speed_Drill: (statsData.currentSpeed as any)
        ?.Visual_Reaction_Speed_Drill,
      Long_Jump: (statsData.currentSpeed as any)?.Long_Jump,
      Reactive_Agility_T_Test: (statsData.currentSpeed as any)
        ?.Reactive_Agility_T_Test,
      Standing_Long_Jump: (statsData.currentSpeed as any)?.Standing_Long_Jump,
      anthropometricData: (statsData.currentSpeed as any)?.anthropometricData,
      acceleration: (statsData.currentSpeed as any)?.acceleration,
      agility: (statsData.currentSpeed as any)?.agility,
      reactionTime: (statsData.currentSpeed as any)?.reactionTime,
      balance: (statsData.currentSpeed as any)?.balance,
      coordination: (statsData.currentSpeed as any)?.coordination,
    } as any,
    staminaRecovery: {
      vo2Max: statsData.currentStamina?.vo2Max || 0,
      flexibility: statsData.currentStamina?.flexibility || 0,
      recoveryTime: statsData.currentStamina?.recoveryTime || 0,
    } as any,
    injuries:
      statsData.activeInjuries?.map((injury) => ({
        id: injury.id,
        type: injury.type,
        bodyPart: injury.bodyPart,
        severity: injury.severity as "mild" | "moderate" | "severe",
        occurredAt: injury.occurredAt?.split("T")[0] || "", // ✅ FIX: to get string
        recoveryTime: injury.recoveryTime,
        recoveredAt: injury.recoveredAt?.split("T")[0] || null,
        status: injury.status as "active" | "recovering" | "recovered",
        notes: injury.notes || "",
      })) || [],
  };
}

/**
 * Creates API-related actions
 */
export function createApiActions(
  getState: () => any,
  setState: (partial: any) => void
) {
  return {
    /**
     * Initialize wizard and load existing stats
     */
    initializeWizard: async (athlete: VerifiedUser): Promise<void> => {
      setState({ isInitializing: true, athlete, submitError: null });

      try {
        console.log("🔍 Initializing wizard for athlete:", athlete.firstName);

        // Fetch existing stats with retry logic
        const statsData = await retryWithBackoff<StatsResponse | null>(
          async () => {
            try {
              const response = await safeFetch<StatsResponse>(
                API_ENDPOINTS.STATS(athlete.id)
              );
              return response;
            } catch (error: any) {
              // 404 means no stats exist yet - this is OK
              if (error.statusCode === 404) {
                return null;
              }
              throw error;
            }
          },
          {
            maxRetries: 3,
            initialDelay: 1000,
          }
        );

        if (statsData) {
          console.log("✅ Existing stats loaded successfully");

          const mappedFormData = mapStatsResponseToFormData(statsData);

          setState({
            existingStats: statsData,
            formData: {
              ...getState().formData,
              ...mappedFormData,
            },
            isInitializing: false,
          });

          console.log("✅ Form data initialized from existing stats");
        } else {
          console.log("ℹ️ No existing stats found - starting fresh");

          // Check for local draft
          const draft = StorageManager.loadDraft(athlete.id);
          if (draft) {
            console.log("💾 Restored draft from localStorage");
            setState({
              formData: draft.formData,
              lastSavedAt: new Date(draft.savedAt),
              isDraftSaved: true,
            });
          }

          setState({
            existingStats: null,
            isInitializing: false,
          });
        }
      } catch (error) {
        console.error("❌ Failed to initialize wizard:", error);
        const errorMessage = parseApiError(error);

        setState({
          isInitializing: false,
          existingStats: null,
          submitError: `Initialization failed: ${errorMessage}`,
        });

        // Still try to load from local draft on error
        const draft = StorageManager.loadDraft(athlete.id);
        if (draft) {
          console.log("💾 Restored draft from localStorage after API error");
          setState({
            formData: draft.formData,
            lastSavedAt: new Date(draft.savedAt),
            isDraftSaved: true,
          });
        }
      }
    },

    /**
     * Load existing stats (can be called separately)
     */
    loadExistingStats: async (userId: string): Promise<void> => {
      setState({ isLoadingStats: true, submitError: null });

      try {
        console.log("📊 Loading stats for user:", userId);

        const statsData = await retryWithBackoff<StatsResponse | null>(
          async () => {
            try {
              return await safeFetch<StatsResponse>(
                API_ENDPOINTS.STATS(userId)
              );
            } catch (error: any) {
              if (error.statusCode === 404) return null;
              throw error;
            }
          }
        );

        if (statsData) {
          const mappedFormData = mapStatsResponseToFormData(statsData);

          setState({
            existingStats: statsData,
            formData: {
              ...getState().formData,
              ...mappedFormData,
            },
            isLoadingStats: false,
          });

          console.log("✅ Stats loaded and merged into form");
        } else {
          setState({ isLoadingStats: false });
          console.log("ℹ️ No stats found for user");
        }
      } catch (error) {
        console.error("❌ Failed to load stats:", error);
        setState({
          isLoadingStats: false,
          submitError: `Failed to load stats: ${parseApiError(error)}`,
        });
      }
    },

    /**
     * Save draft to server
     */
    saveDraft: async (): Promise<boolean> => {
      const { athlete, formData } = getState();
      if (!athlete) {
        console.warn("⚠️ Cannot save draft: no athlete selected");
        return false;
      }

      try {
        console.log("💾 Saving draft to server...");

        await retryWithBackoff(
          async () => {
            return await safeFetch(API_ENDPOINTS.DRAFT(athlete.id), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ formData }),
            });
          },
          { maxRetries: 2 }
        );

        setState({
          isDraftSaved: true,
          lastSavedAt: new Date(),
        });

        console.log("✅ Draft saved to server successfully");
        return true;
      } catch (error) {
        console.error("❌ Failed to save draft to server:", error);

        // Fallback to local storage
        const localSaveSuccess = StorageManager.saveDraft(athlete.id, formData);
        if (localSaveSuccess) {
          console.log("💾 Draft saved to localStorage as fallback");
          setState({
            isDraftSaved: true,
            lastSavedAt: new Date(),
          });
          return true;
        }

        return false;
      }
    },

    /**
     * Submit final stats
     */
    submitStats: async (): Promise<boolean> => {
      const { athlete, formData, existingStats } = getState();

      if (!athlete) {
        console.error("❌ Cannot submit: no athlete selected");
        setState({ submitError: "No athlete selected" });
        return false;
      }

      console.log("🚀 Starting stats submission");
      setState({ isSubmitting: true, submitError: null });

      try {
        const payload: StatsSubmissionPayload = {
          userId: athlete.id,
          ...formData,
          isUpdate: !!existingStats,
        };

        const method = existingStats ? "PUT" : "POST";
        console.log(`📤 Submitting with ${method} method`);

        await retryWithBackoff(
          async () => {
            return await safeFetch(API_ENDPOINTS.STATS(athlete.id), {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          },
          {
            maxRetries: 3,
            initialDelay: 1000,
          }
        );

        console.log("✅ Stats submitted successfully");

        // Clear draft after successful submission
        StorageManager.clearDraft(athlete.id);

        setState({
          isSubmitting: false,
          isDraftSaved: true,
          lastSavedAt: new Date(),
          submitError: null,
        });

        return true;
      } catch (error) {
        console.error("❌ Stats submission failed:", error);
        const errorMessage = parseApiError(error);

        setState({
          isSubmitting: false,
          submitError: errorMessage,
        });

        return false;
      }
    },
  };
}
