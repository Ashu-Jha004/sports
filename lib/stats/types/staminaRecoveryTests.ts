// ============================================
// STAMINA & RECOVERY TEST TYPE DEFINITIONS
// ============================================

// ============================================
// CARDIOVASCULAR ENDURANCE TESTS
// ============================================

export interface BeepTestAttempt {
  attemptNumber: number;
  finalLevel: number;
  finalShuttle: number;
  totalShuttles?: number;
  testDate?: string;
  notes?: string;
}

export interface BeepTest {
  attempts: BeepTestAttempt[];
  bestAttempt?: number; // Index of best attempt
  calculatedVO2Max?: number; // From best attempt
  estimatedDistance?: number; // Total meters covered
}

export interface CooperTestAttempt {
  attemptNumber: number;
  distanceCovered: number; // meters
  testDate?: string;
  weatherConditions?: string;
  surfaceType?: "track" | "grass" | "treadmill" | "other";
  notes?: string;
}

export interface CooperTest {
  attempts: CooperTestAttempt[];
  bestAttempt?: number;
  calculatedVO2Max?: number;
  averageDistance?: number;
}

// ============================================
// FLEXIBILITY TESTS
// ============================================

export interface SitAndReachAttempt {
  attemptNumber: number;
  reachDistance: number; // cm, +/- from toes (0 = touching toes)
  notes?: string;
}

export interface SitAndReachTest {
  attempts: SitAndReachAttempt[];
  bestReach?: number; // cm
  averageReach?: number;
  flexibilityScore?: number; // 0-100
}

export interface ActiveLegRaiseAttempt {
  attemptNumber: number;
  leftLegAngle?: number; // degrees from horizontal
  rightLegAngle?: number;
  leftLegHeight?: number; // cm from ground (alternative measurement)
  rightLegHeight?: number;
  notes?: string;
}

export interface ActiveLegRaiseTest {
  attempts: ActiveLegRaiseAttempt[];
  bestLeftAngle?: number;
  bestRightAngle?: number;
  asymmetryScore?: number; // Difference between left/right
  flexibilityScore?: number; // 0-100
}

export interface ShoulderRotationAttempt {
  attemptNumber: number;
  gripWidth: number; // cm between hands for successful rotation
  notes?: string;
}

export interface ShoulderRotationTest {
  attempts: ShoulderRotationAttempt[];
  bestGripWidth?: number;
  shoulderMobilityScore?: number; // 0-100
  // Required for score calculation
  anthropometricData?: {
    shoulderWidth?: number; // cm
    armSpan?: number; // cm
  };
}

export interface KneeToWallAttempt {
  attemptNumber: number;
  leftFootDistance?: number; // cm from wall
  rightFootDistance?: number;
  notes?: string;
}

export interface KneeToWallTest {
  attempts: KneeToWallAttempt[];
  bestLeftDistance?: number;
  bestRightDistance?: number;
  asymmetryScore?: number;
  ankleMobilityScore?: number; // 0-100
}

// ============================================
// HEART RATE & RECOVERY TESTS
// ============================================

export interface RestingHeartRateAttempt {
  attemptNumber: number;
  measurementDate: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  inputMethod: "manual" | "device";
  // Manual input
  pulseCount15Sec?: number; // Count for 15 seconds
  // Device input
  heartRateBPM?: number;
  notes?: string;
}

export interface RestingHeartRateTest {
  attempts: RestingHeartRateAttempt[];
  averageRHR?: number; // BPM
  lowestRHR?: number;
  cardiovascularFitnessRating?: string; // Excellent/Good/Average/Poor
}

export interface HeartRateRecoveryAttempt {
  attemptNumber: number;
  testDate?: string;
  // Pre-exercise
  restingHR: number; // BPM
  // Exercise protocol (standardized 3-min step test)
  exerciseProtocol: "step-test-3min";
  peakHR: number; // BPM immediately after exercise
  // Recovery measurements
  inputMethod: "manual" | "device";
  // Manual pulse counts (15-sec × 4)
  recovery1MinPulseCount?: number;
  recovery2MinPulseCount?: number;
  recovery3MinPulseCount?: number;
  // Device readings
  recovery1MinHR?: number; // BPM
  recovery2MinHR?: number;
  recovery3MinHR?: number;
  notes?: string;
}

