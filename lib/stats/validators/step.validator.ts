// ============================================
// FILE: validators/step.validator.ts
// Step-by-step wizard validation logic
// ============================================

import { WizardFormData, StepConfig } from "@/types/wizard.types";
import { validateBasicMetrics } from "./basic-metrics.validator";
import { validateInjuries } from "./injury.validator";
import { ValidationError } from "@/lib/utils/error-handler";

/**
 * Validates a specific wizard step
 */
export function validateStep(
  stepNumber: number,
  stepConfig: StepConfig,
  formData: WizardFormData
): { isValid: boolean; errors: string[] } {
  // Instruction steps are always valid
  if (stepConfig.type === "instruction") {
    return { isValid: true, errors: [] };
  }

  const errors: string[] = [];

  switch (stepConfig.section) {
    case "basicMetrics": {
      const validationError = validateBasicMetrics(formData.basicMetrics);
      if (validationError?.fields) {
        Object.values(validationError.fields).forEach((fieldErrors) => {
          errors.push(...fieldErrors);
        });
      }
      break;
    }

    case "strengthPower": {
      // Check if at least one test has data
      const hasAnyStrengthData = Object.values(formData.strengthPower).some(
        (value) => {
          if (typeof value === "object" && value !== null) {
            return (
              ("attempts" in value && value.attempts.length > 0) ||
              ("sets" in value && value.sets.length > 0)
            );
          }
          return value !== 0 && value !== null;
        }
      );

      if (!hasAnyStrengthData) {
        errors.push("At least one strength test must be completed");
      }
      break;
    }

    case "speedAgility": {
      // Check if at least one speed test has data
      const hasAnySpeedData = Object.entries(formData.speedAgility).some(
        ([key, value]) => {
          if (key === "sprintSpeed") return value !== 0;
          return value !== null && value !== undefined;
        }
      );

      if (!hasAnySpeedData) {
        errors.push("At least one speed/agility test must be completed");
      }
      break;
    }

    case "staminaRecovery": {
      const { vo2Max, flexibility, recoveryTime } = formData.staminaRecovery;
      const hasAnyStaminaData =
        vo2Max !== 0 || flexibility !== 0 || recoveryTime !== 0;

      if (!hasAnyStaminaData) {
        errors.push("At least one stamina/recovery metric must be provided");
      }
      break;
    }

    case "injuries": {
      const validationError = validateInjuries(formData.injuries);
      if (validationError?.fields) {
        Object.values(validationError.fields).forEach((fieldErrors) => {
          errors.push(...fieldErrors);
        });
      }
      break;
    }

    case "review": {
      // Final review validation - ensure critical data is present
      if (!formData.basicMetrics.height && !formData.basicMetrics.weight) {
        errors.push("Height or weight must be provided");
      }
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a step can be skipped (optional sections)
 */
export function isStepOptional(stepConfig: StepConfig): boolean {
  // Injuries and some stamina metrics are optional
  return (
    stepConfig.section === "injuries" ||
    stepConfig.section === "staminaRecovery"
  );
}

/**
 * Get validation summary for all completed steps
 */
export function getValidationSummary(
  completedSteps: Set<number>,
  stepSections: Record<number, StepConfig>,
  formData: WizardFormData
): {
  totalSteps: number;
  validSteps: number;
  invalidSteps: number;
  errors: Record<number, string[]>;
} {
  const errors: Record<number, string[]> = {};
  let validSteps = 0;
  let invalidSteps = 0;

  completedSteps.forEach((stepNumber) => {
    const stepConfig = stepSections[stepNumber];
    if (!stepConfig) return;

    const validation = validateStep(stepNumber, stepConfig, formData);

    if (validation.isValid) {
      validSteps++;
    } else {
      invalidSteps++;
      errors[stepNumber] = validation.errors;
    }
  });

  return {
    totalSteps: completedSteps.size,
    validSteps,
    invalidSteps,
    errors,
  };
}
