import {
  BeepTest,
  CooperTest,
  SitAndReachTest,
  ActiveLegRaiseTest,
  ShoulderRotationTest,
  KneeToWallTest,
  RestingHeartRateTest,
  HeartRateRecoveryTest,
  PeakHeartRateTest,
  StaminaRecoveryData,
  CLASSIFICATION_THRESHOLDS,
} from "../types/staminaRecoveryTests";

// ============================================
// CARDIOVASCULAR CALCULATIONS
// ============================================

/**
 * Calculate VO2 Max from Beep Test results
 * Formula: VO2max = 31.025 + 3.238×Speed - 3.248×Age + 0.1536×Speed×Age
 * Simplified for athletes: VO2max = level × 2 + 25 (approximation)
 */
export function calculateBeepTestMetrics(test: BeepTest): BeepTest {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  // Find best attempt (highest level + shuttle combination)
  let bestIndex = 0;
  let bestScore = 0;

  test.attempts.forEach((attempt, index) => {
    const score = attempt.finalLevel * 100 + attempt.finalShuttle;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  const bestAttempt = test.attempts[bestIndex];

  // Calculate total shuttles (cumulative)
  const totalShuttles = calculateTotalShuttles(
    bestAttempt.finalLevel,
    bestAttempt.finalShuttle
  );

  // Calculate VO2 Max (Ramsbottom formula approximation)
  const speed = 8 + (bestAttempt.finalLevel - 1) * 0.5; // km/h
  const vo2Max = 31.025 + 3.238 * speed - 3.248 * 0 + 0.1536 * speed * 0;
  // Note: Age = 0 since we don't have it in this context
  // More accurate: level-based approximation
  const approximateVO2Max = Math.min(85, bestAttempt.finalLevel * 2.3 + 28);

  // Calculate distance (20m per shuttle)
  const estimatedDistance = totalShuttles * 20;

  return {
    ...test,
    bestAttempt: bestIndex,
    calculatedVO2Max: Math.round(approximateVO2Max * 10) / 10,
    estimatedDistance,
  };
}

/**
 * Helper: Calculate total shuttles completed in Beep Test
 */
function calculateTotalShuttles(level: number, shuttle: number): number {
  // Shuttles per level: Level 1=7, Level 2=8, Level 3=8, then +1 every level
  let total = 0;

  for (let l = 1; l < level; l++) {
    if (l === 1) total += 7;
    else if (l <= 2) total += 8;
    else total += 8 + (l - 2);
  }

  total += shuttle;
  return total;
}

/**
 * Calculate VO2 Max from Cooper 12-minute run
 * Formula: VO2max = (distance in meters - 504.9) / 44.73
 */
export function calculateCooperTestMetrics(test: CooperTest): CooperTest {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  // Find best attempt (longest distance)
  let bestIndex = 0;
  let bestDistance = 0;

  test.attempts.forEach((attempt, index) => {
    if (attempt.distanceCovered > bestDistance) {
      bestDistance = attempt.distanceCovered;
      bestIndex = index;
    }
  });

  // Calculate VO2 Max from best distance
  const vo2Max = Math.max(20, Math.min(85, (bestDistance - 504.9) / 44.73));

  // Calculate average distance
  const averageDistance =
    test.attempts.reduce((sum, att) => sum + att.distanceCovered, 0) /
    test.attempts.length;

  return {
    ...test,
    bestAttempt: bestIndex,
    calculatedVO2Max: Math.round(vo2Max * 10) / 10,
    averageDistance: Math.round(averageDistance),
  };
}

// ============================================
// FLEXIBILITY CALCULATIONS
// ============================================

/**
 * Calculate Sit-and-Reach metrics and flexibility score
 */
export function calculateSitAndReachMetrics(
  test: SitAndReachTest
): SitAndReachTest {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  // Find best reach
  const reaches = test.attempts.map((att) => att.reachDistance);
  const bestReach = Math.max(...reaches);
  const averageReach =
    reaches.reduce((sum, val) => sum + val, 0) / reaches.length;

  // Calculate flexibility score (0-100)
  // Excellent (15+cm) = 100, Good (5-14cm) = 80, Average (0-4cm) = 60
  // Below Average (-5 to -1cm) = 40, Poor (<-5cm) = 20
  let flexibilityScore = 0;
  if (bestReach >= 15) {
    flexibilityScore = 100;
  } else if (bestReach >= 10) {
    flexibilityScore = 80 + (bestReach - 10) * 4; // 80-100
  } else if (bestReach >= 5) {
    flexibilityScore = 70 + (bestReach - 5) * 2; // 70-80
  } else if (bestReach >= 0) {
    flexibilityScore = 60 + bestReach * 2; // 60-70
  } else if (bestReach >= -5) {
    flexibilityScore = 40 + (bestReach + 5) * 4; // 40-60
  } else {
    flexibilityScore = Math.max(0, 40 + (bestReach + 5) * 4); // 0-40
  }

  return {
    ...test,
    bestReach: Math.round(bestReach * 10) / 10,
    averageReach: Math.round(averageReach * 10) / 10,
    flexibilityScore: Math.round(flexibilityScore),
  };
}

/**
 * Calculate Active Leg Raise metrics
 */
export function calculateActiveLegRaiseMetrics(
  test: ActiveLegRaiseTest
): ActiveLegRaiseTest {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  // Find best angles for each leg
  const leftAngles = test.attempts
    .map((att) => att.leftLegAngle)
    .filter((val): val is number => val !== undefined);
  const rightAngles = test.attempts
    .map((att) => att.rightLegAngle)
    .filter((val): val is number => val !== undefined);

  const bestLeftAngle =
    leftAngles.length > 0 ? Math.max(...leftAngles) : undefined;
  const bestRightAngle =
    rightAngles.length > 0 ? Math.max(...rightAngles) : undefined;

  // Calculate asymmetry score (difference between legs)
  let asymmetryScore = undefined;
  if (bestLeftAngle !== undefined && bestRightAngle !== undefined) {
    asymmetryScore = Math.abs(bestLeftAngle - bestRightAngle);
  }

  // Calculate flexibility score (0-100)
  // Based on average of both legs. 90° = excellent (100), 70° = good (80), 50° = average (60)
  let flexibilityScore = 0;
  if (bestLeftAngle !== undefined && bestRightAngle !== undefined) {
    const avgAngle = (bestLeftAngle + bestRightAngle) / 2;
    if (avgAngle >= 90) {
      flexibilityScore = 100;
    } else if (avgAngle >= 70) {
      flexibilityScore = 80 + (avgAngle - 70); // 80-100
    } else if (avgAngle >= 50) {
      flexibilityScore = 60 + (avgAngle - 50); // 60-80
    } else {
      flexibilityScore = Math.max(0, avgAngle * 1.2); // 0-60
    }
  }

  return {
    ...test,
    bestLeftAngle: bestLeftAngle ? Math.round(bestLeftAngle) : undefined,
    bestRightAngle: bestRightAngle ? Math.round(bestRightAngle) : undefined,
    asymmetryScore: asymmetryScore ? Math.round(asymmetryScore) : undefined,
    flexibilityScore:
      flexibilityScore > 0 ? Math.round(flexibilityScore) : undefined,
  };
}

/**
 * Calculate Shoulder Rotation metrics
 */
export function calculateShoulderRotationMetrics(
  test: ShoulderRotationTest
): ShoulderRotationTest {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  // Find best (narrowest) grip width
  const gripWidths = test.attempts.map((att) => att.gripWidth);
  const bestGripWidth = Math.min(...gripWidths);

  // Calculate shoulder mobility score (0-100)
  // Requires anthropometric data for accurate scoring
  let shoulderMobilityScore = 0;

  if (test.anthropometricData?.shoulderWidth) {
    const shoulderWidth = test.anthropometricData.shoulderWidth;
    const ratio = bestGripWidth / shoulderWidth;

    // Excellent: grip width <= 1.5x shoulder width
    // Good: 1.5-2.0x
    // Average: 2.0-2.5x
    // Poor: >2.5x
    if (ratio <= 1.5) {
      shoulderMobilityScore = 100;
    } else if (ratio <= 2.0) {
      shoulderMobilityScore = 80 - (ratio - 1.5) * 40; // 80-100
    } else if (ratio <= 2.5) {
      shoulderMobilityScore = 60 - (ratio - 2.0) * 40; // 60-80
    } else {
      shoulderMobilityScore = Math.max(0, 60 - (ratio - 2.5) * 40); // 0-60
    }
  } else {
    // Without shoulder width, use absolute values
    // Average shoulder width ~40cm
    if (bestGripWidth <= 60) {
      shoulderMobilityScore = 100;
    } else if (bestGripWidth <= 80) {
      shoulderMobilityScore = 80 + (80 - bestGripWidth); // 80-100
    } else if (bestGripWidth <= 100) {
      shoulderMobilityScore = 60 + (100 - bestGripWidth); // 60-80
    } else {
      shoulderMobilityScore = Math.max(0, 60 - (bestGripWidth - 100) * 0.6);
    }
  }

  return {
    ...test,
    bestGripWidth: Math.round(bestGripWidth * 10) / 10,
    shoulderMobilityScore: Math.round(shoulderMobilityScore),
  };
}

/**
 * Calculate Knee-to-Wall metrics
 */
export function calculateKneeToWallMetrics(
  test: KneeToWallTest
): KneeToWallTest {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  // Find best (farthest) distance for each leg
  const leftDistances = test.attempts
    .map((att) => att.leftFootDistance)
    .filter((val): val is number => val !== undefined);
  const rightDistances = test.attempts
    .map((att) => att.rightFootDistance)
    .filter((val): val is number => val !== undefined);

  const bestLeftDistance =
    leftDistances.length > 0 ? Math.max(...leftDistances) : undefined;
  const bestRightDistance =
    rightDistances.length > 0 ? Math.max(...rightDistances) : undefined;

  // Calculate asymmetry score
  let asymmetryScore = undefined;
  if (bestLeftDistance !== undefined && bestRightDistance !== undefined) {
    asymmetryScore = Math.abs(bestLeftDistance - bestRightDistance);
  }

  // Calculate ankle mobility score (0-100)
  // Excellent: 12+ cm, Good: 8-12cm, Average: 5-8cm, Poor: <5cm
  let ankleMobilityScore = 0;
  if (bestLeftDistance !== undefined && bestRightDistance !== undefined) {
    const avgDistance = (bestLeftDistance + bestRightDistance) / 2;

    if (avgDistance >= 12) {
      ankleMobilityScore = 100;
    } else if (avgDistance >= 8) {
      ankleMobilityScore = 80 + (avgDistance - 8) * 5; // 80-100
    } else if (avgDistance >= 5) {
      ankleMobilityScore = 60 + (avgDistance - 5) * 6.67; // 60-80
    } else {
      ankleMobilityScore = avgDistance * 12; // 0-60
    }
  }

  return {
    ...test,
    bestLeftDistance: bestLeftDistance
      ? Math.round(bestLeftDistance * 10) / 10
      : undefined,
    bestRightDistance: bestRightDistance
      ? Math.round(bestRightDistance * 10) / 10
      : undefined,
    asymmetryScore: asymmetryScore
      ? Math.round(asymmetryScore * 10) / 10
      : undefined,
    ankleMobilityScore:
      ankleMobilityScore > 0 ? Math.round(ankleMobilityScore) : undefined,
  };
}

// ============================================
// HEART RATE CALCULATIONS
// ============================================

/**
 * Convert 15-second pulse count to BPM
 */
export function pulseCountToBPM(pulseCount15Sec: number): number {
  return pulseCount15Sec * 4;
}

/**
 * Calculate Resting Heart Rate metrics
 */
export function calculateRestingHeartRateMetrics(
  test: RestingHeartRateTest
): RestingHeartRateTest {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  // Convert all to BPM
  const allBPM = test.attempts
    .map((att) => {
      if (att.inputMethod === "manual" && att.pulseCount15Sec) {
        return pulseCountToBPM(att.pulseCount15Sec);
      }
      return att.heartRateBPM || 0;
    })
    .filter((bpm) => bpm > 0);

  if (allBPM.length === 0) {
    return test;
  }

  const averageRHR = allBPM.reduce((sum, val) => sum + val, 0) / allBPM.length;
  const lowestRHR = Math.min(...allBPM);

  // Determine cardiovascular fitness rating
  let cardiovascularFitnessRating = "";
  const rhr = lowestRHR; // Use lowest for rating

  if (rhr < CLASSIFICATION_THRESHOLDS.restingHR.excellent) {
    cardiovascularFitnessRating = "Excellent";
  } else if (rhr < CLASSIFICATION_THRESHOLDS.restingHR.good) {
    cardiovascularFitnessRating = "Good";
  } else if (rhr < CLASSIFICATION_THRESHOLDS.restingHR.average) {
    cardiovascularFitnessRating = "Average";
  } else {
    cardiovascularFitnessRating = "Needs Improvement";
  }

  return {
    ...test,
    averageRHR: Math.round(averageRHR),
    lowestRHR: Math.round(lowestRHR),
    cardiovascularFitnessRating,
  };
}

/**
 * Calculate Heart Rate Recovery metrics
 */
export function calculateHeartRateRecoveryMetrics(
  test: HeartRateRecoveryTest
): HeartRateRecoveryTest {
  if (!test.attempts || test.attempts.length === 0) {
    return test;
  }

  let bestRecoveryAttempt = 0;
  let bestRecoveryRate = 0;
  const recoveryRates: number[] = [];

  test.attempts.forEach((att, index) => {
    // Convert pulse counts to BPM if manual
    let recovery1Min = att.recovery1MinHR || 0;
    let recovery2Min = att.recovery2MinHR || 0;
    let recovery3Min = att.recovery3MinHR || 0;

    if (att.inputMethod === "manual") {
      if (att.recovery1MinPulseCount)
        recovery1Min = pulseCountToBPM(att.recovery1MinPulseCount);
      if (att.recovery2MinPulseCount)
        recovery2Min = pulseCountToBPM(att.recovery2MinPulseCount);
      if (att.recovery3MinPulseCount)
        recovery3Min = pulseCountToBPM(att.recovery3MinPulseCount);
    }

    // Calculate recovery rate (BPM drop from peak)
    if (recovery1Min > 0) {
      const recoveryRate = att.peakHR - recovery1Min; // 1-minute recovery
      recoveryRates.push(recoveryRate);

      if (recoveryRate > bestRecoveryRate) {
        bestRecoveryRate = recoveryRate;
        bestRecoveryAttempt = index;
      }
    }
  });

  // Calculate average recovery rate
  const averageRecoveryRate =
    recoveryRates.length > 0
      ? recoveryRates.reduce((sum, val) => sum + val, 0) / recoveryRates.length
      : 0;

  // Calculate recovery efficiency score (0-100)
  // Excellent: >25 BPM drop in 1 min = 100
  // Good: 18-25 BPM = 80
  // Average: 12-18 BPM = 60
  // Poor: <12 BPM = 40
  let recoveryEfficiencyScore = 0;
  if (bestRecoveryRate >= 25) {
    recoveryEfficiencyScore = 100;
  } else if (bestRecoveryRate >= 18) {
    recoveryEfficiencyScore = 80 + (bestRecoveryRate - 18) * 2.86; // 80-100
  } else if (bestRecoveryRate >= 12) {
    recoveryEfficiencyScore = 60 + (bestRecoveryRate - 12) * 3.33; // 60-80
  } else {
    recoveryEfficiencyScore = Math.max(0, bestRecoveryRate * 5); // 0-60
  }

  return {
    ...test,
    bestRecoveryAttempt,
    averageRecoveryRate: Math.round(averageRecoveryRate),
    recoveryEfficiencyScore: Math.round(recoveryEfficiencyScore),
  };
}

/**
 * Calculate Peak Heart Rate metrics and training zones
 */
/**
 * Calculate Peak Heart Rate metrics and training zones
 */
export function calculatePeakHeartRateMetrics(
  test: PeakHeartRateTest,
  athleteAge?: number
): PeakHeartRateTest {
  if (!test.entries || test.entries.length === 0) {
    return test; // ✅ Return early if no entries
  }

  // ✅ FIX: Convert all to BPM and filter out invalid values
  const allPeakBPM = test.entries
    .map((entry) => {
      // ✅ FIX: Only process entries that have valid data
      if (
        entry.inputMethod === "manual" &&
        entry.pulseCount15Sec &&
        entry.pulseCount15Sec >= 20
      ) {
        return pulseCountToBPM(entry.pulseCount15Sec);
      }
      if (
        entry.inputMethod === "device" &&
        entry.peakHR &&
        entry.peakHR >= 100
      ) {
        return entry.peakHR;
      }
      return null; // ✅ Return null for invalid entries
    })
    .filter((bpm): bpm is number => bpm !== null && bpm > 0); // ✅ Filter out null and invalid

  // ✅ FIX: Only calculate if we have valid BPM values
  const maxRecordedHR =
    allPeakBPM.length > 0 ? Math.max(...allPeakBPM) : undefined; // ✅ Return undefined if no valid data

  // Estimate max HR using 220 - age formula (if age available)
  const estimatedMaxHR = athleteAge ? 220 - athleteAge : undefined;

  // Calculate training zones based on recorded or estimated max
  const maxHRForZones = maxRecordedHR || estimatedMaxHR || 190;

  const trainingZones = {
    zone1: [
      Math.round(maxHRForZones * 0.5),
      Math.round(maxHRForZones * 0.6),
    ] as [number, number],
    zone2: [
      Math.round(maxHRForZones * 0.6),
      Math.round(maxHRForZones * 0.7),
    ] as [number, number],
    zone3: [
      Math.round(maxHRForZones * 0.7),
      Math.round(maxHRForZones * 0.8),
    ] as [number, number],
    zone4: [
      Math.round(maxHRForZones * 0.8),
      Math.round(maxHRForZones * 0.9),
    ] as [number, number],
    zone5: [
      Math.round(maxHRForZones * 0.9),
      Math.round(maxHRForZones * 1.0),
    ] as [number, number],
  };

  return {
    ...test,
    maxRecordedHR: maxRecordedHR ? Math.round(maxRecordedHR) : undefined, // ✅ Only set if defined
    estimatedMaxHR,
    trainingZones,
  };
}

// ============================================
// COMPOSITE SCORE CALCULATIONS
// ============================================

/**
 * Calculate overall flexibility score from all flexibility tests
 */
export function calculateOverallFlexibilityScore(
  data: StaminaRecoveryData
): number {
  const scores: number[] = [];

  if (data.Sit_and_Reach_Test?.flexibilityScore) {
    scores.push(data.Sit_and_Reach_Test.flexibilityScore);
  }
  if (data.Active_Straight_Leg_Raise?.flexibilityScore) {
    scores.push(data.Active_Straight_Leg_Raise.flexibilityScore);
  }
  if (data.Shoulder_External_Internal_Rotation?.shoulderMobilityScore) {
    scores.push(data.Shoulder_External_Internal_Rotation.shoulderMobilityScore);
  }
  if (data.Knee_to_Wall_Test?.ankleMobilityScore) {
    scores.push(data.Knee_to_Wall_Test.ankleMobilityScore);
  }

  if (scores.length === 0) return 0;

  // Weighted average (sit-and-reach and leg raise more important)
  let weightedSum = 0;
  let totalWeight = 0;

  if (data.Sit_and_Reach_Test?.flexibilityScore) {
    weightedSum += data.Sit_and_Reach_Test.flexibilityScore * 2;
    totalWeight += 2;
  }
  if (data.Active_Straight_Leg_Raise?.flexibilityScore) {
    weightedSum += data.Active_Straight_Leg_Raise.flexibilityScore * 2;
    totalWeight += 2;
  }
  if (data.Shoulder_External_Internal_Rotation?.shoulderMobilityScore) {
    weightedSum +=
      data.Shoulder_External_Internal_Rotation.shoulderMobilityScore * 1;
    totalWeight += 1;
  }
  if (data.Knee_to_Wall_Test?.ankleMobilityScore) {
    weightedSum += data.Knee_to_Wall_Test.ankleMobilityScore * 1;
    totalWeight += 1;
  }

  return Math.round(weightedSum / totalWeight);
}

/**
 * Calculate cardiovascular fitness score
 */
export function calculateCardiovascularFitnessScore(
  data: StaminaRecoveryData
): number {
  let score = 0;
  let count = 0;

  // VO2 Max contribution (from either test)
  const vo2Max =
    data.Beep_Test?.calculatedVO2Max ||
    data.Cooper_Test?.calculatedVO2Max ||
    data.vo2Max;

  if (vo2Max > 0) {
    // Convert VO2 Max to 0-100 scale
    // Excellent (60+) = 100, Good (40-59) = 70, Fair (30-39) = 50, Poor (<30) = 30
    let vo2Score = 0;
    if (vo2Max >= CLASSIFICATION_THRESHOLDS.vo2Max.excellent) {
      vo2Score = 100;
    } else if (vo2Max >= CLASSIFICATION_THRESHOLDS.vo2Max.good) {
      vo2Score = 70 + (vo2Max - CLASSIFICATION_THRESHOLDS.vo2Max.good) * 1.5;
    } else if (vo2Max >= CLASSIFICATION_THRESHOLDS.vo2Max.fair) {
      vo2Score = 50 + (vo2Max - CLASSIFICATION_THRESHOLDS.vo2Max.fair) * 2;
    } else {
      vo2Score = Math.max(0, vo2Max * 1.67);
    }
    score += vo2Score * 2; // Double weight for VO2 Max
    count += 2;
  }

  // Resting HR contribution
  if (data.Resting_Heart_Rate?.lowestRHR) {
    const rhr = data.Resting_Heart_Rate.lowestRHR;
    let rhrScore = 0;

    if (rhr < CLASSIFICATION_THRESHOLDS.restingHR.excellent) {
      rhrScore = 100;
    } else if (rhr < CLASSIFICATION_THRESHOLDS.restingHR.good) {
      rhrScore = 80 + (CLASSIFICATION_THRESHOLDS.restingHR.good - rhr) * 2;
    } else if (rhr < CLASSIFICATION_THRESHOLDS.restingHR.average) {
      rhrScore = 60 + (CLASSIFICATION_THRESHOLDS.restingHR.average - rhr) * 2;
    } else {
      rhrScore = Math.max(0, 100 - rhr * 0.5);
    }
    score += rhrScore;
    count += 1;
  }

  return count > 0 ? Math.round(score / count) : 0;
}

/**
 * Calculate recovery efficiency score
 */
export function calculateRecoveryEfficiencyScore(
  data: StaminaRecoveryData
): number {
  if (data.Post_Exercise_Heart_Rate_Recovery?.recoveryEfficiencyScore) {
    return data.Post_Exercise_Heart_Rate_Recovery.recoveryEfficiencyScore;
  }
  return 0;
}

/**
 * Recalculate all stamina & recovery scores
 */
export function recalculateAllStaminaScores(
  data: StaminaRecoveryData,
  athleteAge?: number
): StaminaRecoveryData {
  const updated = { ...data };

  // Recalculate individual test metrics
  if (updated.Beep_Test) {
    updated.Beep_Test = calculateBeepTestMetrics(updated.Beep_Test);
  }
  if (updated.Cooper_Test) {
    updated.Cooper_Test = calculateCooperTestMetrics(updated.Cooper_Test);
  }
  if (updated.Sit_and_Reach_Test) {
    updated.Sit_and_Reach_Test = calculateSitAndReachMetrics(
      updated.Sit_and_Reach_Test
    );
  }
  if (updated.Active_Straight_Leg_Raise) {
    updated.Active_Straight_Leg_Raise = calculateActiveLegRaiseMetrics(
      updated.Active_Straight_Leg_Raise
    );
  }
  if (updated.Shoulder_External_Internal_Rotation) {
    updated.Shoulder_External_Internal_Rotation =
      calculateShoulderRotationMetrics(
        updated.Shoulder_External_Internal_Rotation
      );
  }
  if (updated.Knee_to_Wall_Test) {
    updated.Knee_to_Wall_Test = calculateKneeToWallMetrics(
      updated.Knee_to_Wall_Test
    );
  }
  if (updated.Resting_Heart_Rate) {
    updated.Resting_Heart_Rate = calculateRestingHeartRateMetrics(
      updated.Resting_Heart_Rate
    );
  }
  if (updated.Post_Exercise_Heart_Rate_Recovery) {
    updated.Post_Exercise_Heart_Rate_Recovery =
      calculateHeartRateRecoveryMetrics(
        updated.Post_Exercise_Heart_Rate_Recovery
      );
  }
  if (updated.Peak_Heart_Rate) {
    updated.Peak_Heart_Rate = calculatePeakHeartRateMetrics(
      updated.Peak_Heart_Rate,
      athleteAge
    );
  }

  // Calculate composite scores
  updated.overallFlexibilityScore = calculateOverallFlexibilityScore(updated);
  updated.cardiovascularFitnessScore =
    calculateCardiovascularFitnessScore(updated);
  updated.recoveryEfficiencyScore = calculateRecoveryEfficiencyScore(updated);

  // Update legacy scalar fields
  updated.vo2Max =
    updated.Beep_Test?.calculatedVO2Max ||
    updated.Cooper_Test?.calculatedVO2Max ||
    updated.vo2Max;

  updated.flexibility =
    updated.Sit_and_Reach_Test?.bestReach || updated.flexibility;

  // Recovery time estimate based on HR recovery (1-min recovery × 60)
  if (updated.Post_Exercise_Heart_Rate_Recovery?.averageRecoveryRate) {
    updated.recoveryTime = Math.max(
      30,
      Math.min(
        600,
        300 - updated.Post_Exercise_Heart_Rate_Recovery.averageRecoveryRate * 5
      )
    );
  }

  return updated;
}

/**
 * Calculate historical improvements
 */
export function calculateImprovements(
  currentData: StaminaRecoveryData,
  previousData: StaminaRecoveryData
): StaminaRecoveryData["improvements"] {
  const improvements: StaminaRecoveryData["improvements"] = {};

  // VO2 Max improvement
  if (currentData.vo2Max && previousData.vo2Max) {
    improvements.vo2MaxChange =
      ((currentData.vo2Max - previousData.vo2Max) / previousData.vo2Max) * 100;
  }

  // Flexibility improvement
  if (
    currentData.overallFlexibilityScore &&
    previousData.overallFlexibilityScore
  ) {
    improvements.flexibilityChange =
      ((currentData.overallFlexibilityScore -
        previousData.overallFlexibilityScore) /
        previousData.overallFlexibilityScore) *
      100;
  }

  // Recovery improvement
  if (
    currentData.recoveryEfficiencyScore &&
    previousData.recoveryEfficiencyScore
  ) {
    improvements.recoveryChange =
      ((currentData.recoveryEfficiencyScore -
        previousData.recoveryEfficiencyScore) /
        previousData.recoveryEfficiencyScore) *
      100;
  }

  return improvements;
}