export interface HeartRateRecoveryTest {
  attempts: HeartRateRecoveryAttempt[];
  bestRecoveryAttempt?: number;
  averageRecoveryRate?: number; // BPM drop per minute
  recoveryEfficiencyScore?: number; // 0-100
}

export interface PeakHeartRateEntry {
  recordedDate: string;
  peakHR: number; // BPM
  activityType: string; // e.g., "Sprint training", "Match play"
  perceivedExertion: number; // 1-10 scale
  inputMethod: "manual" | "device";
  pulseCount15Sec?: number;
  notes?: string;
}

export interface PeakHeartRateTest {
  entries: PeakHeartRateEntry[];
  maxRecordedHR?: number;
  estimatedMaxHR?: number; // 220 - age (if age available)
  trainingZones?: {
    zone1: [number, number]; // 50-60% max
    zone2: [number, number]; // 60-70%
    zone3: [number, number]; // 70-80%
    zone4: [number, number]; // 80-90%
    zone5: [number, number]; // 90-100%
  };
}

// ============================================
// MAIN STAMINA & RECOVERY DATA STRUCTURE
// ============================================

export interface StaminaRecoveryData {
  // Legacy scalar fields (for backward compatibility)
  vo2Max: number;
  flexibility: number;
  recoveryTime: number;

  // Cardiovascular tests
  Beep_Test?: BeepTest;
  Cooper_Test?: CooperTest;

  // Flexibility tests
  Sit_and_Reach_Test?: SitAndReachTest;
  Active_Straight_Leg_Raise?: ActiveLegRaiseTest;
  Shoulder_External_Internal_Rotation?: ShoulderRotationTest;
  Knee_to_Wall_Test?: KneeToWallTest;

  // Heart rate tests
  Resting_Heart_Rate?: RestingHeartRateTest;
  Post_Exercise_Heart_Rate_Recovery?: HeartRateRecoveryTest;
  Peak_Heart_Rate?: PeakHeartRateTest;

  // Composite scores
  overallFlexibilityScore?: number; // 0-100
  cardiovascularFitnessScore?: number; // 0-100
  recoveryEfficiencyScore?: number; // 0-100

  // Anthropometric data (if needed for calculations)
  anthropometricData?: {
    height?: number; // cm
    weight?: number; // kg
    shoulderWidth?: number; // cm
    armSpan?: number; // cm
    legLength?: number; // cm
  };

  // Historical comparison
  previousTestDate?: string;
  improvements?: {
    vo2MaxChange?: number; // percentage
    flexibilityChange?: number; // percentage
    recoveryChange?: number; // percentage
  };
}

// ============================================
// HELPER TYPES
// ============================================

export type HeartRateInputMethod = "manual" | "device";
export type TimeOfDay = "morning" | "afternoon" | "evening";
export type SurfaceType = "track" | "grass" | "treadmill" | "other";
export type ExerciseProtocol = "step-test-3min";

// ============================================
// VALIDATION CONSTANTS
// ============================================

export const VALIDATION_RANGES = {
  beepTest: {
    level: { min: 1, max: 23 },
    shuttle: { min: 1, max: 16 },
  },
  cooperTest: {
    distance: { min: 500, max: 5000 }, // meters
  },
  sitAndReach: {
    distance: { min: -30, max: 50 }, // cm
  },
  legRaise: {
    angle: { min: 0, max: 180 }, // degrees
    height: { min: 0, max: 200 }, // cm
  },
  shoulderRotation: {
    gripWidth: { min: 20, max: 200 }, // cm
  },
  kneeToWall: {
    distance: { min: 0, max: 30 }, // cm
  },
  heartRate: {
    resting: { min: 30, max: 120 }, // BPM
    peak: { min: 100, max: 220 }, // BPM
    pulseCount15Sec: { min: 8, max: 55 }, // 15-second count
  },
  vo2Max: {
    min: 20,
    max: 85,
  },
};

// ============================================
// CLASSIFICATION THRESHOLDS
// ============================================

export const CLASSIFICATION_THRESHOLDS = {
  vo2Max: {
    excellent: 60,
    veryGood: 50,
    good: 40,
    fair: 30,
    // Below 30 = poor
  },
  restingHR: {
    excellent: 60,
    good: 70,
    average: 80,
    // Above 80 = needs improvement
  },
  flexibility: {
    excellent: 15, // cm past toes
    good: 5,
    average: 0,
    belowAverage: -5,
    // Below -5 = poor
  },
};
