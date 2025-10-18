import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { VerifiedUser } from "@/app/(protected)/business/types/otpVerification";

// Core Interfaces
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

interface BasicMetricsData {
  height: number | null;
  weight: number | null;
  age: number | null;
  bodyFat: number | null;
}

interface StrengthPowerData {
  strength: number | null;
  muscleMass: number | null;
  enduranceStrength: number | null;
  explosivePower: number | null;
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

interface WizardFormData {
  basicMetrics: BasicMetricsData;
  strengthPower: StrengthPowerData;
  speedAgility: SpeedAgilityData;
  staminaRecovery: StaminaRecoveryData;
  injuries: InjuryInput[];
}

interface ExistingStats {
  id: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  bodyFat: number | null;
  strength?: StrengthPowerData;
  speed?: SpeedAgilityData;
  stamina?: StaminaRecoveryData;
  injuries: any[];
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
  lastUpdatedByName: string | null;
}

interface StatsWizardStore {
  // Athlete & Existing Data
  athlete: VerifiedUser | null;
  existingStats: ExistingStats | null;
  isLoadingStats: boolean;

  // Wizard Navigation (12 steps total: 6 sections × 2 each)
  currentStep: number;
  completedSteps: Set<number>;
  totalSteps: 12;

  // Step Mapping
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

  // Form Data
  formData: WizardFormData;

  // Validation & State
  stepValidation: Record<number, boolean>;
  stepErrors: Record<number, string[]>;
  isDraftSaved: boolean;
  lastSavedAt: Date | null;
  isAutoSaving: boolean;
  isSubmitting: boolean;
  submitError: string | null;

