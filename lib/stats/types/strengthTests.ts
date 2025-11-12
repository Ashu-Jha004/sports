// ============================================
// STRENGTH & POWER TEST DATA STRUCTURES
// Equipment: Stopwatch, tape measure, chalk, weights, scale
// ============================================

// Base interfaces
export interface TestAttempt<T> {
  attemptNumber: number;
  data: T;
  notes?: string;
}

// ============================================
// JUMP TESTS (Wall + Chalk Method)
// ============================================

export interface CountermovementJumpData {
  standingReach: number; // cm (chalk mark on wall)
  jumpReach: number; // cm (highest chalk mark when jumping)
  jumpHeight?: number; // cm (auto-calculated: jumpReach - standingReach)
}

export interface CountermovementJumpTest {
  attempts: TestAttempt<CountermovementJumpData>[];
  bestAttempt?: number;
}

export interface LoadedSquatJumpData {
  load: number; // kg (weight held/worn)
  standingReach: number; // cm
  jumpReach: number; // cm
  jumpHeight?: number; // cm (calculated)
  flightTime?: number; // seconds (optional if using phone timer)
}

export interface LoadedSquatJumpTest {
  bodyWeight: number; // kg (for calculations)
  attempts: TestAttempt<LoadedSquatJumpData>[];
  bestAttempt?: number;
}

export interface DepthJumpData {
  dropHeight: number; // cm (height of box/platform)
  standingReach: number; // cm
  jumpReach: number; // cm
  jumpHeight?: number; // cm (calculated)
}

export interface DepthJumpTest {
  attempts: TestAttempt<DepthJumpData>[];
  bestAttempt?: number;
}

// ============================================
// UPPER BODY POWER
// ============================================

export interface BallisticBenchPressData {
  load: number; // kg
  reps: number; // in specified time
  timeLimit: number; // seconds (e.g., 120)
  completedInTime: boolean;
}

export interface BallisticBenchPressTest {
  attempts: TestAttempt<BallisticBenchPressData>[];
  bestAttempt?: number;
}

export interface PushUpData {
  reps: number; // max reps
  timeLimit: number; // seconds (typically 60)
  formQuality?: "strict" | "standard";
}

export interface PushUpTest {
  attempts: TestAttempt<PushUpData>[];
  bestAttempt?: number;
}

export interface BallisticPushUpData {
  reps: number; // in 2 minutes
  load: number; // kg (weighted vest/plate)
  timeUsed: number; // seconds (actual time taken)
}

export interface BallisticPushUpTest {
  attempts: TestAttempt<BallisticPushUpData>[];
  bestAttempt?: number;
}

// ============================================
// LOWER BODY STRENGTH
// ============================================

export interface DeadliftVelocityData {
  load: number; // kg
  reps: number; // typically 1-3 reps per set
  repDuration?: number; // seconds per rep (optional)
}

export interface DeadliftVelocityTest {
  maxLoad: number; // kg (highest achieved)
  attempts: TestAttempt<DeadliftVelocityData>[];
  maxLoadAttempt?: number;
}

export interface BarbellHipThrustSet {
  load: number; // kg
  reps: number;
  restAfter: number; // seconds rest after this set
}

export interface BarbellHipThrustTest {
  maxLoad: number; // kg (1RM or max achieved)
  sets: BarbellHipThrustSet[]; // multiple sets under 5 min
  totalTimeUsed: number; // seconds (max 300)
  totalReps: number; // sum of all reps
}

// ============================================
// UPPER BODY STRENGTH
// ============================================

export interface WeightedPullUpSet {
  load: number; // kg (additional weight - belt, vest, dumbbell)
  reps: number;
  restAfter: number; // seconds
}

export interface WeightedPullUpTest {
  bodyWeight: number; // kg
  sets: WeightedPullUpSet[];
  totalTimeUsed: number; // seconds (max 300)
  totalReps: number;
  maxLoad?: number; // kg (highest additional load)
}

export interface BarbellRowData {
  load: number; // kg
  reps: number;
  formQuality?: "strict" | "momentum";
}

export interface BarbellRowTest {
  maxLoad: number; // kg (heaviest load used)
  attempts: TestAttempt<BarbellRowData>[];
  bestAttempt?: number;
}

