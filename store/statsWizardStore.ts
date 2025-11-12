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
import type { StrengthPowerTestData } from "@/lib/stats/types/strengthTests";
import { StrengthCalculations } from "@/lib/stats/types/strengthTests";

// ============================================
// UPDATED FORM DATA INTERFACE
// ============================================

interface WizardFormData {
  basicMetrics: BasicMetricsData;
  strengthPower: StrengthPowerTestData; // ✅ NEW: Uses detailed test structure
  speedAgility: SpeedAgilityData;
  staminaRecovery: StaminaRecoveryData;
  injuries: InjuryInput[];
}

// Keep existing interfaces for other sections
interface BasicMetricsData {
  height: number | null;
  weight: number | null;
  age: number | null;
  bodyFat: number | null;
}

interface SpeedAgilityData {
  sprintSpeed: number | null;
  acceleration: number | null;
  agility: number | null;
  reactionTime: number | null;
  balance: number | null;
  coordination: number | null;
}

interface StaminaRecoveryData {
  vo2Max: number | null;
  flexibility: number | null;
  recoveryTime: number | null;
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
  isInitializing: boolean; // Wizard Navigation

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
  >; // Validation & State

  stepValidation: Record<number, boolean>;
  stepErrors: Record<number, string[]>;
  isDraftSaved: boolean;
  lastSavedAt: Date | null;
  isAutoSaving: boolean;
  isSubmitting: boolean;
  submitError: string | null; // ✅ NEW: Strength test specific actions

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
  recalculateScores: () => void; // Existing actions

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
// STEP CONFIGURATION (unchanged)
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
    sprintSpeed: null,
    acceleration: null,
    agility: null,
    reactionTime: null,
    balance: null,
    coordination: null,
  },
  staminaRecovery: {
    vo2Max: null,
    flexibility: null,
    recoveryTime: null,
  },
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
        submitError: null, // ============================================ // ✅ NEW: STRENGTH TEST MANAGEMENT ACTIONS // ============================================

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
            } // Add new attempt

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

          setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
          }, 500);
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
            ); // Renumber attempts

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

          setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
          }, 500);
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

          setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
          }, 1000);
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
            } // Add new set

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

          setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
          }, 500);
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

          setTimeout(() => {
            get().recalculateScores();
            get().autoSave();
          }, 500);
        },

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
        }, // ============================================ // EXISTING ACTIONS (mostly unchanged) // ============================================

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
                      sprintSpeed: statsData.currentSpeed?.sprintSpeed || null,
                      acceleration:
                        statsData.currentSpeed?.acceleration || null,
                      agility: statsData.currentSpeed?.agility || null,
                      reactionTime:
                        statsData.currentSpeed?.reactionTime || null,
                      balance: statsData.currentSpeed?.balance || null,
                      coordination:
                        statsData.currentSpeed?.coordination || null,
                    },
                    staminaRecovery: {
                      vo2Max: statsData.currentStamina?.vo2Max || null,
                      flexibility:
                        statsData.currentStamina?.flexibility || null,
                      recoveryTime:
                        statsData.currentStamina?.recoveryTime || null,
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
          // Simplified - handled by initializeWizard
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
          })); // Auto-recalculate if strengthPower section

          if (section === "strengthPower") {
            setTimeout(() => {
              get().recalculateScores();
            }, 500);
          }

          setTimeout(() => {
            get().autoSave();
          }, 1000);
        }, // Injury Management (unchanged)

        updateInjuries: (injuries) => {
          set((state) => ({
            formData: { ...state.formData, injuries },
            isDraftSaved: false,
          }));
          setTimeout(() => get().autoSave(), 1000);
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
          setTimeout(() => get().autoSave(), 500);
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
          setTimeout(() => get().autoSave(), 1000);
        }, // Navigation (unchanged)

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
        }, // Auto-save (unchanged)

        autoSave: async () => {
          const { isAutoSaving, athlete, formData } = get();
          if (isAutoSaving || !athlete) return;

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
        }, // Final Submission (unchanged)

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
              set({
                isSubmitting: false,
                submitError: error.message || "Submission failed",
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
