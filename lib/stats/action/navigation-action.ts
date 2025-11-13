// ============================================
// FILE: actions/navigation.actions.ts
// Wizard navigation with validation
// ============================================

import type { StepConfig } from "@/types/wizard.types";
import { validateStep } from "../validators/step.validator";

/**
 * Creates navigation-related actions
 */
export function createNavigationActions(
  getState: () => any,
  setState: (partial: any) => void
) {
  return {
    /**
     * Validate current step
     */
    validateCurrentStep: (): boolean => {
      const { currentStep, stepSections, formData } = getState();
      const stepConfig: StepConfig = stepSections[currentStep];

      if (!stepConfig) {
        console.warn(`⚠️ No config found for step ${currentStep}`);
        return false;
      }

      // Instruction steps are always valid
      if (stepConfig.type === "instruction") {
        return true;
      }

      const validation = validateStep(currentStep, stepConfig, formData);

      // Update validation state
      setState({
        stepValidation: {
          ...getState().stepValidation,
          [currentStep]: validation.isValid,
        },
        stepErrors: {
          ...getState().stepErrors,
          [currentStep]: validation.errors,
        },
      });

      if (!validation.isValid) {
        console.warn(
          `⚠️ Step ${currentStep} validation failed:`,
          validation.errors
        );
      }

      return validation.isValid;
    },

    /**
     * Navigate to specific step
     */
    navigateToStep: (step: number): boolean => {
      const { totalSteps } = getState();

      if (step < 1 || step > totalSteps) {
        console.error(`❌ Invalid step number: ${step}`);
        return false;
      }

      console.log(`🧭 Navigating to step ${step}`);
      setState({ currentStep: step });
      return true;
    },

    /**
     * Move to next step
     */
    nextStep: (): boolean => {
      const state = getState();
      const { currentStep, totalSteps } = state;

      // Validate before moving forward
      if (!state.validateCurrentStep()) {
        console.warn("⚠️ Cannot proceed: current step validation failed");
        return false;
      }

      // Mark current step as complete
      state.markStepComplete(currentStep);

      // Move to next step if available
      if (currentStep < totalSteps) {
        setState({ currentStep: currentStep + 1 });
        console.log(`✅ Moved to step ${currentStep + 1}`);
        return true;
      }

      console.log("ℹ️ Already on final step");
      return false;
    },

    /**
     * Move to previous step
     */
    previousStep: (): void => {
      const { currentStep } = getState();

      if (currentStep > 1) {
        setState({ currentStep: currentStep - 1 });
        console.log(`⬅️ Moved back to step ${currentStep - 1}`);
      } else {
        console.log("ℹ️ Already on first step");
      }
    },

    /**
     * Mark step as complete
     */
    markStepComplete: (step: number): void => {
      const { completedSteps } = getState();
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(step);

      setState({ completedSteps: newCompletedSteps });
      console.log(`✅ Step ${step} marked as complete`);
    },
  };
}
