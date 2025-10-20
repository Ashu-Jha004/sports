import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// Validation schemas
const basicMetricsSchema = z.object({
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(200),
  age: z.number().int().min(10).max(50),
  bodyFat: z.number().min(3).max(40),
});

const strengthPowerSchema = z.object({
  strength: z.number().min(0).max(100),
  muscleMass: z.number().min(0).max(100),
  enduranceStrength: z.number().min(0).max(100),
  explosivePower: z.number().min(0).max(100),
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
  strengthPower: strengthPowerSchema,
  speedAgility: speedAgilitySchema,
  staminaRecovery: staminaRecoverySchema,
  injuries: z.array(injurySchema),
  isUpdate: z.boolean().optional(),
});

// Helper function to check moderator role
async function checkModeratorAccess(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      roles: true,
    },
  });

  if (!user) {
    return { isAuthorized: false, error: "User not found" };
  }
  let guideRole = user.roles.includes("MODERATOR");

  // Check if user is moderator (adjust role names as needed)
  if (guideRole == false) {
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

// ✅ GET - Fetch ALL stats records (current + historical)
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
    console.log("🔍 GET Stats API: Fetching all stats for athlete:", userId);

    // Verify athlete exists
    const athlete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // ✅ Fetch ALL stats records (current + historical arrays)
    const stats = await prisma.stats.findUnique({
      where: { userId },
      include: {
        // Get ALL strength records (historical tracking)
        strength: {
          orderBy: { createdAt: "desc" },
        },
        // Get ALL speed records
        speed: {
          orderBy: { createdAt: "desc" },
        },
        // Get ALL stamina records
        stamina: {
          orderBy: { createdAt: "desc" },
        },
        // Get ALL injury records
        injuries: {
          orderBy: { createdAt: "desc" },
        },
        // Get update history
        history: {
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to recent 10 updates
        },
      },
    });

    if (!stats) {
      console.log(
        "ℹ️ GET Stats API: No stats found for athlete, returning null"
      );
      return NextResponse.json(null);
    }

    console.log("✅ GET Stats API: Found stats with historical data:", {
      strengthRecords: stats.strength.length,
      speedRecords: stats.speed.length,
      staminaRecords: stats.stamina.length,
      injuryRecords: stats.injuries.length,
      historyRecords: stats.history.length,
    });

    // ✅ Return ALL data (current + historical)
    // ✅ REPLACE: The entire return NextResponse.json() section in GET method with this:
    return NextResponse.json({
      // Main stats info
      id: stats.id,
      userId: stats.userId,
      height: stats.height,
      weight: stats.weight,
      age: stats.age,
      bodyFat: stats.bodyFat,

      // ✅ NEW: Current values (latest from each array) - what the wizard expects
      currentStrength: stats.strength[0] || null,
      currentSpeed: stats.speed[0] || null,
      currentStamina: stats.stamina[0] || null,
      activeInjuries: stats.injuries.filter(
        (injury) => injury.status === "active" || injury.status === "recovering"
      ),

      // ✅ BACKWARD COMPATIBILITY: Keep old field names for existing frontend code
      strength: stats.strength[0] || null,
      speed: stats.speed[0] || null,
      stamina: stats.stamina[0] || null,
      injuries: stats.injuries.filter(
        (injury) => injury.status === "active" || injury.status === "recovering"
      ),

      // ✅ NEW: Historical arrays (for future features)
      strengthHistory: stats.strength,
      speedHistory: stats.speed,
      staminaHistory: stats.stamina,
      injuryHistory: stats.injuries,

      // Metadata
      lastUpdatedBy: stats.lastUpdatedBy,
      lastUpdatedAt: stats.lastUpdatedAt,
      lastUpdatedByName: stats.lastUpdatedByName,
      createdAt: stats.createdAt,
      updatedAt: stats.updatedAt,

      // ✅ NEW: Athlete info
      athlete: {
        id: athlete.id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
      },
    });
  } catch (error) {
    console.error("❌ GET Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

// ✅ PUT - Update stats with history backup
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check moderator access
    const accessCheck = await checkModeratorAccess(clerkUserId);
    if (!accessCheck.isAuthorized) {
      console.log("❌ PUT Stats API: Access denied:", accessCheck.error);
      return NextResponse.json({ error: accessCheck.error }, { status: 403 });
    }

    const currentUser = accessCheck.user!;
    const { userId } = await params;
    const body = await request.json();

    // Validate user ID match
    if (body.userId !== userId) {
      console.error("❌ PUT Stats API: User ID mismatch!");
      return NextResponse.json(
        {
          error: "User ID mismatch - potential data corruption prevented",
        },
        { status: 400 }
      );
    }

    console.log(
      "🔍 PUT Stats API: Updating stats for athlete:",
      userId,
      "by moderator:",
      currentUser.firstName
    );

    // Validate request data
    const validation = statsSubmissionSchema.safeParse(body);
    if (!validation.success) {
      console.error(
        "❌ PUT Stats API: Validation failed:",
        validation.error.issues
      );
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

    // ✅ Main transaction: Backup old data, then update with new data
    const result = await prisma.$transaction(
      async (tx) => {
        console.log("🔄 PUT Transaction: Starting update with history backup");

        // Step 1: Get current stats to backup
        const currentStats = await tx.stats.findUnique({
          where: { userId },
          include: {
            strength: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            speed: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            stamina: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            injuries: {
              where: {
                status: { in: ["active", "recovering"] },
              },
            },
          },
        });

        let stats;

        if (currentStats) {
          // ✅ Step 2: Backup current values to history
          const oldValues = [];
          const newValues = [];

          // Backup basic metrics
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

          // Backup performance data
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

          // Create history record
          if (oldValues.length > 0) {
            await tx.statsHistory.create({
              data: {
                StatsId: currentStats.id,
                oldValues: oldValues,
                newValues: newValues,
                updatedBy: currentUser.id,
                updatedByName: `${currentUser.firstName} ${
                  currentUser.lastName || ""
                }`.trim(),
              },
            });
            console.log("✅ PUT Transaction: History record created");
          }

          // ✅ Step 3: Update main stats record
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
          // Create new stats record
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
        }

        // ✅ Step 4: Create new records in performance arrays (this preserves history)
        await tx.strengthAndPower.create({
          data: {
            statId: stats.id,
            strength: strengthPower.strength,
            muscleMass: strengthPower.muscleMass,
            enduranceStrength: strengthPower.enduranceStrength,
            explosivePower: strengthPower.explosivePower,
          },
        });
        console.log("✅ PUT Transaction: New strength record created");

        await tx.speedAndAgility.create({
          data: {
            statId: stats.id,
            sprintSpeed: speedAgility.sprintSpeed,
            acceleration: speedAgility.acceleration,
            agility: speedAgility.agility,
            reactionTime: speedAgility.reactionTime,
            balance: speedAgility.balance,
            coordination: speedAgility.coordination,
          },
        });
        console.log("✅ PUT Transaction: New speed record created");

        await tx.staminaAndRecovery.create({
          data: {
            statId: stats.id,
            vo2Max: staminaRecovery.vo2Max,
            flexibility: staminaRecovery.flexibility,
            recoveryTime: staminaRecovery.recoveryTime,
          },
        });
        console.log("✅ PUT Transaction: New stamina record created");

        // ✅ Step 5: Handle injuries (mark old as recovered, create new active ones)
        if (currentStats) {
          // Mark existing active injuries as recovered
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

        // Create new injury records
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
          console.log(
            `✅ PUT Transaction: ${injuries.length} new injury records created`
          );
        }

        console.log("✅ PUT Transaction: All updates completed successfully");
        return stats;
      },
      {
        timeout: 25000, // 25 second timeout for complex operations
      }
    );

    console.log(
      "✅ PUT Stats API: Stats updated successfully with history backup"
    );
    return NextResponse.json({
      success: true,
      statsId: result.id,
      message:
        "Stats updated successfully. Previous data backed up to history.",
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

// ✅ POST - Create initial stats (for new athletes)
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check moderator access
    const accessCheck = await checkModeratorAccess(clerkUserId);
    if (!accessCheck.isAuthorized) {
      return NextResponse.json({ error: accessCheck.error }, { status: 403 });
    }

    const currentUser = accessCheck.user!;
    const { userId } = await params;
    const body = await request.json();

    // Validate request
    const validation = statsSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if stats already exist
    const existingStats = await prisma.stats.findUnique({
      where: { userId },
    });

    if (existingStats) {
      return NextResponse.json(
        { error: "Stats already exist for this athlete. Use PUT to update." },
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

    // Create initial stats
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

      // Create initial performance records
      await Promise.all([
        tx.strengthAndPower.create({
          data: { statId: stats.id, ...strengthPower },
        }),
        tx.speedAndAgility.create({
          data: { statId: stats.id, ...speedAgility },
        }),
        tx.staminaAndRecovery.create({
          data: { statId: stats.id, ...staminaRecovery },
        }),
      ]);

      // Create initial injury records
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
        message: "Initial stats created successfully",
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
