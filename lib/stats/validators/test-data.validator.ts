// ============================================
// FILE: validators/test-data.validator.ts
// Validation for strength and speed test data
// ============================================

import { ValidationError } from "@/lib/utils/error-handler";

/**

Realistic constraints for test inputs based on human performance ranges
*/
export const TEST_CONSTRAINTS = {
  // Sprint times (seconds)
  sprint: {
    tenMeter: { min: 1.0, max: 5.0 },
    fortyMeter: { min: 4.0, max: 15.0 },
  },
  // Jump distances (meters)
  jump: {
    longJump: { min: 0.5, max: 9.0 },
    standingLongJump: { min: 0.3, max: 4.0 },
  },
  // Agility times (seconds)
  agility: {
    tTest: { min: 5.0, max: 30.0 },
    illinoisAgility: { min: 10.0, max: 40.0 },
    five0Five: { min: 1.5, max: 10.0 },
  },
  // Reaction times (milliseconds)
  reaction: {
    visualReaction: { min: 100, max: 1000 },
  },
  // Strength tests
  strength: {
    reps: { min: 1, max: 500 }, // Max reps for endurance tests
    load: { min: 0, max: 500 }, // kg - maximum realistic for athletes
    restTime: { min: 0, max: 600 }, // seconds - max 10 minutes
  },
  // Stamina tests
  stamina: {
    vo2Max: { min: 10, max: 90 }, // ml/kg/min
    flexibility: { min: 0, max: 100 }, // score
    recoveryTime: { min: 0, max: 300 }, // seconds
  },
} as const;

/**

Validates numeric test value against constraints
*/
export function validateTestValue(
  value: number,
  constraint: { min: number; max: number },
  fieldName: string
): string | null {
  if (value < constraint.min) {
    return `${fieldName} must be at least ${constraint.min}`;
  }
  if (value > constraint.max) {
    return `${fieldName} cannot exceed ${constraint.max}`;
  }
  return null;
}

/**

Validates strength test attempt data
*/
export function validateStrengthAttempt(
  attemptData: any,
  testType: "reps" | "load" | "time"
): ValidationError | null {
  const errors: Record<string, string[]> = {};

  if (testType === "reps" && attemptData.reps !== undefined) {
    const error = validateTestValue(
      attemptData.reps,
      TEST_CONSTRAINTS.strength.reps,
      "Reps"
    );
    if (error) errors.reps = [error];
  }

  if (testType === "load" && attemptData.load !== undefined) {
    const error = validateTestValue(
      attemptData.load,
      TEST_CONSTRAINTS.strength.load,
      "Load"
    );
    if (error) errors.load = [error];
  }

  if (attemptData.restAfter !== undefined) {
    const error = validateTestValue(
      attemptData.restAfter,
      TEST_CONSTRAINTS.strength.restTime,
      "Rest time"
    );
    if (error) errors.restAfter = [error];
  }

  if (Object.keys(errors).length > 0) {
    return new ValidationError("Strength attempt validation failed", errors);
  }

  return null;
}

/**

Validates sprint test data
*/
export function validateSprintData(
  distance: "10m" | "40m",
  timeInSeconds: number
): string | null {
  const constraint =
    distance === "10m"
      ? TEST_CONSTRAINTS.sprint.tenMeter
      : TEST_CONSTRAINTS.sprint.fortyMeter;

  return validateTestValue(
    timeInSeconds,
    constraint,
    `${distance} sprint time`
  );
}

/**

Validates agility test data
*/
export function validateAgilityData(
  testType: "tTest" | "illinois" | "505",
  timeInSeconds: number
): string | null {
  let constraint;
  let testName;

  switch (testType) {
    case "tTest":
      constraint = TEST_CONSTRAINTS.agility.tTest;
      testName = "T-Test";
      break;
    case "illinois":
      constraint = TEST_CONSTRAINTS.agility.illinoisAgility;
      testName = "Illinois Agility Test";
      break;
    case "505":
      constraint = TEST_CONSTRAINTS.agility.five0Five;
      testName = "5-0-5 Agility Test";
      break;
  }

  return validateTestValue(timeInSeconds, constraint, testName);
}

/**

Validates stamina/recovery data
*/
export function validateStaminaData(data: {
  vo2Max?: number;
  flexibility?: number;
  recoveryTime?: number;
}): ValidationError | null {
  const errors: Record<string, string[]> = {};

  if (data.vo2Max !== undefined) {
    const error = validateTestValue(
      data.vo2Max,
      TEST_CONSTRAINTS.stamina.vo2Max,
      "VO2 Max"
    );
    if (error) errors.vo2Max = [error];
  }

  if (data.flexibility !== undefined) {
    const error = validateTestValue(
      data.flexibility,
      TEST_CONSTRAINTS.stamina.flexibility,
      "Flexibility"
    );
    if (error) errors.flexibility = [error];
  }

  if (data.recoveryTime !== undefined) {
    const error = validateTestValue(
      data.recoveryTime,
      TEST_CONSTRAINTS.stamina.recoveryTime,
      "Recovery Time"
    );
    if (error) errors.recoveryTime = [error];
  }

  if (Object.keys(errors).length > 0) {
    return new ValidationError("Stamina data validation failed", errors);
  }

  return null;
}