  // Actions
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

// Step Configuration
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

// Default Form Data
const getDefaultFormData = (): WizardFormData => ({
  basicMetrics: {
    height: null,
    weight: null,
    age: null,
    bodyFat: null,
  },
  strengthPower: {
    strength: null,
    muscleMass: null,
    enduranceStrength: null,
    explosivePower: null,
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

// Default Injury Template
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

export const useStatsWizardStore = create<StatsWizardStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        athlete: null,
        existingStats: null,
        isLoadingStats: false,
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

        // Initialize Wizard
        initializeWizard: async (athlete: VerifiedUser) => {
          console.log(
            "🎯 Initializing stats wizard for athlete:",
            athlete.firstName
          );

          set({
            athlete,
            currentStep: 1,
            completedSteps: new Set(),
            formData: getDefaultFormData(),
            stepValidation: {},
            stepErrors: {},
            submitError: null,
          });

          // Load existing stats if they exist
          await get().loadExistingStats(athlete.id);
        },

        // Load Existing Stats
        loadExistingStats: async (userId: string) => {
          set({ isLoadingStats: true });

          try {
            console.log("📊 Loading existing stats for user:", userId);

            const response = await fetch(`/api/stats/${userId}`);

            if (response.ok) {
              const existingStats = await response.json();

              if (existingStats) {
                console.log("✅ Found existing stats, pre-populating forms");

                // Pre-populate form data with existing stats
                const populatedFormData: WizardFormData = {
                  basicMetrics: {
                    height: existingStats.height,
                    weight: existingStats.weight,
                    age: existingStats.age,
                    bodyFat: existingStats.bodyFat,
                  },
                  strengthPower: {
                    strength: existingStats.strength?.strength || null,
                    muscleMass: existingStats.strength?.muscleMass || null,
                    enduranceStrength:
                      existingStats.strength?.enduranceStrength || null,
                    explosivePower:
                      existingStats.strength?.explosivePower || null,
                  },
                  speedAgility: {
                    sprintSpeed: existingStats.speed?.sprintSpeed || null,
                    acceleration: existingStats.speed?.acceleration || null,
                    agility: existingStats.speed?.agility || null,
                    reactionTime: existingStats.speed?.reactionTime || null,
                    balance: existingStats.speed?.balance || null,
                    coordination: existingStats.speed?.coordination || null,
                  },
                  staminaRecovery: {
                    vo2Max: existingStats.stamina?.vo2Max || null,
                    flexibility: existingStats.stamina?.flexibility || null,
                    recoveryTime: existingStats.stamina?.recoveryTime || null,
                  },
                  injuries:
                    existingStats.injuries?.map((injury: any) => ({
                      id: injury.id,
                      type: injury.type,
                      bodyPart: injury.bodyPart,
                      severity: injury.severity,
                      occurredAt: injury.occurredAt?.split("T")[0] || "",
                      recoveryTime: injury.recoveryTime,
                      recoveredAt: injury.recoveredAt?.split("T")[0] || null,
                      status: injury.status,
                      notes: injury.notes || "",
                    })) || [],
                };

                set({
                  existingStats,
                  formData: populatedFormData,
                  isLoadingStats: false,
                });
              } else {
                console.log("📝 No existing stats found, starting fresh");
                set({ isLoadingStats: false });
              }
            } else {
              console.log("📝 No existing stats, starting fresh");
              set({ isLoadingStats: false });
            }
          } catch (error) {
            console.error("❌ Error loading existing stats:", error);
            set({
              isLoadingStats: false,
              submitError: "Failed to load existing stats",
            });
          }
        },

        // Update Form Section
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

          // Auto-save after update
          setTimeout(() => {
            get().autoSave();
          }, 1000);
        },

        // Injury Management
        updateInjuries: (injuries) => {
          set((state) => ({
            formData: {
              ...state.formData,
              injuries,
            },
            isDraftSaved: false,
          }));

          setTimeout(() => {
            get().autoSave();
          }, 1000);
        },

        addInjury: () => {
          const state = get();
          const newInjury = getDefaultInjury();

          set({
            formData: {
              ...state.formData,
              injuries: [...state.formData.injuries, newInjury],
            },
            isDraftSaved: false,
          });
        },

        removeInjury: (index) => {
          const state = get();
          const updatedInjuries = state.formData.injuries.filter(
            (_, i) => i !== index
          );

          set({
            formData: {
              ...state.formData,
              injuries: updatedInjuries,
            },
            isDraftSaved: false,
          });

          setTimeout(() => {
            get().autoSave();
          }, 500);
        },

        updateInjury: (index, injuryData) => {
          const state = get();
          const updatedInjuries = state.formData.injuries.map((injury, i) =>
            i === index ? { ...injury, ...injuryData } : injury
          );

          set({
            formData: {
              ...state.formData,
              injuries: updatedInjuries,
            },
            isDraftSaved: false,
          });

          setTimeout(() => {
            get().autoSave();
          }, 1000);
        },

        // Navigation & Validation
        validateCurrentStep: () => {
          const { currentStep, formData, stepSections } = get();
          const stepConfig = stepSections[currentStep];

          // Only validate form steps
          if (stepConfig.type === "instruction") {
            return true;
          }

          // Validation logic will be implemented with Zod schemas
          // For now, basic validation
          const isValid = true; // Will be replaced with proper validation

          set((state) => ({
            stepValidation: {
              ...state.stepValidation,
              [currentStep]: isValid,
            },
          }));

          return isValid;
        },

        navigateToStep: (step) => {
          const { totalSteps } = get();

          if (step < 1 || step > totalSteps) {
            return false;
          }

          console.log(`🧭 Navigating to step ${step}`);
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

          if (!validateCurrentStep()) {
            console.log("❌ Validation failed, cannot proceed");
            return false;
          }

          markStepComplete(currentStep);

          if (currentStep < totalSteps) {
            set({ currentStep: currentStep + 1 });
            return true;
          }

          return false;
        },

        previousStep: () => {
          const { currentStep } = get();

          if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
          }
        },

        markStepComplete: (step) => {
          set((state) => ({
            completedSteps: new Set([...state.completedSteps, step]),
          }));
        },

        // Auto-save & Draft Management
        autoSave: async () => {
          const { isAutoSaving, athlete, formData } = get();

          if (isAutoSaving || !athlete) return;

          set({ isAutoSaving: true });

          try {
            // Save to localStorage as backup
            localStorage.setItem(
              `stats-draft-${athlete.id}`,
              JSON.stringify({
                formData,
                savedAt: new Date().toISOString(),
              })
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
              set({
                isDraftSaved: true,
                lastSavedAt: new Date(),
              });
              return true;
            }
            return false;
          } catch (error) {
            console.error("❌ Draft save failed:", error);
            return false;
          }
        },

        // Final Submission
        // Update the submitStats method in your StatsWizardStore:

        // Make sure your submitStats method looks like this:
        submitStats: async () => {
          const { athlete, formData, existingStats } = get();

          if (!athlete) {
            console.log("❌ No athlete found for submission");
            return false;
          }

          console.log("🚀 Starting stats submission for:", athlete.firstName);
          set({ isSubmitting: true, submitError: null });

          try {
            const payload = {
              userId: athlete.id,
              ...formData,
              isUpdate: !!existingStats,
            };

            console.log(
              "📤 Submitting payload with keys:",
              Object.keys(payload)
            );

            const response = await fetch(`/api/stats/${athlete.id}`, {
              method: existingStats ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            console.log("📡 API Response status:", response.status);

            if (response.ok) {
              const result = await response.json();
              console.log("✅ Submission successful:", result.message);

              set({
                isSubmitting: false,
                isDraftSaved: true,
                lastSavedAt: new Date(),
                submitError: null,
              });

              return true;
            } else {
              const error = await response.json();
              console.log("❌ Submission failed:", error);
              set({
                isSubmitting: false,
                submitError: error.message || "Submission failed",
              });
              return false;
            }
          } catch (error) {
            console.error("❌ Submission error:", error);
            set({
              isSubmitting: false,
              submitError: "Network error occurred",
            });
            return false;
          }
        },

        // Utility Actions
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

        setError: (error) => {
          set({ submitError: error });
        },

        clearError: () => {
          set({ submitError: null });
        },
      }),
      {
        name: "stats-wizard-storage",
        partialize: (state) => ({
          // Only persist form data and basic state
          formData: state.formData,
          currentStep: state.currentStep,
          completedSteps: Array.from(state.completedSteps), // Convert Set to Array for persistence
          athlete: state.athlete,
        }),
        onRehydrateStorage: () => (state) => {
          // Convert completedSteps back to Set after rehydration
          if (state && Array.isArray(state.completedSteps)) {
            state.completedSteps = new Set(state.completedSteps);
          }
        },
      }
    ),
    { name: "StatsWizardStore" }
  )
);
