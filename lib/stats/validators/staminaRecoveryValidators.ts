import { z } from "zod";
import { VALIDATION_RANGES } from "../types/staminaRecoveryTests";

// ============================================
// CARDIOVASCULAR TESTS VALIDATION
// ============================================

export const beepTestAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  finalLevel: z
    .number()
    .int()
    .min(VALIDATION_RANGES.beepTest.level.min)
    .max(VALIDATION_RANGES.beepTest.level.max),
  finalShuttle: z
    .number()
    .int()
    .min(VALIDATION_RANGES.beepTest.shuttle.min)
    .max(VALIDATION_RANGES.beepTest.shuttle.max),
  totalShuttles: z.number().int().positive().optional(),
  testDate: z.string().optional(),
  notes: z.string().optional(),
});

export const beepTestSchema = z.object({
  attempts: z.array(beepTestAttemptSchema).min(1),
  bestAttempt: z.number().int().optional(),
  calculatedVO2Max: z.number().optional(),
  estimatedDistance: z.number().optional(),
});

export const cooperTestAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  distanceCovered: z
    .number()
    .min(VALIDATION_RANGES.cooperTest.distance.min)
    .max(VALIDATION_RANGES.cooperTest.distance.max),
  testDate: z.string().optional(),
  weatherConditions: z.string().optional(),
  surfaceType: z.enum(["track", "grass", "treadmill", "other"]).optional(),
  notes: z.string().optional(),
});

export const cooperTestSchema = z.object({
  attempts: z.array(cooperTestAttemptSchema).min(1),
  bestAttempt: z.number().int().optional(),
  calculatedVO2Max: z.number().optional(),
  averageDistance: z.number().optional(),
});

// ============================================
// FLEXIBILITY TESTS VALIDATION
// ============================================

export const sitAndReachAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  reachDistance: z
    .number()
    .min(VALIDATION_RANGES.sitAndReach.distance.min)
    .max(VALIDATION_RANGES.sitAndReach.distance.max),
  notes: z.string().optional(),
});

export const sitAndReachTestSchema = z.object({
  attempts: z.array(sitAndReachAttemptSchema).min(1),
  bestReach: z.number().optional(),
  averageReach: z.number().optional(),
  flexibilityScore: z.number().min(0).max(100).optional(),
});

export const activeLegRaiseAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  leftLegAngle: z
    .number()
    .min(VALIDATION_RANGES.legRaise.angle.min)
    .max(VALIDATION_RANGES.legRaise.angle.max)
    .optional(),
  rightLegAngle: z
    .number()
    .min(VALIDATION_RANGES.legRaise.angle.min)
    .max(VALIDATION_RANGES.legRaise.angle.max)
    .optional(),
  leftLegHeight: z
    .number()
    .min(VALIDATION_RANGES.legRaise.height.min)
    .max(VALIDATION_RANGES.legRaise.height.max)
    .optional(),
  rightLegHeight: z
    .number()
    .min(VALIDATION_RANGES.legRaise.height.min)
    .max(VALIDATION_RANGES.legRaise.height.max)
    .optional(),
  notes: z.string().optional(),
});

export const activeLegRaiseTestSchema = z.object({
  attempts: z.array(activeLegRaiseAttemptSchema).min(1),
  bestLeftAngle: z.number().optional(),
  bestRightAngle: z.number().optional(),
  asymmetryScore: z.number().optional(),
  flexibilityScore: z.number().min(0).max(100).optional(),
});

export const shoulderRotationAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  gripWidth: z
    .number()
    .min(VALIDATION_RANGES.shoulderRotation.gripWidth.min)
    .max(VALIDATION_RANGES.shoulderRotation.gripWidth.max),
  notes: z.string().optional(),
});

export const shoulderRotationTestSchema = z.object({
  attempts: z.array(shoulderRotationAttemptSchema).min(1),
  bestGripWidth: z.number().optional(),
  shoulderMobilityScore: z.number().min(0).max(100).optional(),
  anthropometricData: z
    .object({
      shoulderWidth: z.number().positive().optional(),
      armSpan: z.number().positive().optional(),
    })
    .optional(),
});

export const kneeToWallAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  leftFootDistance: z
    .number()
    .min(VALIDATION_RANGES.kneeToWall.distance.min)
    .max(VALIDATION_RANGES.kneeToWall.distance.max)
    .optional(),
  rightFootDistance: z
    .number()
    .min(VALIDATION_RANGES.kneeToWall.distance.min)
    .max(VALIDATION_RANGES.kneeToWall.distance.max)
    .optional(),
  notes: z.string().optional(),
});

export const kneeToWallTestSchema = z.object({
  attempts: z.array(kneeToWallAttemptSchema).min(1),
  bestLeftDistance: z.number().optional(),
  bestRightDistance: z.number().optional(),
  asymmetryScore: z.number().optional(),
  ankleMobilityScore: z.number().min(0).max(100).optional(),
});

// ============================================
// HEART RATE TESTS VALIDATION
// ============================================

