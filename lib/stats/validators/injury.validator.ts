// ============================================
// FILE: validators/injury.validator.ts
// Validation for injury records
// ============================================

import type { InjuryInput } from "@/types/wizard.types";
import { ValidationError, validateDate } from "@/lib/utils/error-handler";

/**
 * Allowed injury types (can be extended)
 */
export const INJURY_TYPES = [
  "Fracture",
  "Sprain",
  "Strain",
  "Tear",
  "Dislocation",
  "Concussion",
  "Contusion",
  "Tendinitis",
  "Other",
] as const;

/**
 * Common body parts for athletic injuries
 */
export const BODY_PARTS = [
  "Head",
  "Neck",
  "Shoulder",
  "Upper Arm",
  "Elbow",
  "Forearm",
  "Wrist",
  "Hand",
  "Fingers",
  "Chest",
  "Ribs",
  "Upper Back",
  "Lower Back",
  "Abdomen",
  "Hip",
  "Groin",
  "Thigh",
  "Knee",
  "Shin",
  "Calf",
  "Ankle",
  "Foot",
  "Toes",
] as const;

/**
 * Validates a single injury record
 */
export function validateInjury(injury: InjuryInput): ValidationError | null {
  const errors: Record<string, string[]> = {};

  // Required field validations
  if (!injury.type || injury.type.trim() === "") {
    errors.type = ["Injury type is required"];
  }

  if (!injury.bodyPart || injury.bodyPart.trim() === "") {
    errors.bodyPart = ["Body part is required"];
  }

  if (!injury.severity) {
    errors.severity = ["Severity is required"];
  }

  // Date validations
  const occurredDateError = validateDate(injury.occurredAt, "Occurred date");
  if (occurredDateError?.fields) {
    Object.assign(errors, occurredDateError.fields);
  }

  // Recovery date validation (if provided)
  if (injury.recoveredAt) {
    const recoveredDateError = validateDate(
      injury.recoveredAt,
      "Recovery date"
    );
    if (recoveredDateError?.fields) {
      Object.assign(errors, recoveredDateError.fields);
    }

    // Recovery date must be after occurrence date
    const occurredDate = new Date(injury.occurredAt);
    const recoveredDate = new Date(injury.recoveredAt);

    if (recoveredDate < occurredDate) {
      errors.recoveredAt = ["Recovery date must be after occurrence date"];
    }
  }

  // Recovery time validation
  if (injury.recoveryTime !== null) {
    if (injury.recoveryTime < 0) {
      errors.recoveryTime = ["Recovery time cannot be negative"];
    }
    if (injury.recoveryTime > 730) {
      // 2 years max
      errors.recoveryTime = ["Recovery time seems unrealistic (max 730 days)"];
    }
  }

  // Status validation
  if (!["active", "recovering", "recovered"].includes(injury.status)) {
    errors.status = ["Invalid injury status"];
  }

  // Business logic: recovered injuries must have recovery date
  if (injury.status === "recovered" && !injury.recoveredAt) {
    errors.recoveredAt = ["Recovery date is required for recovered injuries"];
  }

  if (Object.keys(errors).length > 0) {
    return new ValidationError("Injury validation failed", errors);
  }

  return null;
}

/**
 * Validates array of injuries
 */
export function validateInjuries(
  injuries: InjuryInput[]
): ValidationError | null {
  if (injuries.length === 0) {
    return null; // Empty is valid (no injuries)
  }

  const allErrors: Record<string, string[]> = {};

  injuries.forEach((injury, index) => {
    const error = validateInjury(injury);
    if (error?.fields) {
      Object.keys(error.fields).forEach((field) => {
        const key = `injury_${index}_${field}`;
        allErrors[key] = error.fields![field];
      });
    }
  });

  if (Object.keys(allErrors).length > 0) {
    return new ValidationError("Multiple injury validation errors", allErrors);
  }

  return null;
}

/**
 * Calculate total active injuries count
 */
export function getActiveInjuryCount(injuries: InjuryInput[]): number {
  return injuries.filter((injury) => injury.status === "active").length;
}

/**
 * Get severity distribution
 */
export function getInjurySeverityDistribution(injuries: InjuryInput[]): {
  mild: number;
  moderate: number;
  severe: number;
} {
  return injuries.reduce(
    (acc, injury) => {
      acc[injury.severity]++;
      return acc;
    },
    { mild: 0, moderate: 0, severe: 0 }
  );
}
