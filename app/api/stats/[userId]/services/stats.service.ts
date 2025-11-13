// ============================================
// FILE: app/api/stats/[userId]/services/stats.service.ts
// Database operations for stats with optimized queries
// ============================================

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  DatabaseError,
  NotFoundError,
  ConflictError,
  type StatsWithRelations,
} from "../types";
import { filterActiveInjuries } from "../utils";

const STATS_INCLUDE: Prisma.StatsInclude = {
  strength: { orderBy: { createdAt: "desc" }, take: 1 },
  speed: { orderBy: { createdAt: "desc" }, take: 1 },
  stamina: { orderBy: { createdAt: "desc" }, take: 1 },
  injuries: true,
};

const STATS_INCLUDE_WITH_HISTORY: Prisma.StatsInclude = {
  ...STATS_INCLUDE,
  strength: { orderBy: { createdAt: "desc" } },
  speed: { orderBy: { createdAt: "desc" } },
  stamina: { orderBy: { createdAt: "desc" } },
  injuries: { orderBy: { createdAt: "desc" } },
  history: { orderBy: { createdAt: "desc" }, take: 10 },
};

// Fetch complete stats with current and historical data for userId
export async function getAthleteStats(
  userId: string
): Promise<StatsWithRelations | null> {
  try {
    const stats = await prisma.stats.findUnique({
      where: { userId },
      include: STATS_INCLUDE_WITH_HISTORY,
    });

    if (!stats) return null;

    // Fetch athlete info without over-fetching
    const athlete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!athlete) throw new NotFoundError("Athlete");

    // Filter active injuries
    const activeInjuries = filterActiveInjuries(stats.injuries);

    return {
      id: stats.id,
      userId: stats.userId,
      height: stats.height,
      weight: stats.weight,
      age: stats.age,
      bodyFat: stats.bodyFat,
      currentStrength: stats.strength[0] || null,
      currentSpeed: stats.speed[0] || null,
      currentStamina: stats.stamina[0] || null,
      activeInjuries,
      strength: stats.strength[0] || null,
      speed: stats.speed[0] || null,
      stamina: stats.stamina[0] || null,
      injuries: activeInjuries,
      strengthHistory: stats.strength,
      speedHistory: stats.speed,
      staminaHistory: stats.stamina,
      injuryHistory: stats.injuries,
      lastUpdatedBy: stats.lastUpdatedBy,
      lastUpdatedAt: stats.lastUpdatedAt,
      lastUpdatedByName: stats.lastUpdatedByName,
      createdAt: stats.createdAt,
      updatedAt: stats.updatedAt,
      athlete,
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to fetch athlete stats", error);
  }
}

