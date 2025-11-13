// ============================================
// ANTHROPOMETRIC MEASUREMENTS (Global/Reusable)
// ============================================

export interface AnthropometricData {
  thighGirth?: number; // cm
  calfGirth?: number; // cm
  armSpan?: number; // cm
  footLength?: number; // cm
  standingHeight?: number; // cm (if different from basic metrics)
}

// ============================================
// TEST EQUIPMENT REQUIREMENTS
// ============================================

export const TEST_EQUIPMENT = {
  Ten_Meter_Sprint: ["Stopwatch", "Measuring tape", "2 cones/markers"],
  Fourty_Meter_Dash: ["Stopwatch", "Measuring tape", "2 cones/markers"],
  Repeated_Sprint_Ability: ["Stopwatch", "Measuring tape", "Multiple cones"],
  T_Test: ["Stopwatch", "4 cones", "Measuring tape"],
  Illinois_Agility_Test: ["Stopwatch", "8 cones", "Measuring tape"],
  Five_0_Five_Agility_Test: ["Stopwatch", "2 cones", "Measuring tape"],
  Visual_Reaction_Speed_Drill: ["Stopwatch", "Light/sound source (phone app)", "Cones"],
  Standing_Long_Jump: ["Measuring tape", "2 markers/cones"],
  Long_Jump: ["Measuring tape", "Runway space", "Sand pit or safe landing area"],
  Reactive_Agility_T_Test: ["Stopwatch", "4 cones", "Partner for cues"],
} as const;

// ============================================
// VALIDATION RANGES (Based on Research)
// ============================================

export const VALIDATION_RANGES = {
  // Sprint times in seconds
  tenMeterSprint: { min: 1.5, max: 4.0 }, // Elite: 1.6-1.8s, Average: 2.4-3.1s
  fourtyMeterDash: { min: 4.0, max: 8.0 }, // Elite: ~4.6s, Average: 5-6.5s
  repeatedSprintSingle: { min: 3.5, max: 8.0 }, // 30m sprint times
  
  // Agility times in seconds
  tTest: { min: 8.0, max: 15.0 }, // Elite: 9-10s, Average: 11-13s
  illinoisTest: { min: 12.0, max: 22.0 }, // Elite: 14-15s, Average: 16-18s
  five05Test: { min: 2.0, max: 5.0 }, // Directional change test
  
  // Reaction time in milliseconds
  reactionTime: { min: 150, max: 500 }, // Human reaction: 200-300ms average
  
  // Jump distances in centimeters
  standingLongJump: { min: 100, max: 350 }, // Elite: 280-320cm, Average: 180-220cm
  longJump: { min: 200, max: 900 }, // With run-up
  
  // Anthropometric measurements in cm
  thighGirth: { min: 30, max: 80 },
  calfGirth: { min: 25, max: 60 },
  armSpan: { min: 140, max: 230 },
  footLength: { min: 20, max: 35 },
} as const;

// ============================================
// 1. TEN METER SPRINT TEST
// ============================================

export interface TenMeterSprintAttempt {
  attemptNumber: number;
  sprintTime: number; // seconds
  anthropometricData?: AnthropometricData;
  standingLongJump?: number; // cm (optional, for correlation)
  notes?: string;
}

export interface TenMeterSprintTest {
  attempts: TenMeterSprintAttempt[];
  bestTime?: number; // Auto-calculated
  meanTime?: number; // Auto-calculated
  anthropometricData?: AnthropometricData; // Shared across attempts
}

// ============================================
// 2. FOURTY METER DASH TEST
// ============================================

export interface FourtyMeterDashAttempt {
  attemptNumber: number;
  splitTime_0_10m?: number; // Optional 10m split
  splitTime_0_20m?: number; // Optional 20m split
  splitTime_0_30m?: number; // Optional 30m split
  totalTime_0_40m: number; // Required total time
  notes?: string;
}

export interface FourtyMeterDashTest {
  attempts: FourtyMeterDashAttempt[];
  bestTime?: number; // Auto-calculated from totalTime_0_40m
  meanTime?: number; // Auto-calculated
}

// ============================================
// 3. REPEATED SPRINT ABILITY (RSA) TEST
// 6 x 30m sprints with 20s rest
// ============================================

export interface RepeatedSprintAbilityTest {
  sprintTimes: number[]; // Array of 6 sprint times (30m each)
  restInterval: number; // seconds (typically 20s)
  
  // Auto-calculated fields
  bestTime?: number;
  worstTime?: number;
  meanTime?: number;
  totalTime?: number;
  fatigueIndex?: number; // (worst - best) / best × 100
  percentDecrement?: number; // 100 - (total / (best × 6) × 100)
}

// ============================================
// 4. T-TEST (Agility)
// ============================================

export interface TTestAttempt {
  attemptNumber: number;
  completionTime: number; // seconds
  notes?: string;
}

export interface TTestData {
  attempts: TTestAttempt[];
  bestTime?: number;
  meanTime?: number;
}

// ============================================
// 5. ILLINOIS AGILITY TEST
// ============================================

export interface IllinoisAgilityAttempt {
  attemptNumber: number;
  completionTime: number; // seconds
  notes?: string;
}

