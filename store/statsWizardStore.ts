import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { VerifiedUser } from "@/app/(protected)/business/types/otpVerification";
import type {
  StatsResponse,
  BasicMetrics,
  SpeedAgilityForm,
  StaminaRecoveryForm,
  InjuryForm,
} from "@/types/stats";
import type { SpeedAndAgilityData } from "@/lib/stats/types/speedAgilityTests";

import type { StrengthPowerTestData } from "@/lib/stats/types/strengthTests";
import { StrengthCalculations } from "@/lib/stats/types/strengthTests";
import type { StaminaRecoveryData } from "@/lib/stats/types/staminaRecoveryTests";

// ============================================
// UPDATED FORM DATA INTERFACE
// ============================================

interface WizardFormData {
  basicMetrics: BasicMetricsData;
  strengthPower: StrengthPowerTestData;
  speedAgility: SpeedAndAgilityData;
  staminaRecovery: StaminaRecoveryData;
  injuries: InjuryInput[];
}

interface BasicMetricsData {
  height: number | null;
  weight: number | null;
  age: number | null;
  bodyFat: number | null;
}

interface SpeedAndAgilityResponse {
  id: string;
  sprintSpeed: number;
  Ten_Meter_Sprint?: any;
  Fourty_Meter_Dash?: any;
  Repeated_Sprint_Ability?: any;
  Five_0_Five_Agility_Test?: any;
  T_Test?: any;
  Illinois_Agility_Test?: any;
  Visual_Reaction_Speed_Drill?: any;
  Long_Jump?: any;
  Reactive_Agility_T_Test?: any;
  Standing_Long_Jump?: any;
  anthropometricData?: any;
  acceleration?: any;
  agility?: any;
  reactionTime?: any;
  balance?: any;
  coordination?: any;
}

interface InjuryInput {
  id?: string;
  type: string;
  bodyPart: string;
  severity: "mild" | "moderate" | "severe";
  occurredAt: string;
  recoveryTime: number | null;
  recoveredAt: string | null;
  status: "active" | "recovering" | "recovered";
  notes: string;
}

// ============================================
// STORE INTERFACE
// ============================================

interface StatsWizardStore {
  // Athlete & Existing Data
  athlete: VerifiedUser | null;
  existingStats: StatsResponse | null;
  isLoadingStats: boolean;
  isInitializing: boolean;

  // Wizard Navigation
  currentStep: number;
  formData: WizardFormData;
  completedSteps: Set<number>;
  totalSteps: 12;

  stepSections: Record<
    number,
    {
      section:
        | "basicMetrics"
        | "strengthPower"
        | "speedAgility"
        | "staminaRecovery"
        | "injuries"
        | "review";
      type: "instruction" | "form";
      title: string;
    }
  >;

  // Validation & State
  stepValidation: Record<number, boolean>;
  stepErrors: Record<number, string[]>;
  isDraftSaved: boolean;
  lastSavedAt: Date | null;
  isAutoSaving: boolean;
  isSubmitting: boolean;
  submitError: string | null;

  // Strength test specific actions
  addTestAttempt: (
    testName: keyof StrengthPowerTestData,
    attemptData: any
  ) => void;
  removeTestAttempt: (
    testName: keyof StrengthPowerTestData,
    attemptIndex: number
  ) => void;
  updateTestAttempt: (
    testName: keyof StrengthPowerTestData,
    attemptIndex: number,
    attemptData: any
  ) => void;
  addTestSet: (testName: keyof StrengthPowerTestData, setData: any) => void;
  removeTestSet: (
    testName: keyof StrengthPowerTestData,
    setIndex: number
  ) => void;
  recalculateScores: () => void;