// Create initial stats record with related performance and injury data
export async function createAthleteStats(
  userId: string,
  basicMetrics: {
    height: number;
    weight: number;
    age: number;
    bodyFat: number;
  },
  strengthPower: any,
  speedAgility: any,
  staminaRecovery: any,
  injuries: any[],
  updatedBy: { id: string; firstName: string; lastName?: string }
) {
  try {
    const existing = await prisma.stats.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictError("Stats already exist. Use update instead.");
    }

    return await prisma.$transaction(async (tx) => {
      const stats = await tx.stats.create({
        data: {
          userId,
          height: basicMetrics.height,
          weight: basicMetrics.weight,
          age: basicMetrics.age,
          bodyFat: basicMetrics.bodyFat,
          lastUpdatedBy: updatedBy.id,
          lastUpdatedAt: new Date(),
          lastUpdatedByName: `${updatedBy.firstName} ${
            updatedBy.lastName || ""
          }`.trim(),
        },
      });

      await tx.strengthAndPower.create({
        data: {
          statId: stats.id,
          athleteBodyWeight: strengthPower.athleteBodyWeight,
          Countermovement_Jump: strengthPower.countermovementJump || undefined,
          Loaded_Squat_Jump: strengthPower.loadedSquatJump || undefined,
          Depth_Jump: strengthPower.depthJump || undefined,
          Ballistic_Bench_Press: strengthPower.ballisticBenchPress || undefined,
          Push_Up: strengthPower.pushUp || undefined,
          Ballistic_Push_Up: strengthPower.ballisticPushUp || undefined,
          Deadlift_Velocity: strengthPower.deadliftVelocity || undefined,
          Barbell_Hip_Thrust: strengthPower.barbellHipThrust || undefined,
          Weighted_Pull_up: strengthPower.weightedPullUp || undefined,
          Barbell_Row: strengthPower.barbellRow || undefined,
          Plank_Hold: strengthPower.plankHold || undefined,
          pullUps: strengthPower.pullUps || undefined,
          Pushups: strengthPower.pushups || undefined,
          muscleMass: strengthPower.muscleMass,
          enduranceStrength: strengthPower.enduranceStrength,
          explosivePower: strengthPower.explosivePower,
        },
      });

      await tx.speedAndAgility.create({
        data: {
          statId: stats.id,
          sprintSpeed: speedAgility.sprintSpeed,
          Ten_Meter_Sprint: speedAgility.Ten_Meter_Sprint || undefined,
          Fourty_Meter_Dash: speedAgility.Fourty_Meter_Dash || undefined,
          Repeated_Sprint_Ability:
            speedAgility.Repeated_Sprint_Ability || undefined,
          Five_0_Five_Agility_Test:
            speedAgility.Five_0_Five_Agility_Test || undefined,
          T_Test: speedAgility.T_Test || undefined,
          Illinois_Agility_Test:
            speedAgility.Illinois_Agility_Test || undefined,
          Visual_Reaction_Speed_Drill:
            speedAgility.Visual_Reaction_Speed_Drill || undefined,
          Long_Jump: speedAgility.Long_Jump || undefined,
          Reactive_Agility_T_Test:
            speedAgility.Reactive_Agility_T_Test || undefined,
          Standing_Long_Jump: speedAgility.Standing_Long_Jump || undefined,
          acceleration: speedAgility.acceleration || undefined,
          agility: speedAgility.agility || undefined,
          reactionTime: speedAgility.reactionTime || undefined,
          balance: speedAgility.balance || undefined,
          coordination: speedAgility.coordination || undefined,
        },
      });

      await tx.staminaAndRecovery.create({
        data: {
          statId: stats.id,
          vo2Max: staminaRecovery.vo2Max,
          flexibility: staminaRecovery.flexibility,
          recoveryTime: staminaRecovery.recoveryTime,
          Beep_Test: staminaRecovery.Beep_Test || undefined,
          Cooper_Test: staminaRecovery.Cooper_Test || undefined,
          Sit_and_Reach_Test: staminaRecovery.Sit_and_Reach_Test || undefined,
          Active_Straight_Leg_Raise:
            staminaRecovery.Active_Straight_Leg_Raise || undefined,
          Shoulder_External_Internal_Rotation:
            staminaRecovery.Shoulder_External_Internal_Rotation || undefined,
          Knee_to_Wall_Test: staminaRecovery.Knee_to_Wall_Test || undefined,
          Resting_Heart_Rate: staminaRecovery.Resting_Heart_Rate || undefined,
          Post_Exercise_Heart_Rate_Recovery:
            staminaRecovery.Post_Exercise_Heart_Rate_Recovery || undefined,
          Peak_Heart_Rate: staminaRecovery.Peak_Heart_Rate || undefined,
          overallFlexibilityScore:
            staminaRecovery.overallFlexibilityScore || undefined,
          cardiovascularFitnessScore:
            staminaRecovery.cardiovascularFitnessScore || undefined,
          recoveryEfficiencyScore:
            staminaRecovery.recoveryEfficiencyScore || undefined,
          anthropometricData: staminaRecovery.anthropometricData || undefined,
        },
      });

      if (injuries.length > 0) {
        await tx.injuryStat.createMany({
          data: injuries.map((injury) => ({
            statId: stats.id,
            type: injury.type,
            bodyPart: injury.bodyPart,
            severity: injury.severity,
            occurredAt: new Date(injury.occurredAt),
            recoveryTime: injury.recoveryTime,
            recoveredAt: injury.recoveredAt
              ? new Date(injury.recoveredAt)
              : null,
            status: injury.status,
            notes: injury.notes,
          })),
        });
      }

      return stats;
    });
  } catch (error) {
    if (error instanceof ConflictError) throw error;
    throw new DatabaseError("Failed to create athlete stats", error);
  }
}