export interface IllinoisAgilityTest {
  attempts: IllinoisAgilityAttempt[];
  bestTime?: number;
  meanTime?: number;
}

// ============================================
// 6. 505 AGILITY TEST
// ============================================

export interface Five05AgilityAttempt {
  attemptNumber: number;
  leftTurnTime: number; // Time turning to left
  rightTurnTime: number; // Time turning to right
  notes?: string;
}

export interface Five05AgilityTest {
  attempts: Five05AgilityAttempt[];
  bestLeftTime?: number;
  bestRightTime?: number;
  meanLeftTime?: number;
  meanRightTime?: number;
  asymmetryIndex?: number; // Difference between left/right
}

// ============================================
// 7. VISUAL REACTION SPEED DRILL (Optional)
// ============================================

export interface VisualReactionAttempt {
  attemptNumber: number;
  reactionTime: number; // milliseconds
  stimulus: "visual" | "audio" | "mixed";
  notes?: string;
}

export interface VisualReactionSpeedDrill {
  attempts: VisualReactionAttempt[];
  bestReactionTime?: number;
  meanReactionTime?: number;
}

// ============================================
// 8. STANDING LONG JUMP
// ============================================

export interface StandingLongJumpAttempt {
  attemptNumber: number;
  distance: number; // cm
  notes?: string;
}

export interface StandingLongJumpTest {
  attempts: StandingLongJumpAttempt[];
  bestDistance?: number;
  meanDistance?: number;
}

// ============================================
// 9. LONG JUMP (Running Start - Optional)
// ============================================

export interface LongJumpAttempt {
  attemptNumber: number;
  distance: number; // cm
  runupSteps?: number; // Optional
  notes?: string;
}

export interface LongJumpTest {
  attempts: LongJumpAttempt[];
  bestDistance?: number;
  meanDistance?: number;
}

// ============================================
// 10. REACTIVE AGILITY T-TEST (Advanced/Optional)
// ============================================

export interface ReactiveAgilityAttempt {
  attemptNumber: number;
  completionTime: number; // seconds
  correctResponseRate?: number; // % (optional)
  notes?: string;
}

export interface ReactiveAgilityTTest {
  attempts: ReactiveAgilityAttempt[];
  bestTime?: number;
  meanTime?: number;
  averageAccuracy?: number; // % correct responses
}

// ============================================
// OVERALL SPEED & AGILITY DATA STRUCTURE
// (Matches Prisma Model)
// ============================================

export interface SpeedAndAgilityData {
  id?: string;
  statId?: string;
  
  // Overall calculated scores (0-100)
  sprintSpeed: number;
  
  // Individual test data (stored as JSON in Prisma)
  Ten_Meter_Sprint?: TenMeterSprintTest;
  Fourty_Meter_Dash?: FourtyMeterDashTest;
  Repeated_Sprint_Ability?: RepeatedSprintAbilityTest;
  Five_0_Five_Agility_Test?: Five05AgilityTest;
  T_Test?: TTestData;
  Illinois_Agility_Test?: IllinoisAgilityTest;
  Visual_Reaction_Speed_Drill?: VisualReactionSpeedDrill;
  Long_Jump?: LongJumpTest;
  Reactive_Agility_T_Test?: ReactiveAgilityTTest;
  Standing_Long_Jump?: StandingLongJumpTest;
  
  // Legacy fields (JSON) - kept for backward compatibility
  acceleration?: any;
  agility?: any;
  reactionTime?: any;
  balance?: any;
  coordination?: any;
  
  // Shared anthropometric data
  anthropometricData?: AnthropometricData;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// TEST CATEGORIES (For UI Organization)
// ============================================

export const TEST_CATEGORIES = {
  sprint: {
    label: "Sprint & Acceleration",
    tests: ["Ten_Meter_Sprint", "Fourty_Meter_Dash", "Repeated_Sprint_Ability"],
    priority: "high",
  },
  agility: {
    label: "Agility & Change of Direction",
    tests: ["T_Test", "Illinois_Agility_Test", "Five_0_Five_Agility_Test"],
    priority: "high",
  },
  power: {
    label: "Explosive Power",
    tests: ["Standing_Long_Jump", "Long_Jump"],
    priority: "medium",
  },
  reaction: {
    label: "Reaction & Advanced Tests",
    tests: ["Visual_Reaction_Speed_Drill", "Reactive_Agility_T_Test"],
    priority: "optional",
  },
} as const;

// ============================================
// TYPE GUARDS & UTILITIES
// ============================================

export type SpeedAgilityTestName = 
  | "Ten_Meter_Sprint"
  | "Fourty_Meter_Dash"
  | "Repeated_Sprint_Ability"
  | "Five_0_Five_Agility_Test"
  | "T_Test"
  | "Illinois_Agility_Test"
  | "Visual_Reaction_Speed_Drill"
  | "Long_Jump"
  | "Reactive_Agility_T_Test"
  | "Standing_Long_Jump";

export type SpeedAgilityTestData =
  | TenMeterSprintTest
  | FourtyMeterDashTest
  | RepeatedSprintAbilityTest
  | Five05AgilityTest
  | TTestData
  | IllinoisAgilityTest
  | VisualReactionSpeedDrill
  | LongJumpTest
  | ReactiveAgilityTTest
  | StandingLongJumpTest;