// ============================================
// ENDURANCE/STABILITY
// ============================================

export interface PlankHoldData {
  duration: number; // seconds (until form breaks)
  load: number; // kg (0 for bodyweight, or plate on back)
  formBreakdown?: boolean;
}

export interface PlankHoldTest {
  attempts: TestAttempt<PlankHoldData>[];
  bestAttempt?: number;
}

export interface PullUpsData {
  reps: number; // max reps under time limit
  timeLimit: number; // seconds (typically 300)
  timeUsed: number; // actual seconds taken
  formQuality?: "strict" | "kipping";
}

export interface PullUpsTest {
  attempts: TestAttempt<PullUpsData>[];
  bestAttempt?: number;
}

// ============================================
// COMPLETE STRENGTH & POWER FORM DATA
// ============================================

export interface StrengthPowerTestData {
  athleteBodyWeight: number; // kg (needed for calculations)

  // Jump Tests
  countermovementJump?: CountermovementJumpTest;
  loadedSquatJump?: LoadedSquatJumpTest;
  depthJump?: DepthJumpTest;

  // Upper Body Power
  ballisticBenchPress?: BallisticBenchPressTest;
  pushUp?: PushUpTest;
  ballisticPushUp?: BallisticPushUpTest;

  // Lower Body Strength
  deadliftVelocity?: DeadliftVelocityTest;
  barbellHipThrust?: BarbellHipThrustTest;

  // Upper Body Strength
  weightedPullUp?: WeightedPullUpTest;
  barbellRow?: BarbellRowTest;

  // Endurance/Stability
  plankHold?: PlankHoldTest;
  pullUps?: PullUpsTest;

  // Legacy field
  pushups?: number;

  // Auto-calculated scores (0-100)
  muscleMass: number;
  enduranceStrength: number;
  explosivePower: number;
}

// ============================================
// CALCULATION HELPERS (Basic Equipment)
// ============================================

