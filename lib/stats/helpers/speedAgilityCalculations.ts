import {
  TenMeterSprintTest,
  FourtyMeterDashTest,
  RepeatedSprintAbilityTest,
  Five05AgilityTest,
  TTestData,
  IllinoisAgilityTest,
  VisualReactionSpeedDrill,
  StandingLongJumpTest,
  LongJumpTest,
  ReactiveAgilityTTest,
  SpeedAndAgilityData,
  VALIDATION_RANGES,
} from "../types/speedAgilityTests";

// ============================================
// BASIC STATISTICAL CALCULATIONS
// ============================================

export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateMin = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.min(...values);
};

export const calculateMax = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.max(...values);
};

// ============================================
// TEN METER SPRINT CALCULATIONS
// ============================================

export const calculateTenMeterSprintMetrics = (
  test: TenMeterSprintTest
): TenMeterSprintTest => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const times = test.attempts.map((a) => a.sprintTime).filter((t) => t > 0);

  return {
    ...test,
    bestTime: times.length > 0 ? calculateMin(times) : undefined,
    meanTime: times.length > 0 ? calculateMean(times) : undefined,
  };
};

// ============================================
// FOURTY METER DASH CALCULATIONS
// ============================================

export const calculateFourtyMeterDashMetrics = (
  test: FourtyMeterDashTest
): FourtyMeterDashTest => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const times = test.attempts
    .map((a) => a.totalTime_0_40m)
    .filter((t) => t > 0);

  return {
    ...test,
    bestTime: times.length > 0 ? calculateMin(times) : undefined,
    meanTime: times.length > 0 ? calculateMean(times) : undefined,
  };
};

// ============================================
// REPEATED SPRINT ABILITY (RSA) CALCULATIONS
// ============================================

/**
 * Calculate RSA metrics:
 * - Best Time: Fastest sprint
 * - Worst Time: Slowest sprint
 * - Mean Time: Average of all sprints
 * - Total Time: Sum of all sprints
 * - Fatigue Index: ((Worst - Best) / Best) × 100
 * - Percent Decrement: 100 - ((Total / (Best × Number of Sprints)) × 100)
 */
export const calculateRSAMetrics = (
  test: RepeatedSprintAbilityTest
): RepeatedSprintAbilityTest => {
  if (!test.sprintTimes || test.sprintTimes.length === 0) {
    return test;
  }

  const validTimes = test.sprintTimes.filter((t) => t > 0);

  if (validTimes.length === 0) {
    return test;
  }

  const bestTime = calculateMin(validTimes);
  const worstTime = calculateMax(validTimes);
  const meanTime = calculateMean(validTimes);
  const totalTime = validTimes.reduce((sum, t) => sum + t, 0);

  // Fatigue Index: (Worst - Best) / Best × 100
  const fatigueIndex =
    bestTime > 0 ? ((worstTime - bestTime) / bestTime) * 100 : 0;

  // Percent Decrement: 100 - (Total / (Best × Count) × 100)
  const percentDecrement =
    bestTime > 0 ? 100 - (totalTime / (bestTime * validTimes.length)) * 100 : 0;

  return {
    ...test,
    bestTime: Math.round(bestTime * 100) / 100,
    worstTime: Math.round(worstTime * 100) / 100,
    meanTime: Math.round(meanTime * 100) / 100,
    totalTime: Math.round(totalTime * 100) / 100,
    fatigueIndex: Math.round(fatigueIndex * 10) / 10,
    percentDecrement: Math.round(percentDecrement * 10) / 10,
  };
};

// ============================================
// T-TEST CALCULATIONS
// ============================================

export const calculateTTestMetrics = (test: TTestData): TTestData => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const times = test.attempts.map((a) => a.completionTime).filter((t) => t > 0);

  return {
    ...test,
    bestTime: times.length > 0 ? calculateMin(times) : undefined,
    meanTime: times.length > 0 ? calculateMean(times) : undefined,
  };
};

// ============================================
// ILLINOIS AGILITY TEST CALCULATIONS
// ============================================

export const calculateIllinoisAgilityMetrics = (
  test: IllinoisAgilityTest
): IllinoisAgilityTest => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const times = test.attempts.map((a) => a.completionTime).filter((t) => t > 0);

  return {
    ...test,
    bestTime: times.length > 0 ? calculateMin(times) : undefined,
    meanTime: times.length > 0 ? calculateMean(times) : undefined,
  };
};

// ============================================
// 505 AGILITY TEST CALCULATIONS
// ============================================

