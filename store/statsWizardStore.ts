// ===============================================
// FILE: stores/stats-wizard/index.ts
// Main Zustand store - combines all modules
// ============================================

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Types
import type { StatsWizardStore, WizardFormData } from "@/types/wizard.types";

// Config
import {
  WIZARD_CONFIG,
  STEP_CONFIG,
  getDefaultFormData,
  STORAGE_KEYS,
} from "@/types/config/wizard.config";

// Utils
import { createTimerManager } from "@/lib/utils/timer-manager";
import { StorageManager } from "@/lib/utils/storage-manager";
import { parseApiError } from "@/lib/utils/error-handler";

// Actions
import { createStrengthTestActions } from "@/lib/stats/action/strength-test.actions";
import { createApiActions } from "@/lib/stats/action/api.actions";
import { createNavigationActions } from "@/lib/stats/action/navigation-action";
import { createInjuryActions } from "@/lib/stats/action/injury.actions";

/**
 * Main Stats Wizard Store
 * Combines all actions and state management
 */
export const useStatsWizardStore = create<StatsWizardStore>()(
  devtools(
    persist(
      (set, get) => {
        // Create timer manager instance (one per store)
        const timerManager = createTimerManager();

        // ============================================
        // AUTO-SAVE IMPLEMENTATION
        // ============================================

        const autoSave = async (): Promise<void> => {
          const { isAutoSaving, athlete, formData } = get();
          if (!athlete) return;

          // Use timer manager for debouncing
          timerManager.setDebounced(
            "auto-save",
            async () => {
              // Race condition guard
              if (get().isAutoSaving) return;

              set({ isAutoSaving: true });

              try {
                // Save to localStorage
                const success = StorageManager.saveDraft(athlete.id, formData);

                if (success) {
                  set({
                    isDraftSaved: true,
                    lastSavedAt: new Date(),
                    isAutoSaving: false,
                  });
                  console.log("💾 Auto-saved successfully");
                } else {
                  set({ isAutoSaving: false });
                  console.warn("⚠️ Auto-save failed");
                }
              } catch (error) {
                console.error("❌ Auto-save error:", error);
                set({ isAutoSaving: false });
              }
            },
            WIZARD_CONFIG.AUTO_SAVE_DELAY
          );
        };

        // ============================================
        // CREATE ACTION MODULES
        // ============================================

        const strengthTestActions = createStrengthTestActions(
          timerManager,
          get,
          set
        );

        const apiActions = createApiActions(get, set);

        const navigationActions = createNavigationActions(get, set);

        const injuryActions = createInjuryActions(get, set, autoSave);

        // ============================================
        // FORM SECTION UPDATE ACTION
        // ============================================

        const updateFormSection = (
          section: keyof Omit<WizardFormData, "injuries">,
          data: Partial<any>
        ): void => {
          try {
            console.log(`📝 Updating ${section} section:`, data);

            const state = get();
            set({
              formData: {
                ...state.formData,
                [section]: {
                  ...state.formData[section],
                  ...data,
                },
              },
              isDraftSaved: false,
            });

            // Auto-recalculate for strengthPower section
            if (section === "strengthPower") {
              timerManager.setDebounced(
                "recalculate-scores",
                () => {
                  strengthTestActions.recalculateScores();
                },
                WIZARD_CONFIG.RECALCULATE_DELAY
              );
            }

            // Trigger auto-save
            autoSave();
          } catch (error) {
            console.error("❌ Failed to update form section:", error);
            set({
              submitError: parseApiError(error),
            });
          }
        };

        // ============================================
        // RESET WIZARD ACTION
        // ============================================

        const resetWizard = (): void => {
          console.log("🔄 Resetting wizard");

          // Clear all timers to prevent memory leaks
          timerManager.clearAll();

          // Clear localStorage draft if athlete exists
          const { athlete } = get();
          if (athlete) {
            StorageManager.clearDraft(athlete.id);
          }

          // Reset state
          set({
            athlete: null,
            existingStats: null,
            currentStep: 1,
            completedSteps: new Set(),
            formData: getDefaultFormData(),
            stepValidation: {},
            stepErrors: {},
            isDraftSaved: false,
            lastSavedAt: null,
            submitError: null,
            isSubmitting: false,
            isAutoSaving: false,
            isLoadingStats: false,
            isInitializing: false,
          });

          console.log("✅ Wizard reset complete");
        };

        // ============================================
        // RETURN STORE STATE & ACTIONS
        // ============================================

        return {
          // ============================================
          // INITIAL STATE
          // ============================================
          athlete: null,
          existingStats: null,
          isLoadingStats: false,
          isInitializing: false,
          currentStep: 1,
          completedSteps: new Set(),
          totalSteps: WIZARD_CONFIG.TOTAL_STEPS,
          stepSections: STEP_CONFIG,
          formData: getDefaultFormData(),
          stepValidation: {},
          stepErrors: {},
          isDraftSaved: false,
          lastSavedAt: null,
          isAutoSaving: false,
          isSubmitting: false,
          submitError: null,

          // ============================================
          // STRENGTH TEST ACTIONS
          // ============================================
          addTestAttempt: strengthTestActions.addTestAttempt,
          removeTestAttempt: strengthTestActions.removeTestAttempt,
          updateTestAttempt: strengthTestActions.updateTestAttempt,
          addTestSet: strengthTestActions.addTestSet,
          removeTestSet: strengthTestActions.removeTestSet,
          recalculateScores: strengthTestActions.recalculateScores,

          // ============================================
          // API ACTIONS
          // ============================================
          initializeWizard: apiActions.initializeWizard,
          loadExistingStats: apiActions.loadExistingStats,
          saveDraft: apiActions.saveDraft,
          submitStats: apiActions.submitStats,

          // ============================================
          // NAVIGATION ACTIONS
          // ============================================
          validateCurrentStep: navigationActions.validateCurrentStep,
          navigateToStep: navigationActions.navigateToStep,
          nextStep: navigationActions.nextStep,
          previousStep: navigationActions.previousStep,
          markStepComplete: navigationActions.markStepComplete,

          // ============================================
          // INJURY ACTIONS
          // ============================================
          updateInjuries: injuryActions.updateInjuries,
          addInjury: injuryActions.addInjury,
          removeInjury: injuryActions.removeInjury,
          updateInjury: injuryActions.updateInjury,

          // ============================================
          // FORM ACTIONS
          // ============================================
          updateFormSection,
          autoSave,

          // ============================================
          // UTILITY ACTIONS
          // ============================================
          resetWizard,
          setError: (error: string) => set({ submitError: error }),
          clearError: () => set({ submitError: null }),
        };
      },
      {
        name: STORAGE_KEYS.STORE_NAME,
        partialize: (state) => ({
          formData: state.formData,
          currentStep: state.currentStep,
          completedSteps: Array.from(state.completedSteps),
          athlete: state.athlete,
        }),
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.completedSteps)) {
            // Convert array back to Set after rehydration
            state.completedSteps = new Set(state.completedSteps);
          }
          console.log("💾 Store rehydrated from localStorage");
        },
      }
    ),
    { name: "StatsWizardStore" }
  )
);

// ============================================
// EXPORT TYPES FOR CONVENIENCE
// ============================================

export type { StatsWizardStore } from "@/types/wizard.types";
export { WIZARD_CONFIG, STEP_CONFIG } from "@/types/config/wizard.config";
