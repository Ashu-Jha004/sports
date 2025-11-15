// aggregateUserStats.ts
type RawStats = any;

// Helper to safely extract numeric values
const safeNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

export function aggregateUserStats(raw: RawStats) {
  // STRENGTH - Sum of max lifts normalized by bodyweight
  const strengthData = raw.currentStrength ?? {};
  const deadliftMax = safeNumber(strengthData.Deadlift_Velocity?.maxLoad);
  const benchPressMax = safeNumber(
    strengthData.Ballistic_Bench_Press?.attempts?.[0]?.data?.load
  );
  const hipThrustMax = safeNumber(strengthData.Barbell_Hip_Thrust?.maxLoad);
  const barbellRowMax = safeNumber(strengthData.Barbell_Row?.maxLoad);
  const weightedPullupMax = safeNumber(strengthData.Weighted_Pull_up?.maxLoad);
  const bodyWeight = safeNumber(raw.weight);

  const relativeStrength =
    bodyWeight > 0
      ? (deadliftMax +
          benchPressMax +
          hipThrustMax +
          barbellRowMax +
          weightedPullupMax) /
        bodyWeight
      : 0;
  const strengthScore = Math.min(100, relativeStrength * 10);

  // POWER - weighted jump heights and ballistic reps
  const cmjHeight = safeNumber(
    strengthData.Countermovement_Jump?.attempts?.[0]?.data?.jumpHeight
  );
  const loadedSquatJumpHeight = safeNumber(
    strengthData.Loaded_Squat_Jump?.attempts?.[0]?.data?.jumpHeight
  );
  const depthJumpHeight = safeNumber(
    strengthData.Depth_Jump?.attempts?.[0]?.data?.jumpHeight
  );
  const ballisticPushupReps = safeNumber(
    strengthData.Ballistic_Push_Up?.attempts?.[0]?.data?.reps
  );
  const ballisticBenchReps = safeNumber(
    strengthData.Ballistic_Bench_Press?.attempts?.[0]?.data?.reps
  );

  const powerScore = Math.min(
    65,
    cmjHeight * 0.5 +
      loadedSquatJumpHeight * 0.15 +
      depthJumpHeight * 0.15 +
      ballisticPushupReps * 1.2 +
      ballisticBenchReps
  );

  // SPEED - Inverse of sprint times + jumps
  const speed = raw?.currentSpeed ?? {};
  const sprint10m = safeNumber(
    speed?.Ten_Meter_Sprint?.attempts[0]?.sprintTime
  );
  const sprint40m = safeNumber(
    speed.Fourty_Meter_Dash?.attempts[0]?.totalTime_0_40m
  );
  const repeatedSprint = safeNumber(speed?.Repeated_Sprint_Ability?.bestTime);
  const longJump = safeNumber(speed.Long_Jump?.bestDistance);
  const standingJump = safeNumber(speed.Standing_Long_Jump?.bestDistance);

  const sprintScore =
    sprint10m && sprint40m && repeatedSprint
      ? sprint10m / sprint40m / repeatedSprint / 3
      : 0;
  const jumpScore = (longJump + standingJump) / 2;
  const speedScore = Math.min(30, sprintScore * 0.1 + jumpScore * 0.2);

  // AGILITY - Inverse times from agility drills
  const agilityData = raw.currentSpeed ?? {};
  const fiveZeroFive = safeNumber(
    agilityData?.Five_0_Five_Agility_Test?.bestRightTime
  );
  const tTest = safeNumber(agilityData.T_Test.bestTime);
  const illinois = safeNumber(agilityData.Illinois_Agility_Test.bestTime);
  const reactive = safeNumber(agilityData.Reactive_Agility_T_Test.bestTime);
  const visualReaction = safeNumber(
    agilityData.Visual_Reaction_Speed_Drill.bestReactionTime
  );

  const agilityScore = Math.min(
    250,
    fiveZeroFive * 0.2 +
      (90 / tTest) * 4.2 +
      (90 / illinois) * 0.2 +
      (60 / reactive) * 1.2 +
      visualReaction * 0.2
  );

  // RECOVERY - VO2 max, resting HR, recovery indexes
  const staminaData = raw.currentStamina ?? {};
  const vo2Max = safeNumber(staminaData.vo2Max);
  const restingHR = safeNumber(staminaData.Resting_Heart_Rate_lowestRHR);
  const recoveryEfficiency = safeNumber(staminaData.recoveryEfficiencyScore);
  const hrRecovery = safeNumber(
    staminaData.Post_Exercise_Heart_Rate_Recovery_averageRecoveryRate
  );
  const cardioFitness = safeNumber(staminaData.cardiovascularFitnessScore);

  const recoveryScore = Math.min(
    50,
    vo2Max * 60 +
      recoveryEfficiency * 35 +
      hrRecovery * 20 +
      cardioFitness * 15 +
      (250 - restingHR) * 10
  );

  // STAMINA - endurance test scores
  const beepTestLevel = safeNumber(
    staminaData.Beep_Test_attempts?.[0]?.finalLevel
  );
  const beepTestShuttle = safeNumber(
    staminaData.Beep_Test_attempts?.[0]?.finalShuttle
  );
  const cooperDistance = safeNumber(staminaData.Cooper_Test_averageDistance);
  const plankDuration = safeNumber(
    raw.currentStrength?.Plank_Hold_attempts?.[0]?.data?.duration
  );

  const beepScore = (beepTestLevel * 5 + beepTestShuttle) * 3;
  const cooperScore = (cooperDistance / 3500) * 100; // scale around elite runs
  const plankScore = (plankDuration / 300) * 100;

  const staminaScore = Math.min(
    50,
    beepScore * 1.6 + cooperScore * 0.3 + vo2Max * 1.25 + plankScore * 1.15
  );

  return {
    strength: strengthScore,
    power: powerScore,
    speed: speedScore,
    agility: agilityScore,
    recovery: recoveryScore,
    stamina: staminaScore,
  };
}