export const restingHeartRateAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  measurementDate: z.string(),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  inputMethod: z.enum(["manual", "device"]),
  pulseCount15Sec: z
    .number()
    .int()
    .min(VALIDATION_RANGES.heartRate.pulseCount15Sec.min)
    .max(VALIDATION_RANGES.heartRate.pulseCount15Sec.max)
    .optional(),
  heartRateBPM: z
    .number()
    .min(VALIDATION_RANGES.heartRate.resting.min)
    .max(VALIDATION_RANGES.heartRate.resting.max)
    .optional(),
  notes: z.string().optional(),
});

export const restingHeartRateTestSchema = z.object({
  attempts: z.array(restingHeartRateAttemptSchema).min(1),
  averageRHR: z.number().optional(),
  lowestRHR: z.number().optional(),
  cardiovascularFitnessRating: z.string().optional(),
});

export const heartRateRecoveryAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  testDate: z.string().optional(),
  restingHR: z
    .number()
    .min(VALIDATION_RANGES.heartRate.resting.min)
    .max(VALIDATION_RANGES.heartRate.resting.max),
  exerciseProtocol: z.literal("step-test-3min"),
  peakHR: z
    .number()
    .min(VALIDATION_RANGES.heartRate.peak.min)
    .max(VALIDATION_RANGES.heartRate.peak.max),
  inputMethod: z.enum(["manual", "device"]),
  recovery1MinPulseCount: z.number().int().optional(),
  recovery2MinPulseCount: z.number().int().optional(),
  recovery3MinPulseCount: z.number().int().optional(),
  recovery1MinHR: z.number().optional(),
  recovery2MinHR: z.number().optional(),
  recovery3MinHR: z.number().optional(),
  notes: z.string().optional(),
});

export const heartRateRecoveryTestSchema = z.object({
  attempts: z.array(heartRateRecoveryAttemptSchema).min(1),
  bestRecoveryAttempt: z.number().int().optional(),
  averageRecoveryRate: z.number().optional(),
  recoveryEfficiencyScore: z.number().min(0).max(100).optional(),
});

export const peakHeartRateEntrySchema = z.object({
  recordedDate: z.string(),
  peakHR: z
    .number()
    .min(VALIDATION_RANGES.heartRate.peak.min)
    .max(VALIDATION_RANGES.heartRate.peak.max),
  activityType: z.string().min(1),
  perceivedExertion: z.number().int().min(1).max(10),
  inputMethod: z.enum(["manual", "device"]),
  pulseCount15Sec: z.number().int().optional(),
  notes: z.string().optional(),
});

export const peakHeartRateTestSchema = z.object({
  entries: z.array(peakHeartRateEntrySchema).min(1),
  maxRecordedHR: z.number().optional(),
  estimatedMaxHR: z.number().optional(),
  trainingZones: z
    .object({
      zone1: z.tuple([z.number(), z.number()]),
      zone2: z.tuple([z.number(), z.number()]),
      zone3: z.tuple([z.number(), z.number()]),
      zone4: z.tuple([z.number(), z.number()]),
      zone5: z.tuple([z.number(), z.number()]),
    })
    .optional(),
});

// ============================================
// MAIN STAMINA RECOVERY DATA VALIDATION
// ============================================

export const staminaRecoveryDataSchema = z.object({
  vo2Max: z
    .number()
    .min(VALIDATION_RANGES.vo2Max.min)
    .max(VALIDATION_RANGES.vo2Max.max),
  flexibility: z
    .number()
    .min(VALIDATION_RANGES.sitAndReach.distance.min)
    .max(VALIDATION_RANGES.sitAndReach.distance.max),
  recoveryTime: z.number().min(30).max(600),

  Beep_Test: beepTestSchema.optional(),
  Cooper_Test: cooperTestSchema.optional(),
  Sit_and_Reach_Test: sitAndReachTestSchema.optional(),
  Active_Straight_Leg_Raise: activeLegRaiseTestSchema.optional(),
  Shoulder_External_Internal_Rotation: shoulderRotationTestSchema.optional(),
  Knee_to_Wall_Test: kneeToWallTestSchema.optional(),
  Resting_Heart_Rate: restingHeartRateTestSchema.optional(),
  Post_Exercise_Heart_Rate_Recovery: heartRateRecoveryTestSchema.optional(),
  Peak_Heart_Rate: peakHeartRateTestSchema.optional(),

  overallFlexibilityScore: z.number().min(0).max(100).optional(),
  cardiovascularFitnessScore: z.number().min(0).max(100).optional(),
  recoveryEfficiencyScore: z.number().min(0).max(100).optional(),

  anthropometricData: z
    .object({
      height: z.number().positive().optional(),
      weight: z.number().positive().optional(),
      shoulderWidth: z.number().positive().optional(),
      armSpan: z.number().positive().optional(),
      legLength: z.number().positive().optional(),
    })
    .optional(),

  previousTestDate: z.string().optional(),
  improvements: z
    .object({
      vo2MaxChange: z.number().optional(),
      flexibilityChange: z.number().optional(),
      recoveryChange: z.number().optional(),
    })
    .optional(),
});