// Update athlete stats, backup old data, create new performance & injury entries
export async function updateAthleteStats(
  userId: string,
  basicMetrics: {
    height: number;
    weight: number;
    age: number;
    bodyFat: number;
  },
  strengthPower: any,
  speedAgility: any,
  staminaRecovery: any,
  injuries: any[],
  updatedBy: { id: string; firstName: string; lastName?: string }
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Get current stats for history backup
      const currentStats = await tx.stats.findUnique({
        where: { userId },
        include: {
          strength: { orderBy: { createdAt: "desc" }, take: 1 },
          speed: { orderBy: { createdAt: "desc" }, take: 1 },
          stamina: { orderBy: { createdAt: "desc" }, take: 1 },
          injuries: { where: { status: { in: ["active", "recovering"] } } },
        },
      });

      if (!currentStats) throw new NotFoundError("Stats");

      // Prepare old and new values for backup
      const oldValues = [];
      const newValues = [];

      if (currentStats.height !== basicMetrics.height) {
        oldValues.push({ field: "height", value: currentStats.height });
        newValues.push({ field: "height", value: basicMetrics.height });
      }
      if (currentStats.weight !== basicMetrics.weight) {
        oldValues.push({ field: "weight", value: currentStats.weight });
        newValues.push({ field: "weight", value: basicMetrics.weight });
      }
      if (currentStats.age !== basicMetrics.age) {
        oldValues.push({ field: "age", value: currentStats.age });
        newValues.push({ field: "age", value: basicMetrics.age });
      }
      if (currentStats.bodyFat !== basicMetrics.bodyFat) {
        oldValues.push({ field: "bodyFat", value: currentStats.bodyFat });
        newValues.push({ field: "bodyFat", value: basicMetrics.bodyFat });
      }

      if (currentStats.strength[0]) {
        oldValues.push({ field: "strength", value: currentStats.strength[0] });
      }
      if (currentStats.speed[0]) {
        oldValues.push({ field: "speed", value: currentStats.speed[0] });
      }
      if (currentStats.stamina[0]) {
        oldValues.push({ field: "stamina", value: currentStats.stamina[0] });
      }
      if (currentStats.injuries.length > 0) {
        oldValues.push({ field: "injuries", value: currentStats.injuries });
      }

      newValues.push(
        { field: "strength", value: strengthPower },
        { field: "speed", value: speedAgility },
        { field: "stamina", value: staminaRecovery },
        { field: "injuries", value: injuries }
      );

      if (oldValues.length > 0) {
        await tx.statsHistory.create({
          data: {
            StatsId: currentStats.id,
            oldValues,
            newValues,
            updatedBy: updatedBy.id,
            updatedByName: `${updatedBy.firstName} ${
              updatedBy.lastName || ""
            }`.trim(),
          },
        });
      }

      // Update main stats record basics
      const stats = await tx.stats.update({
        where: { userId },
        data: {
          height: basicMetrics.height,
          weight: basicMetrics.weight,
          age: basicMetrics.age,
          bodyFat: basicMetrics.bodyFat,
          lastUpdatedBy: updatedBy.id,
          lastUpdatedAt: new Date(),
          lastUpdatedByName: `${updatedBy.firstName} ${
            updatedBy.lastName || ""
          }`.trim(),
        },
      });

      // Create new strength and power record
      await tx.strengthAndPower.create({
        data: {
          statId: stats.id,
          athleteBodyWeight: strengthPower.athleteBodyWeight,
          Countermovement_Jump: strengthPower.countermovementJump || undefined,
          Loaded_Squat_Jump: strengthPower.loadedSquatJump || undefined,
          Depth_Jump: strengthPower.depthJump || undefined,
          Ballistic_Bench_Press: strengthPower.ballisticBenchPress || undefined,
          Push_Up: strengthPower.pushUp || undefined,
          Ballistic_Push_Up: strengthPower.ballisticPushUp || undefined,
          Deadlift_Velocity: strengthPower.deadliftVelocity || undefined,
          Barbell_Hip_Thrust: strengthPower.barbellHipThrust || undefined,
          Weighted_Pull_up: strengthPower.weightedPullUp || undefined,
          Barbell_Row: strengthPower.barbellRow || undefined,
          Plank_Hold: strengthPower.plankHold || undefined,
          pullUps: strengthPower.pullUps || undefined,
          Pushups: strengthPower.pushups || undefined,
          muscleMass: strengthPower.muscleMass,
          enduranceStrength: strengthPower.enduranceStrength,
          explosivePower: strengthPower.explosivePower,
        },
      });

      // Create new speed and agility record
      await tx.speedAndAgility.create({
        data: {
          statId: stats.id,
          sprintSpeed: speedAgility.sprintSpeed,
          Ten_Meter_Sprint: speedAgility.Ten_Meter_Sprint || undefined,
          Fourty_Meter_Dash: speedAgility.Fourty_Meter_Dash || undefined,
          Repeated_Sprint_Ability:
            speedAgility.Repeated_Sprint_Ability || undefined,
          Five_0_Five_Agility_Test:
            speedAgility.Five_0_Five_Agility_Test || undefined,
          T_Test: speedAgility.T_Test || undefined,
          Illinois_Agility_Test:
            speedAgility.Illinois_Agility_Test || undefined,
          Visual_Reaction_Speed_Drill:
            speedAgility.Visual_Reaction_Speed_Drill || undefined,
          Long_Jump: speedAgility.Long_Jump || undefined,
          Reactive_Agility_T_Test:
            speedAgility.Reactive_Agility_T_Test || undefined,
          Standing_Long_Jump: speedAgility.Standing_Long_Jump || undefined,
          acceleration: speedAgility.acceleration || undefined,
          agility: speedAgility.agility || undefined,
          reactionTime: speedAgility.reactionTime || undefined,
          balance: speedAgility.balance || undefined,
          coordination: speedAgility.coordination || undefined,
        },
      });

      // Create new stamina and recovery record
      await tx.staminaAndRecovery.create({
        data: {
          statId: stats.id,
          vo2Max: staminaRecovery.vo2Max,
          flexibility: staminaRecovery.flexibility,
          recoveryTime: staminaRecovery.recoveryTime,
          Beep_Test: staminaRecovery.Beep_Test || undefined,
          Cooper_Test: staminaRecovery.Cooper_Test || undefined,
          Sit_and_Reach_Test: staminaRecovery.Sit_and_Reach_Test || undefined,
          Active_Straight_Leg_Raise:
            staminaRecovery.Active_Straight_Leg_Raise || undefined,
          Shoulder_External_Internal_Rotation:
            staminaRecovery.Shoulder_External_Internal_Rotation || undefined,
          Knee_to_Wall_Test: staminaRecovery.Knee_to_Wall_Test || undefined,
          Resting_Heart_Rate: staminaRecovery.Resting_Heart_Rate || undefined,
          Post_Exercise_Heart_Rate_Recovery:
            staminaRecovery.Post_Exercise_Heart_Rate_Recovery || undefined,
          Peak_Heart_Rate: staminaRecovery.Peak_Heart_Rate || undefined,
          overallFlexibilityScore:
            staminaRecovery.overallFlexibilityScore || undefined,
          cardiovascularFitnessScore:
            staminaRecovery.cardiovascularFitnessScore || undefined,
          recoveryEfficiencyScore:
            staminaRecovery.recoveryEfficiencyScore || undefined,
          anthropometricData: staminaRecovery.anthropometricData || undefined,
        },
      });

      // Insert new injury stats
      if (injuries.length > 0) {
        await tx.injuryStat.createMany({
          data: injuries.map((injury) => ({
            statId: stats.id,
            type: injury.type,
            bodyPart: injury.bodyPart,
            severity: injury.severity,
            occurredAt: new Date(injury.occurredAt),
            recoveryTime: injury.recoveryTime,
            recoveredAt: injury.recoveredAt
              ? new Date(injury.recoveredAt)
              : null,
            status: injury.status,
            notes: injury.notes,
          })),
        });
      }

      return stats;
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError)
      throw error;
    throw new DatabaseError("Failed to update athlete stats", error);
  }
}