  // Existing actions
  initializeWizard: (athlete: VerifiedUser) => Promise<void>;
  loadExistingStats: (userId: string) => Promise<void>;
  updateFormSection: (
    section: keyof Omit<WizardFormData, "injuries">,
    data: Partial<any>
  ) => void;
  updateInjuries: (injuries: InjuryInput[]) => void;
  addInjury: () => void;
  removeInjury: (index: number) => void;
  updateInjury: (index: number, injury: Partial<InjuryInput>) => void;
  validateCurrentStep: () => boolean;
  navigateToStep: (step: number) => boolean;
  nextStep: () => boolean;
  previousStep: () => void;
  markStepComplete: (step: number) => void;
  saveDraft: () => Promise<boolean>;
  autoSave: () => Promise<void>;
  submitStats: () => Promise<boolean>;
  resetWizard: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}

// ============================================
// STEP CONFIGURATION
// ============================================

const STEP_CONFIG = {
  1: {
    section: "basicMetrics" as const,
    type: "instruction" as const,
    title: "Basic Metrics Guide",
  },
  2: {
    section: "basicMetrics" as const,
    type: "form" as const,
    title: "Basic Measurements",
  },
  3: {
    section: "strengthPower" as const,
    type: "instruction" as const,
    title: "Strength & Power Guide",
  },
  4: {
    section: "strengthPower" as const,
    type: "form" as const,
    title: "Strength Assessment",
  },
  5: {
    section: "speedAgility" as const,
    type: "instruction" as const,
    title: "Speed & Agility Guide",
  },
  6: {
    section: "speedAgility" as const,
    type: "form" as const,
    title: "Speed Tests",
  },
  7: {
    section: "staminaRecovery" as const,
    type: "instruction" as const,
    title: "Stamina & Recovery Guide",
  },
  8: {
    section: "staminaRecovery" as const,
    type: "form" as const,
    title: "Endurance Assessment",
  },
  9: {
    section: "injuries" as const,
    type: "instruction" as const,
    title: "Injury Assessment Guide",
  },
  10: {
    section: "injuries" as const,
    type: "form" as const,
    title: "Injury Records",
  },
  11: {
    section: "review" as const,
    type: "form" as const,
    title: "Review & Submit",
  },
  12: {
    section: "review" as const,
    type: "form" as const,
    title: "Confirmation",
  },
};

// ============================================
// DEFAULT FORM DATA
// ============================================

const getDefaultFormData = (): WizardFormData => ({
  basicMetrics: {
    height: null,
    weight: null,
    age: null,
    bodyFat: null,
  },
  strengthPower: {
    athleteBodyWeight: 0,
    muscleMass: 0,
    enduranceStrength: 0,
    explosivePower: 0,
  },
  speedAgility: {
    sprintSpeed: 0,
  } as SpeedAndAgilityData,
  staminaRecovery: {
    vo2Max: 0,
    flexibility: 0,
    recoveryTime: 0,
  } as StaminaRecoveryData,
  injuries: [],
});

const getDefaultInjury = (): InjuryInput => ({
  type: "",
  bodyPart: "",
  severity: "mild",
  occurredAt: new Date().toISOString().split("T")[0],
  recoveryTime: null,
  recoveredAt: null,
  status: "active",
  notes: "",
});

// ============================================
// ✅ FIX: TIMER MANAGEMENT
// ============================================
let recalculateTimer: NodeJS.Timeout | null = null;
let autoSaveTimer: NodeJS.Timeout | null = null;

// ============================================
// ZUSTAND STORE
// ============================================

