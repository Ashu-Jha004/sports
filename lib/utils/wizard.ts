// lib/utils/wizard.ts

import type { ProfileFormData, WizardStep } from "@/types/profile";

/**
 * Wizard configuration constants
 */
export const WIZARD_CONFIG = {
  NAVIGATION_DELAY: 100,
  VALIDATION_TIMEOUT: 5000,
  AUTO_SAVE_DELAY: 1000,
} as const;

/**
 * Validates if form data has meaningful changes
 */
export const validateFormDataChanges = (formData: ProfileFormData): boolean => {
  const requiredFields = [
    "city",
    "country",
    "username",
    "firstName",
    "lastName",
  ];
  return requiredFields.some(
    (field) => formData[field as keyof ProfileFormData]
  );
};

/**
 * Creates step information object for navigation
 */
export const createWizardStepInfo = (
  steps: readonly WizardStep[],
  currentStep: number,
  allowStepSkipping: boolean
) => {
  const currentStepData = steps.find((step) => step.id === currentStep);

  return {
    currentStepInfo: currentStepData,
    canGoNext: currentStepData?.isValid || allowStepSkipping,
    canGoPrevious: currentStep > 1,
    isCompleted: steps[4]?.isCompleted || false,
  };
};
