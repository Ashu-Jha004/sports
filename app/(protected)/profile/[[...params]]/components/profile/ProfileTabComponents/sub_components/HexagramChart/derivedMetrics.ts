// helpers/derivedMetrics.ts

/** Fatigue Index for Ballistic Bench Press
 *  Measures the decline in power output over repeated attempts.
 *  Formula: (Max power - Minimum power) / Max power * 100 (%)
 */
export function calculateFatigueIndex(powers: number[]): number | null {
  if (!powers.length) return null;
  const maxPower = Math.max(...powers);
  const minPower = Math.min(...powers);
  if (maxPower === 0) return null;
  return ((maxPower - minPower) / maxPower) * 100;
}

export const fatigueIndexDescription =
  "Fatigue Index represents the percentage drop in power output during repeated attempts, indicating muscular endurance.";

/** Estimated Power for Ballistic Bench Press
 *  Power = Force x Velocity
 *  Assuming load is force and velocity is from measures or attempts.
 *  Simplified estimate: Power = Load (kg) * Velocity (m/s)
 */
export function estimatePower(
  loads: number[],
  velocities: number[]
): number | null {
  if (!loads.length || !velocities.length || loads.length !== velocities.length)
    return null;
  // average power over attempts
  const totalPower = loads.reduce(
    (sum, load, i) => sum + load * velocities[i],
    0
  );
  return totalPower / loads.length;
}

export const estimatedPowerDescription =
  "Estimated Power output calculated as the product of load and velocity during each attempt, averaged over attempts.";

/** Max Strength & Relative Strength Ratio for Weighted Pull-ups
 *  Max Strength = Max Load lifted (kg)
 *  Relative Strength Ratio = Max Strength / Body Weight
 */
export function calculateMaxStrength(loads: number[]): number | null {
  if (!loads.length) return null;
  return Math.max(...loads);
}

export function calculateRelativeStrengthRatio(
  maxStrength: number,
  bodyWeight: number
): number | null {
  if (bodyWeight === 0) return null;
  return maxStrength / bodyWeight;
}

export const maxStrengthDescription =
  "Max Strength is the maximum load lifted during weighted pull-ups.";
export const relativeStrengthRatioDescription =
  "Relative Strength Ratio compares maximum load lifted to the athlete's body weight, indicating strength relative to mass.";

/** Countermovement Jump (CMJ) Power Estimation
 *  Estimate Jump Power (Watts) from jump height (cm) and body mass (kg).
 *  Formula (Sayers et al. 1999): Power = 60.7 * jumpHeight(cm) + 45.3 * bodyMass(kg) - 2055
 */
export function estimateJumpPower(
  jumpHeightCm: number,
  bodyMassKg: number
): number | null {
  if (jumpHeightCm <= 0 || bodyMassKg <= 0) return null;
  const power = 60.7 * jumpHeightCm + 45.3 * bodyMassKg - 2055;
  return power > 0 ? power : null;
}

export const jumpPowerDescription =
  "Jump Power estimates explosive lower-body power from jump height and body mass using the Sayers et al. formula.";

/** Sprint Speed - Average Speed Calculation
 *  Simple average speed (m/s) = distance (m) / time (s)
 *  Example for 100m sprint
 */
export function calculateAverageSprintSpeed(
  distanceMeters: number,
  timeSeconds: number
): number | null {
  if (timeSeconds <= 0) return null;
  return distanceMeters / timeSeconds;
}

export const averageSprintSpeedDescription =
  "Average sprint speed calculated by dividing distance by completion time.";

/** VO2 Max Estimation (from Cooper Test or similar)
 *  Approximate VO2 Max (ml/kg/min) from Cooper 12-minute run distance (meters)
 *  Formula: VO2 Max = (distance in meters - 504.9) / 44.73
 */
export function estimateVO2Max(distanceMeters: number): number | null {
  if (distanceMeters <= 0) return null;
  return (distanceMeters - 504.9) / 44.73;
}

export const vo2MaxDescription =
  "Estimated VO2 Max based on Cooper Test distance using a standard formula.";

/** Heart Rate Recovery Rate (HRR)
 *  Difference between heart rate immediately post-exercise and after some recovery period.
 *  HRR = postExerciseHR - recoveryHR
 */
export function calculateHeartRateRecovery(
  postExerciseHR: number,
  recoveryHR: number
): number | null {
  if (postExerciseHR <= 0 || recoveryHR <= 0) return null;
  return postExerciseHR - recoveryHR;
}

export const heartRateRecoveryDescription =
  "Heart Rate Recovery rate measures cardiovascular recovery after exercise by the drop in heart rate.";

/** Vertical Jump Efficiency
 *  Ratio of jump height to standing reach height (dimensionless).
 */
export function calculateVerticalJumpEfficiency(
  jumpHeightCm: number,
  standingReachCm: number
): number | null {
  if (jumpHeightCm <= 0 || standingReachCm <= 0) return null;
  return jumpHeightCm / standingReachCm;
}

export const verticalJumpEfficiencyDescription =
  "Vertical Jump Efficiency measures the ratio of jump height to standing reach height, indicating jump proficiency.";

/** Explosive Power Estimate from Jump Velocity
 *  Power estimated from force and velocity components in jumping tests.
 *  Placeholder example using jump velocity (m/s) and body mass (kg)
 */
export function estimateExplosivePower(
  jumpVelocity: number,
  bodyMassKg: number
): number | null {
  if (jumpVelocity <= 0 || bodyMassKg <= 0) return null;
  // simplified formula: power = force * velocity; force approx = mass * gravity (9.81)
  const force = bodyMassKg * 9.81;
  return force * jumpVelocity;
}

export const explosivePowerDescription =
  "Estimated explosive power output from jump velocity and body mass.";

/** Muscular Endurance - Number of repetitions times load (rep x load)
 *  Simple numeric measure for tests like weighted pull-ups or lifts.
 */
export function calculateMuscularEndurance(
  repetitions: number,
  loadKg: number
): number | null {
  if (repetitions <= 0 || loadKg <= 0) return null;
  return repetitions * loadKg;
}

export const muscularEnduranceDescription =
  "Muscular Endurance estimated by multiplying number of repetitions with load lifted.";
