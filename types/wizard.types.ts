// ============================================
// FILE: types/wizard.types.ts
// Extracted type definitions for better maintainability
// ============================================

import type { VerifiedUser } from "@/app/(protected)/business/types/otpVerification";
import type { StatsResponse } from "@/types/stats";
import type { SpeedAndAgilityData } from "@/lib/stats/types/speedAgilityTests";
import type { StrengthPowerTestData } from "@/lib/stats/types/strengthTests";
import type { StaminaRecoveryData } from "@/lib/stats/types/staminaRecoveryTests";

// ============================================
// FORM DATA INTERFACES
// ============================================

export interface BasicMetricsData {
  height: number | null;
  weight: number | null;
  age: number | null;
  bodyFat: number | null;
}

export interface InjuryInput {
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

export interface WizardFormData {
  basicMetrics: BasicMetricsData;
  strengthPower: StrengthPowerTestData;
  speedAgility: SpeedAndAgilityData;
  staminaRecovery: StaminaRecoveryData;
  injuries: InjuryInput[];
}

// ============================================
// STEP CONFIGURATION TYPES
// ============================================

export type WizardSection =
  | "basicMetrics"
  | "strengthPower"
  | "speedAgility"
  | "staminaRecovery"
  | "injuries"
  | "review";

export type StepType = "instruction" | "form";

export interface StepConfig {
  section: WizardSection;
  type: StepType;
  title: string;
}

export type StepSections = Record<number, StepConfig>;

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface StepValidationState {
  [stepNumber: number]: boolean;
}

export interface StepErrorState {
  [stepNumber: number]: string[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: unknown;
}

export interface DraftSaveResponse {
  success: boolean;
  savedAt: string;
}

export interface StatsSubmissionPayload {
  userId: string;
  basicMetrics: BasicMetricsData;
  strengthPower: StrengthPowerTestData;
  speedAgility: SpeedAndAgilityData;
  staminaRecovery: StaminaRecoveryData;
  injuries: InjuryInput[];
  isUpdate: boolean;
}

// ============================================
// STORE STATE INTERFACE
// ============================================

export interface StatsWizardState {
  // Athlete & Existing Data
  athlete: VerifiedUser | null;
  existingStats: StatsResponse | null;
  isLoadingStats: boolean;
  isInitializing: boolean;

  // Wizard Navigation
  currentStep: number;
  formData: WizardFormData;
  completedSteps: Set<number>;
  totalSteps: number;
  stepSections: StepSections;

  // Validation & State
  stepValidation: StepValidationState;
  stepErrors: StepErrorState;
  isDraftSaved: boolean;
  lastSavedAt: Date | null;
  isAutoSaving: boolean;
  isSubmitting: boolean;
  submitError: string | null;
}

// ============================================
// STORE ACTIONS INTERFACE
// ============================================

export interface StatsWizardActions {
  // Strength test specific actions
  addTestAttempt: (
    testName: keyof StrengthPowerTestData,
    attemptData: unknown
  ) => void;
  removeTestAttempt: (
    testName: keyof StrengthPowerTestData,
    attemptIndex: number
  ) => void;
  updateTestAttempt: (
    testName: keyof StrengthPowerTestData,
    attemptIndex: number,
    attemptData: unknown
  ) => void;
  addTestSet: (testName: keyof StrengthPowerTestData, setData: unknown) => void;
  removeTestSet: (
    testName: keyof StrengthPowerTestData,
    setIndex: number
  ) => void;
  recalculateScores: () => void;

  // Core wizard actions
  initializeWizard: (athlete: VerifiedUser) => Promise<void>;
  loadExistingStats: (userId: string) => Promise<void>;
  updateFormSection: (
    section: keyof Omit<WizardFormData, "injuries">,
    data: Partial<unknown>
  ) => void;

  // Injury management
  updateInjuries: (injuries: InjuryInput[]) => void;
  addInjury: () => void;
  removeInjury: (index: number) => void;
  updateInjury: (index: number, injury: Partial<InjuryInput>) => void;

  // Navigation
  validateCurrentStep: () => boolean;
  navigateToStep: (step: number) => boolean;
  nextStep: () => boolean;
  previousStep: () => void;
  markStepComplete: (step: number) => void;

  // Persistence
  saveDraft: () => Promise<boolean>;
  autoSave: () => Promise<void>;
  submitStats: () => Promise<boolean>;

  // Utility
  resetWizard: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export type StatsWizardStore = StatsWizardState & StatsWizardActions;