export const StrengthCalculations = {
  // Calculate jump height from reach difference
  calculateJumpHeight: (standingReach: number, jumpReach: number): number => {
    return jumpReach - standingReach;
  },

  // Estimate flight time from jump height: t = √(8h/g)
  estimateFlightTime: (jumpHeight: number): number => {
    const g = 9.81; // m/s²
    const h = jumpHeight / 100; // convert cm to m
    return Math.sqrt((8 * h) / g);
  },

  // Calculate jump height from flight time: h = (g × t²) / 8
  calculateJumpHeightFromFlightTime: (flightTime: number): number => {
    const g = 9.81;
    return ((g * Math.pow(flightTime, 2)) / 8) * 100; // cm
  },

  // Estimate peak power using Sayers equation: P = (60.7 × jump_cm) + (45.3 × mass_kg) - 2055
  estimatePeakPower: (jumpHeight: number, bodyMass: number): number => {
    return 60.7 * jumpHeight + 45.3 * bodyMass - 2055;
  },

  // Calculate relative power
  calculateRelativePower: (peakPower: number, bodyMass: number): number => {
    return peakPower / bodyMass;
  },

  // Calculate explosive power score (0-100)
  calculateExplosivePowerScore: (
    data: Partial<StrengthPowerTestData>
  ): number => {
    let totalScore = 0;
    let testCount = 0;

    // Countermovement jump (0-100 scale, 70cm+ = 100 points)
    if (data.countermovementJump?.attempts.length) {
      const best = Math.max(
        ...data.countermovementJump.attempts.map((a) => a.data.jumpHeight || 0)
      );
      totalScore += Math.min(100, (best / 70) * 100);
      testCount++;
    }

    // Loaded squat jump (relative to body weight)
    if (data.loadedSquatJump?.attempts.length && data.athleteBodyWeight) {
      const bestJump = Math.max(
        ...data.loadedSquatJump.attempts.map((a) => a.data.jumpHeight || 0)
      );
      const bestLoad = Math.max(
        ...data.loadedSquatJump.attempts.map((a) => a.data.load)
      );
      const relativeLoad = bestLoad / data.athleteBodyWeight;
      // Score based on jump height with load
      totalScore += Math.min(100, (bestJump / 50) * (1 + relativeLoad) * 50);
      testCount++;
    }

    // Ballistic bench press (reps with load)
    if (data.ballisticBenchPress?.attempts.length) {
      const best = Math.max(
        ...data.ballisticBenchPress.attempts.map((a) => a.data.reps)
      );
      totalScore += Math.min(100, (best / 30) * 100); // 30 reps = 100 points
      testCount++;
    }

    // Ballistic push-ups
    if (data.ballisticPushUp?.attempts.length) {
      const best = Math.max(
        ...data.ballisticPushUp.attempts.map((a) => a.data.reps)
      );
      totalScore += Math.min(100, (best / 40) * 100); // 40 reps = 100 points
      testCount++;
    }

    return testCount > 0 ? totalScore / testCount : 0;
  },

  // Calculate muscle mass score (0-100)
  calculateMuscleMassScore: (data: Partial<StrengthPowerTestData>): number => {
    if (!data.athleteBodyWeight) return 0;

    let totalScore = 0;
    let testCount = 0;

    // Deadlift relative to bodyweight
    if (data.deadliftVelocity?.maxLoad) {
      const relative = data.deadliftVelocity.maxLoad / data.athleteBodyWeight;
      totalScore += Math.min(100, (relative / 2.5) * 100); // 2.5x BW = 100 points
      testCount++;
    }

    // Hip thrust relative to bodyweight
    if (data.barbellHipThrust?.maxLoad) {
      const relative = data.barbellHipThrust.maxLoad / data.athleteBodyWeight;
      totalScore += Math.min(100, (relative / 3.0) * 100); // 3x BW = 100 points
      testCount++;
    }

    // Weighted pull-ups (additional load)
    if (data.weightedPullUp?.maxLoad) {
      const relative = data.weightedPullUp.maxLoad / data.athleteBodyWeight;
      totalScore += Math.min(100, (relative / 0.75) * 100); // 0.75x BW = 100 points
      testCount++;
    }

    // Barbell row relative to bodyweight
    if (data.barbellRow?.maxLoad) {
      const relative = data.barbellRow.maxLoad / data.athleteBodyWeight;
      totalScore += Math.min(100, (relative / 1.5) * 100); // 1.5x BW = 100 points
      testCount++;
    }

    return testCount > 0 ? totalScore / testCount : 0;
  },

  // Calculate endurance strength score (0-100)
  calculateEnduranceStrengthScore: (
    data: Partial<StrengthPowerTestData>
  ): number => {
    let totalScore = 0;
    let testCount = 0;

    // Plank hold (300s = 5min = 100 points)
    if (data.plankHold?.attempts.length) {
      const best = Math.max(
        ...data.plankHold.attempts.map((a) => a.data.duration)
      );
      totalScore += Math.min(100, (best / 300) * 100);
      testCount++;
    }

    // Push-ups in 1 min (60 reps = 100 points)
    if (data.pushUp?.attempts.length) {
      const best = Math.max(...data.pushUp.attempts.map((a) => a.data.reps));
      totalScore += Math.min(100, (best / 60) * 100);
      testCount++;
    }

    // Pull-ups in 5 min (30 reps = 100 points)
    if (data.pullUps?.attempts.length) {
      const best = Math.max(...data.pullUps.attempts.map((a) => a.data.reps));
      totalScore += Math.min(100, (best / 30) * 100);
      testCount++;
    }

    // Hip thrust total reps
    if (data.barbellHipThrust?.totalReps) {
      totalScore += Math.min(100, (data.barbellHipThrust.totalReps / 50) * 100);
      testCount++;
    }

    return testCount > 0 ? totalScore / testCount : 0;
  },
};

// ============================================
// VALIDATION HELPERS
// ============================================

export const TestValidation = {
  isValidJumpHeight: (height: number) => height >= 0 && height <= 150,
  isValidLoad: (load: number) => load >= 0 && load <= 500,
  isValidReps: (reps: number) => reps >= 0 && reps <= 500,
  isValidDuration: (seconds: number) => seconds >= 0 && seconds <= 600,
  isValidBodyWeight: (weight: number) => weight >= 30 && weight <= 200,
};
