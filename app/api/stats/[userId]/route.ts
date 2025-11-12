import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { strengthPowerTestDataSchema } from "@/lib/stats/validators/strengthTests";

// Validation schemas (keep or simplify old ones you still need)
const basicMetricsSchema = z.object({
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(200),
  age: z.number().int().min(10).max(50),
  bodyFat: z.number().min(3).max(40),
});
const speedAgilitySchema = z.object({
  sprintSpeed: z.number().min(0).max(100),
  acceleration: z.number().min(0).max(100),
  agility: z.number().min(0).max(100),
  reactionTime: z.number().min(0).max(100),
  balance: z.number().min(0).max(100),
  coordination: z.number().min(0).max(100),
});
const staminaRecoverySchema = z.object({
  vo2Max: z.number().min(20).max(80),
  flexibility: z.number().min(-20).max(50),
  recoveryTime: z.number().min(30).max(600),
});
const injurySchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  bodyPart: z.string().min(1),
  severity: z.enum(["mild", "moderate", "severe"]),
  occurredAt: z.string(),
  recoveryTime: z.number().nullable(),
  recoveredAt: z.string().nullable(),
  status: z.enum(["active", "recovering", "recovered"]),
  notes: z.string(),
});
const statsSubmissionSchema = z.object({
  userId: z.string(),
  basicMetrics: basicMetricsSchema,
  strengthPower: strengthPowerTestDataSchema,
  speedAgility: speedAgilitySchema,
  staminaRecovery: staminaRecoverySchema,
  injuries: z.array(injurySchema),
  isUpdate: z.boolean().optional(),
});
// Moderator check function unchanged
async function checkModeratorAccess(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, firstName: true, lastName: true, roles: true },
  });

  if (!user) {
    return { isAuthorized: false, error: "User not found" };
  }

  if (!user.roles.includes("MODERATOR")) {
    return {
      isAuthorized: false,
      error: "Access denied. Only moderators can update athlete stats.",
    };
  }

  return {
    isAuthorized: true,
    user,
  };
}
// GET method updated to include detailed latest strength data, full historicals kept
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const athlete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    const stats = await prisma.stats.findUnique({
      where: { userId },
      include: {
        strength: { orderBy: { createdAt: "desc" } },
        speed: { orderBy: { createdAt: "desc" } },
        stamina: { orderBy: { createdAt: "desc" } },
        injuries: { orderBy: { createdAt: "desc" } },
        history: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!stats) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: stats.id,
      userId: stats.userId,
      height: stats.height,
      weight: stats.weight,
      age: stats.age,
      bodyFat: stats.bodyFat,

      currentStrength: stats.strength[0] || null, // new detailed strength data as JSON
      currentSpeed: stats.speed[0] || null,
      currentStamina: stats.stamina[0] || null,
      activeInjuries: stats.injuries.filter(
        (injury) => injury.status === "active" || injury.status === "recovering"
      ),

      strength: stats.strength[0] || null,
      speed: stats.speed[0] || null,
      stamina: stats.stamina[0] || null,
      injuries: stats.injuries.filter(
        (injury) => injury.status === "active" || injury.status === "recovering"
      ),

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
    });
  } catch (error) {
    console.error("❌ GET Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
// PUT - Update stats with detailed strengthPower tests, backup old data to history
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessCheck = await checkModeratorAccess(clerkUserId);
    if (!accessCheck.isAuthorized) {
      return NextResponse.json({ error: accessCheck.error }, { status: 403 });
    }
    const currentUser = accessCheck.user!;
    const { userId } = await params;
    const body = await request.json();
    console.log("body:", body);

    if (body.userId !== userId) {
      return NextResponse.json(
        { error: "User ID mismatch - potential data corruption prevented" },
        { status: 400 }
      );
    }

    const validation = statsSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      basicMetrics,
      strengthPower,
      speedAgility,
      staminaRecovery,
      injuries,
    } = validation.data;

    const result = await prisma.$transaction(
      async (tx) => {
        // Get current stats for backup
        const currentStats = await tx.stats.findUnique({
          where: { userId },
          include: {
            strength: { orderBy: { createdAt: "desc" }, take: 1 },
            speed: { orderBy: { createdAt: "desc" }, take: 1 },
            stamina: { orderBy: { createdAt: "desc" }, take: 1 },
            injuries: { where: { status: { in: ["active", "recovering"] } } },
          },
        });

        let stats;

        if (currentStats) {
          // Backup changed fields to history
          const oldValues = [];
          const newValues = []; // Compare and backup basicMetrics

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
          } // Backup performance data (new complex strengthPower JSON)

          if (currentStats.strength[0]) {
            oldValues.push({
              field: "strength",
              value: currentStats.strength[0],
            });
          }
          if (currentStats.speed[0]) {
            oldValues.push({ field: "speed", value: currentStats.speed[0] });
          }
          if (currentStats.stamina[0]) {
            oldValues.push({
              field: "stamina",
              value: currentStats.stamina[0],
            });
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
                updatedBy: currentUser.id,
                updatedByName: `${currentUser.firstName} ${
                  currentUser.lastName || ""
                }`.trim(),
              },
            });
          } // Update main stats record

          stats = await tx.stats.update({
            where: { userId },
            data: {
              height: basicMetrics.height,
              weight: basicMetrics.weight,
              age: basicMetrics.age,
              bodyFat: basicMetrics.bodyFat,
              lastUpdatedBy: currentUser.id,
              lastUpdatedAt: new Date(),
              lastUpdatedByName: `${currentUser.firstName} ${
                currentUser.lastName || ""
              }`.trim(),
            },
          });
        } else {
          // Create new stats record if none exist
          stats = await tx.stats.create({
            data: {
              userId,
              height: basicMetrics.height,
              weight: basicMetrics.weight,
              age: basicMetrics.age,
              bodyFat: basicMetrics.bodyFat,
              lastUpdatedBy: currentUser.id,
              lastUpdatedAt: new Date(),
              lastUpdatedByName: `${currentUser.firstName} ${
                currentUser.lastName || ""
              }`.trim(),
            },
          });
        } // Create new performance records preserving history

        await tx.strengthAndPower.create({
          data: {
            statId: stats.id,
            athleteBodyWeight: strengthPower.athleteBodyWeight,
            Countermovement_Jump:
              strengthPower.countermovementJump || undefined,
            Loaded_Squat_Jump: strengthPower.loadedSquatJump || undefined,
            Depth_Jump: strengthPower.depthJump || undefined,
            Ballistic_Bench_Press:
              strengthPower.ballisticBenchPress || undefined,
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
            ...speedAgility,
          },
        });

        await tx.staminaAndRecovery.create({
          data: {
            statId: stats.id,
            ...staminaRecovery,
          },
        }); // Handle injuries: Mark old active injuries as recovered

        if (currentStats) {
          await tx.injuryStat.updateMany({
            where: {
              statId: stats.id,
              status: { in: ["active", "recovering"] },
            },
            data: {
              status: "recovered",
              recoveredAt: new Date(),
            },
          });
        }

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
      },
      { timeout: 25000 }
    );

    return NextResponse.json({
      success: true,
      statsId: result.id,
      message:
        "Stats updated successfully with detailed strength tests and history backup.",
      updatedBy: `${currentUser.firstName} ${
        currentUser.lastName || ""
      }`.trim(),
    });
  } catch (error) {
    console.error("❌ PUT Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
// POST - Create initial stats with detailed strengthPower tests
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessCheck = await checkModeratorAccess(clerkUserId);
    if (!accessCheck.isAuthorized) {
      return NextResponse.json({ error: accessCheck.error }, { status: 403 });
    }
    const currentUser = accessCheck.user!;
    const { userId } = await params;
    const body = await request.json();

    const validation = statsSubmissionSchema.safeParse(body);
    console.log("Validation result:", validation);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const existingStats = await prisma.stats.findUnique({ where: { userId } });
    if (existingStats) {
      return NextResponse.json(
        { error: "Stats already exist. Use PUT to update." },
        { status: 409 }
      );
    }

    const {
      basicMetrics,
      strengthPower,
      speedAgility,
      staminaRecovery,
      injuries,
    } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      const stats = await tx.stats.create({
        data: {
          userId,
          height: basicMetrics.height,
          weight: basicMetrics.weight,
          age: basicMetrics.age,
          bodyFat: basicMetrics.bodyFat,
          lastUpdatedBy: currentUser.id,
          lastUpdatedAt: new Date(),
          lastUpdatedByName: `${currentUser.firstName} ${
            currentUser.lastName || ""
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
          Pushups: strengthPower.pushups || undefined, // legacy field
          muscleMass: strengthPower.muscleMass,
          enduranceStrength: strengthPower.enduranceStrength,
          explosivePower: strengthPower.explosivePower,
        },
      });

      await tx.speedAndAgility.create({
        data: { statId: stats.id, ...speedAgility },
      });

      await tx.staminaAndRecovery.create({
        data: { statId: stats.id, ...staminaRecovery },
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

    return NextResponse.json(
      {
        success: true,
        statsId: result.id,
        message:
          "Initial stats created successfully with detailed strength tests.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to create stats" },
      { status: 500 }
    );
  }
}
