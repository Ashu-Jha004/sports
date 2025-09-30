// lib/utils/progress-bar.ts

import type { WizardStep } from "@/types/profile";

/**
 * =============================================================================
 * PROGRESS BAR UTILITIES & HELPERS
 * =============================================================================
 */

/**
 * Step status type
 */
type StepStatus = "completed" | "current" | "upcoming";

/**
 * Progress calculation result
 */
interface ProgressData {
  readonly completedSteps: number;
  readonly percentage: number;
  readonly validSteps: number;
}

/**
 * Gets the status of a step relative to current step
 */
export const getStepStatus = (
  stepId: number,
  currentStep: number
): StepStatus => {
  if (stepId < currentStep) return "completed";
  if (stepId === currentStep) return "current";
  return "upcoming";
};

/**
 * Gets CSS classes for step indicator
 */
export const getStepClasses = (stepId: number, currentStep: number): string => {
  const status = getStepStatus(stepId, currentStep);
  const baseClasses =
    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ease-in-out text-sm font-medium";

  switch (status) {
    case "completed":
      return `${baseClasses} bg-green-500 border-green-500 text-white shadow-lg`;
    case "current":
      return `${baseClasses} bg-blue-500 border-blue-500 text-white shadow-lg ring-4 ring-blue-200`;
    case "upcoming":
      return `${baseClasses} bg-gray-100 border-gray-300 text-gray-500`;
    default:
      return baseClasses;
  }
};

/**
 * Gets CSS classes for connector lines between steps
 */
export const getConnectorClasses = (
  stepId: number,
  currentStep: number
): string => {
  const isCompleted = stepId < currentStep;
  return `flex-1 h-1 mx-2 transition-all duration-500 ease-in-out ${
    isCompleted ? "bg-green-500" : "bg-gray-200"
  }`;
};

/**
 * Gets CSS classes for step titles
 */
export const getStepTitleClasses = (
  stepId: number,
  currentStep: number
): string => {
  const status = getStepStatus(stepId, currentStep);
  const baseClasses =
    "text-xs font-medium mt-2 transition-colors duration-300 text-center";

  switch (status) {
    case "completed":
      return `${baseClasses} text-green-600`;
    case "current":
      return `${baseClasses} text-blue-600`;
    case "upcoming":
      return `${baseClasses} text-gray-500`;
    default:
      return baseClasses;
  }
};

/**
 * Calculates overall progress data
 */
export const calculateProgress = (
  steps: readonly WizardStep[]
): ProgressData => {
  const completedSteps = steps.filter((step) => step.isCompleted).length;
  const validSteps = steps.filter((step) => step.isValid).length;
  const totalSteps = steps.length;

  return {
    completedSteps,
    validSteps,
    percentage: (completedSteps / totalSteps) * 100,
  };
};

/**
 * Gets description for a specific step
 */
export const getStepDescription = (stepId: number): string => {
  const descriptions: Record<number, string> = {
    1: "Enter your location details including city, country, and state.",
    2: "Provide your personal information such as date of birth and bio.",
    3: "Select your primary sport from the available options.",
    4: "Allow location access to automatically detect your coordinates.",
    5: "Review all information and submit your profile.",
  };

  return descriptions[stepId] || "Complete this step to continue.";
};

/**
 * Gets step progress information for accessibility
 */
export const getStepAccessibilityInfo = (
  stepId: number,
  currentStep: number,
  steps: readonly WizardStep[]
): string => {
  const step = steps.find((s) => s.id === stepId);
  const status = getStepStatus(stepId, currentStep);

  if (!step) return "";

  const statusText = {
    completed: "completed",
    current: "current",
    upcoming: "upcoming",
  }[status];

  return `Step ${stepId}: ${step.title}, ${statusText}${
    step.isValid ? ", valid" : ""
  }`;
};

/**
 * Calculates estimated completion time based on current progress
 */
export const getEstimatedCompletionTime = (
  currentStep: number,
  totalSteps: number
): string => {
  const remainingSteps = totalSteps - currentStep;
  const estimatedMinutes = remainingSteps * 2; // 2 minutes per step estimate

  if (estimatedMinutes <= 0) return "Complete!";
  if (estimatedMinutes < 5) return "Almost done!";
  if (estimatedMinutes < 10) return `~${estimatedMinutes} minutes remaining`;

  return `~${Math.ceil(estimatedMinutes / 5) * 5} minutes remaining`;
};

/**
 * Progress bar configuration constants
 */
export const PROGRESS_CONFIG = {
  ANIMATION_DURATION: 700,
  CONNECTOR_HEIGHT: 4,
  STEP_SIZE: {
    DESKTOP: 32,
    MOBILE: 24,
  },
  COLORS: {
    COMPLETED: "bg-green-500",
    CURRENT: "bg-blue-500",
    UPCOMING: "bg-gray-100",
    CONNECTOR_ACTIVE: "bg-green-500",
    CONNECTOR_INACTIVE: "bg-gray-200",
  },
} as const;
