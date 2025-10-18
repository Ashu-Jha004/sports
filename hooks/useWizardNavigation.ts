import { useCallback } from "react";
import { useStatsWizardStore } from "@/store/statsWizardStore";

interface UseWizardNavigationReturn {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  currentStepConfig: {
    section: string;
    type: "instruction" | "form";
    title: string;
  };
  canGoNext: boolean;
  canGoPrevious: boolean;
  progressPercentage: number;
  goToStep: (step: number) => boolean;
  nextStep: () => boolean;
  previousStep: () => void;
  isStepCompleted: (step: number) => boolean;
  isCurrentStep: (step: number) => boolean;
}

export const useWizardNavigation = (): UseWizardNavigationReturn => {
  const {
    currentStep,
    totalSteps,
    completedSteps,
    stepSections,
    navigateToStep,
    nextStep,
    previousStep,
    validateCurrentStep,
  } = useStatsWizardStore();

  const currentStepConfig = stepSections[currentStep];
  const canGoNext = currentStep < totalSteps;
  const canGoPrevious = currentStep > 1;
  const progressPercentage = Math.round(
    (completedSteps.size / totalSteps) * 100
  );

  const goToStep = useCallback(
    (step: number) => {
      // Allow navigation to current step or completed steps
      // Or next step if current step is valid
      if (
        step === currentStep ||
        completedSteps.has(step) ||
        (step === currentStep + 1 && validateCurrentStep())
      ) {
        return navigateToStep(step);
      }
      return false;
    },
    [currentStep, completedSteps, validateCurrentStep, navigateToStep]
  );

  const isStepCompleted = useCallback(
    (step: number) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  const isCurrentStep = useCallback(
    (step: number) => {
      return currentStep === step;
    },
    [currentStep]
  );

  return {
    currentStep,
    totalSteps,
    completedSteps,
    currentStepConfig,
    canGoNext,
    canGoPrevious,
    progressPercentage,
    goToStep,
    nextStep,
    previousStep,
    isStepCompleted,
    isCurrentStep,
  };
};