export const useStatsWizardStore = create<StatsWizardStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        athlete: null,
        existingStats: null,
        isLoadingStats: false,
        isInitializing: false,
        currentStep: 1,
        completedSteps: new Set(),
        totalSteps: 12,
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
        // ✅ FIXED: STRENGTH TEST MANAGEMENT ACTIONS
        // ============================================

        addTestAttempt: (testName, attemptData) => {
          set((state) => {
            const currentTest = state.formData.strengthPower[testName];

            if (
              !currentTest ||
              typeof currentTest !== "object" ||
              !("attempts" in currentTest)
            ) {
              // Initialize test with first attempt
              const newTest = {
                attempts: [
                  {
                    attemptNumber: 1,
                    data: attemptData,
                    notes: "",
                  },
                ],
                bestAttempt: 0,
              };

              return {
                formData: {
                  ...state.formData,
                  strengthPower: {
                    ...state.formData.strengthPower,
                    [testName]: newTest,
                  },
                },
                isDraftSaved: false,
              };
            }

            // Add new attempt
            const newAttempt = {
              attemptNumber: currentTest.attempts.length + 1,
              data: attemptData,
              notes: "",
            };

            return {
              formData: {
                ...state.formData,
                strengthPower: {
                  ...state.formData.strengthPower,
                  [testName]: {
                    ...currentTest,
                    attempts: [...currentTest.attempts, newAttempt],
                  },
                },
              },
              isDraftSaved: false,
            };
          });

          // ✅ FIX: Use single timer with cleanup
          if (recalculateTimer) clearTimeout(recalculateTimer);
          recalculateTimer = setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
            recalculateTimer = null;
          }, 300);
        },

        removeTestAttempt: (testName, attemptIndex) => {
          set((state) => {
            const currentTest = state.formData.strengthPower[testName];

            if (
              !currentTest ||
              typeof currentTest !== "object" ||
              !("attempts" in currentTest)
            ) {
              return state;
            }

            const updatedAttempts = currentTest.attempts.filter(
              (_, index) => index !== attemptIndex
            );

            // Renumber attempts
            const renumberedAttempts = updatedAttempts.map(
              (attempt, index) => ({
                ...attempt,
                attemptNumber: index + 1,
              })
            );

            return {
              formData: {
                ...state.formData,
                strengthPower: {
                  ...state.formData.strengthPower,
                  [testName]: {
                    ...currentTest,
                    attempts: renumberedAttempts,
                    bestAttempt: undefined,
                  },
                },
              },
              isDraftSaved: false,
            };
          });

          // ✅ FIX: Use single timer with cleanup
          if (recalculateTimer) clearTimeout(recalculateTimer);
          recalculateTimer = setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
            recalculateTimer = null;
          }, 300);
        },

        updateTestAttempt: (testName, attemptIndex, attemptData) => {
          set((state) => {
            const currentTest = state.formData.strengthPower[testName];

            if (
              !currentTest ||
              typeof currentTest !== "object" ||
              !("attempts" in currentTest)
            ) {
              return state;
            }

            const updatedAttempts = currentTest.attempts.map((attempt, index) =>
              index === attemptIndex
                ? { ...attempt, data: { ...attempt.data, ...attemptData } }
                : attempt
            );

            return {
              formData: {
                ...state.formData,
                strengthPower: {
                  ...state.formData.strengthPower,
                  [testName]: {
                    ...currentTest,
                    attempts: updatedAttempts,
                  },
                },
              },
              isDraftSaved: false,
            };
          });

          // ✅ FIX: Use single timer with cleanup (longer delay for updates)
          if (recalculateTimer) clearTimeout(recalculateTimer);
          recalculateTimer = setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
            recalculateTimer = null;
          }, 500);
        },

        addTestSet: (testName, setData) => {
          set((state) => {
            const currentTest = state.formData.strengthPower[testName];

            if (
              !currentTest ||
              typeof currentTest !== "object" ||
              !("sets" in currentTest)
            ) {
              // Initialize test with first set
              const newTest = {
                sets: [setData],
                maxLoad: setData.load || 0,
                totalTimeUsed: setData.restAfter || 0,
                totalReps: setData.reps || 0,
              };

              return {
                formData: {
                  ...state.formData,
                  strengthPower: {
                    ...state.formData.strengthPower,
                    [testName]: newTest,
                  },
                },
                isDraftSaved: false,
              };
            }

            // Add new set
            return {
              formData: {
                ...state.formData,
                strengthPower: {
                  ...state.formData.strengthPower,
                  [testName]: {
                    ...currentTest,
                    sets: [...currentTest.sets, setData],
                  },
                },
              },
              isDraftSaved: false,
            };
          });

          // ✅ FIX: Use single timer with cleanup
          if (recalculateTimer) clearTimeout(recalculateTimer);
          recalculateTimer = setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
            recalculateTimer = null;
          }, 300);
        },

        removeTestSet: (testName, setIndex) => {
          set((state) => {
            const currentTest = state.formData.strengthPower[testName];

            if (
              !currentTest ||
              typeof currentTest !== "object" ||
              !("sets" in currentTest)
            ) {
              return state;
            }

            const updatedSets = currentTest.sets.filter(
              (_, index) => index !== setIndex
            );

            return {
              formData: {
                ...state.formData,
                strengthPower: {
                  ...state.formData.strengthPower,
                  [testName]: {
                    ...currentTest,
                    sets: updatedSets,
                  },
                },
              },
              isDraftSaved: false,
            };
          });

          // ✅ FIX: Use single timer with cleanup
          if (recalculateTimer) clearTimeout(recalculateTimer);
          recalculateTimer = setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
            recalculateTimer = null;
          }, 300);
        },

        // ✅ FIX: Improved recalculateScores with timer cleanup
        recalculateScores: () => {
          set((state) => {
            const strengthData = state.formData.strengthPower;

            const explosivePower =
              StrengthCalculations.calculateExplosivePowerScore(strengthData);
            const muscleMass =
              StrengthCalculations.calculateMuscleMassScore(strengthData);
            const enduranceStrength =
              StrengthCalculations.calculateEnduranceStrengthScore(
                strengthData
              );

            console.log("🔢 Recalculated scores:", {
              explosivePower: explosivePower.toFixed(1),
              muscleMass: muscleMass.toFixed(1),
              enduranceStrength: enduranceStrength.toFixed(1),
            });

            return {
              formData: {
                ...state.formData,
                strengthPower: {
                  ...strengthData,
                  explosivePower: Math.round(explosivePower * 10) / 10,
                  muscleMass: Math.round(muscleMass * 10) / 10,
                  enduranceStrength: Math.round(enduranceStrength * 10) / 10,
                },
              },
            };
          });
        },

        // ============================================
        // EXISTING ACTIONS
        // ============================================

        initializeWizard: async (athlete: VerifiedUser) => {
          set({ isInitializing: true, athlete });

          try {
            console.log(
              "🔍 Initializing wizard for athlete:",
              athlete.firstName
            );

            const response = await fetch(`/api/stats/${athlete.id}`);

            if (response.ok) {
              const statsData: StatsResponse | null = await response.json();

              if (statsData) {
                console.log("✅ Stats data loaded");

                set({
                  existingStats: statsData,
                  formData: {
                    basicMetrics: {
                      height: statsData.height || null,
                      weight: statsData.weight || null,
                      age: statsData.age || null,
                      bodyFat: statsData.bodyFat || null,
                    },
                    strengthPower: {
                      athleteBodyWeight: statsData.weight || 0,
                      muscleMass: statsData.currentStrength?.muscleMass || 0,
                      enduranceStrength:
                        statsData.currentStrength?.enduranceStrength || 0,
                      explosivePower:
                        statsData.currentStrength?.explosivePower || 0,
                    },
                    speedAgility: {
                      sprintSpeed:
                        (statsData.currentSpeed as any)?.sprintSpeed || 0,
                      Ten_Meter_Sprint: (statsData.currentSpeed as any)
                        ?.Ten_Meter_Sprint,
                      Fourty_Meter_Dash: (statsData.currentSpeed as any)
                        ?.Fourty_Meter_Dash,
                      Repeated_Sprint_Ability: (statsData.currentSpeed as any)
                        ?.Repeated_Sprint_Ability,
                      Five_0_Five_Agility_Test: (statsData.currentSpeed as any)
                        ?.Five_0_Five_Agility_Test,
                      T_Test: (statsData.currentSpeed as any)?.T_Test,
                      Illinois_Agility_Test: (statsData.currentSpeed as any)
                        ?.Illinois_Agility_Test,
                      Visual_Reaction_Speed_Drill: (
                        statsData.currentSpeed as any
                      )?.Visual_Reaction_Speed_Drill,
                      Long_Jump: (statsData.currentSpeed as any)?.Long_Jump,
                      Reactive_Agility_T_Test: (statsData.currentSpeed as any)
                        ?.Reactive_Agility_T_Test,
                      Standing_Long_Jump: (statsData.currentSpeed as any)
                        ?.Standing_Long_Jump,
                      anthropometricData: (statsData.currentSpeed as any)
                        ?.anthropometricData,
                      acceleration: (statsData.currentSpeed as any)
                        ?.acceleration,
                      agility: (statsData.currentSpeed as any)?.agility,
                      reactionTime: (statsData.currentSpeed as any)
                        ?.reactionTime,
                      balance: (statsData.currentSpeed as any)?.balance,
                      coordination: (statsData.currentSpeed as any)
                        ?.coordination,
                    } as SpeedAndAgilityData,

                    staminaRecovery: {
                      vo2Max: statsData.currentStamina?.vo2Max || 0,
                      flexibility:
                        statsData.currentStamina?.flexibility || 0,
                      recoveryTime:
                        statsData.currentStamina?.recoveryTime || 0,
                    },
                    injuries: statsData.activeInjuries.map((injury) => ({
                      id: injury.id,
                      type: injury.type,
                      bodyPart: injury.bodyPart,
                      severity: injury.severity,
                      occurredAt: injury.occurredAt?.split("T")[0] || "",
                      recoveryTime: injury.recoveryTime,
                      recoveredAt: injury.recoveredAt?.split("T")[0] || null,
                      status: injury.status,
                      notes: injury.notes || "",
                    })),
                  },
                });

                console.log("✅ Form data initialized from existing stats");
              } else {
                console.log("ℹ️ No existing stats found");
                set({ existingStats: null });
              }
            }

            set({ isInitializing: false });
          } catch (error) {
            console.error("❌ Failed to initialize wizard:", error);
            set({ isInitializing: false, existingStats: null });
          }
        },

        loadExistingStats: async (userId: string) => {
          console.log("Loading stats for:", userId);
        },

        updateFormSection: (section, data) => {
          console.log(`📝 Updating ${section} section:`, data);

          set((state) => ({
            formData: {
              ...state.formData,
              [section]: {
                ...state.formData[section],
                ...data,
              },
            },
            isDraftSaved: false,
          }));

          // Auto-recalculate if strengthPower section
          if (section === "strengthPower") {
            if (recalculateTimer) clearTimeout(recalculateTimer);
            recalculateTimer = setTimeout(() => {
              get().recalculateScores();
              recalculateTimer = null;
            }, 300);
          }

          // ✅ FIX: Consolidated auto-save with single timer
          get().autoSave();
        },

        // Injury Management
        updateInjuries: (injuries) => {
          set((state) => ({
            formData: { ...state.formData, injuries },
            isDraftSaved: false,
          }));
          get().autoSave();
        },

        addInjury: () => {
          const state = get();
          set({
            formData: {
              ...state.formData,
              injuries: [...state.formData.injuries, getDefaultInjury()],
            },
            isDraftSaved: false,
          });
        },

        removeInjury: (index) => {
          const state = get();
          set({
            formData: {
              ...state.formData,
              injuries: state.formData.injuries.filter((_, i) => i !== index),
            },
            isDraftSaved: false,
          });
          get().autoSave();
        },

        updateInjury: (index, injuryData) => {
          const state = get();
          set({
            formData: {
              ...state.formData,
              injuries: state.formData.injuries.map((injury, i) =>
                i === index ? { ...injury, ...injuryData } : injury
              ),
            },
            isDraftSaved: false,
          });
          get().autoSave();
        },

        // Navigation
        validateCurrentStep: () => {
          const { currentStep, stepSections } = get();
          const stepConfig = stepSections[currentStep];

          if (stepConfig.type === "instruction") return true;

          set((state) => ({
            stepValidation: { ...state.stepValidation, [currentStep]: true },
          }));

          return true;
        },

        navigateToStep: (step) => {
          const { totalSteps } = get();
          if (step < 1 || step > totalSteps) return false;
          set({ currentStep: step });
          return true;
        },

        nextStep: () => {
          const {
            currentStep,
            totalSteps,
            validateCurrentStep,
            markStepComplete,
          } = get();
          if (!validateCurrentStep()) return false;
          markStepComplete(currentStep);
          if (currentStep < totalSteps) {
            set({ currentStep: currentStep + 1 });
            return true;
          }
          return false;
        },

        previousStep: () => {
          const { currentStep } = get();
          if (currentStep > 1) set({ currentStep: currentStep - 1 });
        },

        markStepComplete: (step) => {
          set((state) => ({
            completedSteps: new Set([...state.completedSteps, step]),
          }));
        },

        // ✅ FIX: Improved auto-save with single timer and debouncing
        autoSave: async () => {
          const { isAutoSaving, athlete, formData } = get();
          if (!athlete) return;

          // ✅ Clear existing timer to debounce
          if (autoSaveTimer) clearTimeout(autoSaveTimer);

          autoSaveTimer = setTimeout(async () => {
            // Check again if already saving (race condition guard)
            if (get().isAutoSaving) {
              autoSaveTimer = null;
              return;
            }

            set({ isAutoSaving: true });

            try {
              localStorage.setItem(
                `stats-draft-${athlete.id}`,
                JSON.stringify({ formData, savedAt: new Date().toISOString() })
              );
              console.log("💾 Auto-saved draft locally");
              set({
                isDraftSaved: true,
                lastSavedAt: new Date(),
                isAutoSaving: false,
              });
            } catch (error) {
              console.error("❌ Auto-save failed:", error);
              set({ isAutoSaving: false });
            }

            autoSaveTimer = null;
          }, 1000); // 1 second debounce
        },

        saveDraft: async () => {
          const { athlete, formData } = get();
          if (!athlete) return false;

          try {
            const response = await fetch(`/api/stats/${athlete.id}/draft`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ formData }),
            });

            if (response.ok) {
              console.log("✅ Draft saved to server");
              set({ isDraftSaved: true, lastSavedAt: new Date() });
              return true;
            }
            return false;
          } catch (error) {
            console.error("❌ Draft save failed:", error);
            return false;
          }
        },

        // Final Submission
        submitStats: async () => {
          const { athlete, formData, existingStats } = get();
          if (!athlete) return false;

          console.log("🚀 Starting stats submission");
          set({ isSubmitting: true, submitError: null });

          try {
            const payload = {
              userId: athlete.id,
              ...formData,
              isUpdate: !!existingStats,
            };

            const response = await fetch(`/api/stats/${athlete.id}`, {
              method: existingStats ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              console.log("✅ Submission successful");
              set({
                isSubmitting: false,
                isDraftSaved: true,
                lastSavedAt: new Date(),
                submitError: null,
              });
              return true;
            } else {
              const error = await response.json();
              console.error("❌ Submission failed:", error);
              set({
                isSubmitting: false,
                submitError: error.error || error.message || "Submission failed",
              });
              return false;
            }
          } catch (error) {
            console.error("❌ Submission error:", error);
            set({ isSubmitting: false, submitError: "Network error occurred" });
            return false;
          }
        },

        resetWizard: () => {
          // ✅ FIX: Clear timers on reset
          if (recalculateTimer) clearTimeout(recalculateTimer);
          if (autoSaveTimer) clearTimeout(autoSaveTimer);
          
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
          });
        },

        setError: (error) => set({ submitError: error }),
        clearError: () => set({ submitError: null }),
      }),
      {
        name: "stats-wizard-storage",
        partialize: (state) => ({
          formData: state.formData,
          currentStep: state.currentStep,
          completedSteps: Array.from(state.completedSteps),
          athlete: state.athlete,
        }),
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.completedSteps)) {
            state.completedSteps = new Set(state.completedSteps);
          }
        },
      }
    ),
    { name: "StatsWizardStore" }
  )
);