export const calculateFive05AgilityMetrics = (
  test: Five05AgilityTest
): Five05AgilityTest => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const leftTimes = test.attempts
    .map((a) => a.leftTurnTime)
    .filter((t) => t > 0);
  const rightTimes = test.attempts
    .map((a) => a.rightTurnTime)
    .filter((t) => t > 0);

  const bestLeftTime =
    leftTimes.length > 0 ? calculateMin(leftTimes) : undefined;
  const bestRightTime =
    rightTimes.length > 0 ? calculateMin(rightTimes) : undefined;
  const meanLeftTime =
    leftTimes.length > 0 ? calculateMean(leftTimes) : undefined;
  const meanRightTime =
    rightTimes.length > 0 ? calculateMean(rightTimes) : undefined;

  // Asymmetry Index: Absolute difference between best left and right times
  const asymmetryIndex =
    bestLeftTime && bestRightTime
      ? Math.abs(bestLeftTime - bestRightTime)
      : undefined;

  return {
    ...test,
    bestLeftTime,
    bestRightTime,
    meanLeftTime,
    meanRightTime,
    asymmetryIndex:
      asymmetryIndex !== undefined
        ? Math.round(asymmetryIndex * 100) / 100
        : undefined,
  };
};

// ============================================
// VISUAL REACTION SPEED DRILL CALCULATIONS
// ============================================

export const calculateVisualReactionMetrics = (
  test: VisualReactionSpeedDrill
): VisualReactionSpeedDrill => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const times = test.attempts.map((a) => a.reactionTime).filter((t) => t > 0);

  return {
    ...test,
    bestReactionTime: times.length > 0 ? calculateMin(times) : undefined,
    meanReactionTime: times.length > 0 ? calculateMean(times) : undefined,
  };
};

// ============================================
// STANDING LONG JUMP CALCULATIONS
// ============================================

export const calculateStandingLongJumpMetrics = (
  test: StandingLongJumpTest
): StandingLongJumpTest => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const distances = test.attempts.map((a) => a.distance).filter((d) => d > 0);

  return {
    ...test,
    bestDistance: distances.length > 0 ? calculateMax(distances) : undefined,
    meanDistance: distances.length > 0 ? calculateMean(distances) : undefined,
  };
};

// ============================================
// LONG JUMP CALCULATIONS
// ============================================

export const calculateLongJumpMetrics = (test: LongJumpTest): LongJumpTest => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const distances = test.attempts.map((a) => a.distance).filter((d) => d > 0);

  return {
    ...test,
    bestDistance: distances.length > 0 ? calculateMax(distances) : undefined,
    meanDistance: distances.length > 0 ? calculateMean(distances) : undefined,
  };
};

// ============================================
// REACTIVE AGILITY T-TEST CALCULATIONS
// ============================================

export const calculateReactiveAgilityMetrics = (
  test: ReactiveAgilityTTest
): ReactiveAgilityTTest => {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  const times = test.attempts.map((a) => a.completionTime).filter((t) => t > 0);
  const accuracies = test.attempts
    .map((a) => a.correctResponseRate)
    .filter((r) => r !== undefined && r > 0) as number[];

  return {
    ...test,
    bestTime: times.length > 0 ? calculateMin(times) : undefined,
    meanTime: times.length > 0 ? calculateMean(times) : undefined,
    averageAccuracy:
      accuracies.length > 0 ? calculateMean(accuracies) : undefined,
  };
};

// ============================================
// SCORE NORMALIZATION (0-100 Scale)
// ============================================

/**
 * Normalize time-based tests to 0-100 score
 * Lower time = Higher score
 */
export const normalizeTimeToScore = (
  time: number,
  minTime: number,
  maxTime: number
): number => {
  if (time <= 0) return 0;
  if (time <= minTime) return 100;
  if (time >= maxTime) return 0;

  // Linear interpolation (inverted: lower time = higher score)
  const score = 100 - ((time - minTime) / (maxTime - minTime)) * 100;
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
};

/**
 * Normalize distance-based tests to 0-100 score
 * Higher distance = Higher score
 */
export const normalizeDistanceToScore = (
  distance: number,
  minDistance: number,
  maxDistance: number
): number => {
  if (distance <= 0) return 0;
  if (distance >= maxDistance) return 100;
  if (distance <= minDistance) return 0;

  // Linear interpolation
  const score = ((distance - minDistance) / (maxDistance - minDistance)) * 100;
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
};

/**
 * Normalize reaction time to 0-100 score
 * Lower reaction time = Higher score
 */
export const normalizeReactionTimeToScore = (
  reactionTimeMs: number
): number => {
  return normalizeTimeToScore(
    reactionTimeMs,
    VALIDATION_RANGES.reactionTime.min,
    VALIDATION_RANGES.reactionTime.max
  );
};

// ============================================
// AGGREGATE SCORE CALCULATIONS
// ============================================

/**
 * Calculate overall Sprint Speed score
 * Based on: 10m sprint, 40m dash, and RSA best time
 */
