// ===============================================
// FILE: validators/basic-metrics.validator.ts
// Validation for basic athlete measurements
// ============================================

import type { BasicMetricsData } from "@/types/wizard.types";
import {
  ValidationError,
  validateNumericInput,
} from "@/lib/utils/error-handler";

/**
 * Realistic ranges for athlete measurements
 * Based on typical human ranges and athletic populations
 */
export const BASIC_METRICS_CONSTRAINTS = {
  height: {
    min: 120, // cm - minimum for young athletes
    max: 250, // cm - maximum realistic height
    fieldName: "Height",
  },
  weight: {
    min: 30, // kg - minimum for young athletes
    max: 200, // kg - maximum for heavyweight athletes
    fieldName: "Weight",
  },
  age: {
    min: 10, // years - minimum competitive age
    max: 100, // years - maximum realistic age
    fieldName: "Age",
  },
  bodyFat: {
    min: 3, // % - minimum healthy body fat
    max: 50, // % - maximum realistic for athletes
    fieldName: "Body Fat Percentage",
  },
} as const;

/**
 * Validates basic metrics data
 */
export function validateBasicMetrics(
  data: BasicMetricsData
): ValidationError | null {
  const errors: Record<string, string[]> = {};

  // Validate height
  if (data.height !== null) {
    const heightError = validateNumericInput(
      data.height,
      BASIC_METRICS_CONSTRAINTS.height
    );
    if (heightError?.fields) {
      Object.assign(errors, heightError.fields);
    }
  }

  // Validate weight
  if (data.weight !== null) {
    const weightError = validateNumericInput(
      data.weight,
      BASIC_METRICS_CONSTRAINTS.weight
    );
    if (weightError?.fields) {
      Object.assign(errors, weightError.fields);
    }
  }

  // Validate age
  if (data.age !== null) {
    const ageError = validateNumericInput(
      data.age,
      BASIC_METRICS_CONSTRAINTS.age
    );
    if (ageError?.fields) {
      Object.assign(errors, ageError.fields);
    }
  }

  // Validate body fat
  if (data.bodyFat !== null) {
    const bodyFatError = validateNumericInput(
      data.bodyFat,
      BASIC_METRICS_CONSTRAINTS.bodyFat
    );
    if (bodyFatError?.fields) {
      Object.assign(errors, bodyFatError.fields);
    }
  }

  // Check if at least one metric is provided
  const hasAnyMetric = Object.values(data).some((value) => value !== null);
  if (!hasAnyMetric) {
    errors.general = ["At least one metric must be provided"];
  }

  if (Object.keys(errors).length > 0) {
    return new ValidationError("Basic metrics validation failed", errors);
  }

  return null;
}

/**
 * Calculate BMI if height and weight are available
 */
export function calculateBMI(
  height: number | null,
  weight: number | null
): number | null {
  if (height === null || weight === null || height <= 0) {
    return null;
  }

  // BMI = weight (kg) / (height (m))^2
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Get BMI category for context
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}