export const calculateSprintSpeedScore = (
  data: SpeedAndAgilityData
): number => {
  const scores: number[] = [];

  // 10m Sprint (Acceleration)
  if (data.Ten_Meter_Sprint?.bestTime) {
    const score = normalizeTimeToScore(
      data.Ten_Meter_Sprint.bestTime,
      VALIDATION_RANGES.tenMeterSprint.min,
      VALIDATION_RANGES.tenMeterSprint.max
    );
    scores.push(score);
  }

  // 40m Dash (Top Speed)
  if (data.Fourty_Meter_Dash?.bestTime) {
    const score = normalizeTimeToScore(
      data.Fourty_Meter_Dash.bestTime,
      VALIDATION_RANGES.fourtyMeterDash.min,
      VALIDATION_RANGES.fourtyMeterDash.max
    );
    scores.push(score * 1.2); // Weighted higher (main sprint test)
  }

  // RSA Best Time
  if (data.Repeated_Sprint_Ability?.bestTime) {
    const score = normalizeTimeToScore(
      data.Repeated_Sprint_Ability.bestTime,
      VALIDATION_RANGES.repeatedSprintSingle.min,
      VALIDATION_RANGES.repeatedSprintSingle.max
    );
    scores.push(score * 0.8); // Weighted lower (endurance component)
  }

  if (scores.length === 0) return 0;

  const totalWeight = scores.length === 1 ? 1 : scores.length === 2 ? 2.2 : 3;
  const weightedAverage = scores.reduce((sum, s) => sum + s, 0) / totalWeight;

  return Math.round(weightedAverage * 10) / 10;
};

/**
 * Calculate overall Acceleration score
 * Based on: 10m sprint primarily
 */
export const calculateAccelerationScore = (
  data: SpeedAndAgilityData
): number => {
  if (!data.Ten_Meter_Sprint?.bestTime) return 0;

  return normalizeTimeToScore(
    data.Ten_Meter_Sprint.bestTime,
    VALIDATION_RANGES.tenMeterSprint.min,
    VALIDATION_RANGES.tenMeterSprint.max
  );
};

/**
 * Calculate overall Agility score
 * Based on: T-Test, Illinois Test, 505 Test
 */
export const calculateAgilityScore = (data: SpeedAndAgilityData): number => {
  const scores: number[] = [];

  // T-Test
  if (data.T_Test?.bestTime) {
    const score = normalizeTimeToScore(
      data.T_Test.bestTime,
      VALIDATION_RANGES.tTest.min,
      VALIDATION_RANGES.tTest.max
    );
    scores.push(score);
  }

  // Illinois Agility Test
  if (data.Illinois_Agility_Test?.bestTime) {
    const score = normalizeTimeToScore(
      data.Illinois_Agility_Test.bestTime,
      VALIDATION_RANGES.illinoisTest.min,
      VALIDATION_RANGES.illinoisTest.max
    );
    scores.push(score);
  }

  // 505 Agility Test (average of left and right)
  if (
    data.Five_0_Five_Agility_Test?.bestLeftTime &&
    data.Five_0_Five_Agility_Test?.bestRightTime
  ) {
    const avgTime =
      (data.Five_0_Five_Agility_Test.bestLeftTime +
        data.Five_0_Five_Agility_Test.bestRightTime) /
      2;
    const score = normalizeTimeToScore(
      avgTime,
      VALIDATION_RANGES.five05Test.min,
      VALIDATION_RANGES.five05Test.max
    );
    scores.push(score);
  }

  if (scores.length === 0) return 0;

  return Math.round(calculateMean(scores) * 10) / 10;
};

/**
 * Calculate overall Reaction Time score
 * Based on: Visual Reaction Speed Drill
 */
export const calculateReactionTimeScore = (
  data: SpeedAndAgilityData
): number => {
  if (!data.Visual_Reaction_Speed_Drill?.bestReactionTime) return 0;

  return normalizeReactionTimeToScore(
    data.Visual_Reaction_Speed_Drill.bestReactionTime
  );
};

/**
 * Calculate overall Balance score
 * Placeholder - can be expanded with balance-specific tests
 */
export const calculateBalanceScore = (data: SpeedAndAgilityData): number => {
  // Currently not implemented - placeholder for future balance tests
  return 0;
};

/**
 * Calculate overall Coordination score
 * Based on: Reactive Agility, 505 Asymmetry
 */
export const calculateCoordinationScore = (
  data: SpeedAndAgilityData
): number => {
  const scores: number[] = [];

  // Reactive Agility (if accuracy available)
  if (data.Reactive_Agility_T_Test?.averageAccuracy) {
    scores.push(data.Reactive_Agility_T_Test.averageAccuracy);
  }

  // 505 Asymmetry (lower asymmetry = better coordination)
  if (data.Five_0_Five_Agility_Test?.asymmetryIndex !== undefined) {
    const asymmetry = data.Five_0_Five_Agility_Test.asymmetryIndex;
    // Perfect symmetry (0s difference) = 100, 1s difference = 0
    const symmetryScore = Math.max(0, 100 - asymmetry * 100);
    scores.push(symmetryScore);
  }

  if (scores.length === 0) return 0;

  return Math.round(calculateMean(scores) * 10) / 10;
};

/**
 * Recalculate ALL scores for Speed & Agility data
 */
export const recalculateAllScores = (
  data: SpeedAndAgilityData
): SpeedAndAgilityData => {
  return {
    ...data,
    sprintSpeed: calculateSprintSpeedScore(data),
    acceleration: { score: calculateAccelerationScore(data) },
    agility: { score: calculateAgilityScore(data) },
    reactionTime: { score: calculateReactionTimeScore(data) },
    balance: { score: calculateBalanceScore(data) },
    coordination: { score: calculateCoordinationScore(data) },
  };
};
