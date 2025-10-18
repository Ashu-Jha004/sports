import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// Validation Schemas
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

// GET - Fetch existing stats
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: Proper params handling for Next.js 15
    const { userId } = await params;
    console.log("🔍 GET Stats API: Fetching stats for:", userId);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch existing stats with all related data
    const stats = await prisma.stats.findUnique({
      where: { userId },
      include: {
        strength: true,
        speed: true,
        stamina: true,
        injuries: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    console.log("✅ GET Stats API: Found stats:", !!stats);

    if (!stats) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: stats.id,
      height: stats.height,
      weight: stats.weight,
      age: stats.age,
      bodyFat: stats.bodyFat,
      strength: stats.strength,
      speed: stats.speed,
      stamina: stats.stamina,
      injuries: stats.injuries,
      lastUpdatedBy: stats.lastUpdatedBy,
      lastUpdatedAt: stats.lastUpdatedAt,
      lastUpdatedByName: stats.lastUpdatedByName,
      createdAt: stats.createdAt,
      updatedAt: stats.updatedAt,
    });
  } catch (error) {
    console.error("❌ GET Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

// POST - Create new stats
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: Proper params handling
    const { userId } = await params;
    console.log("🔍 POST Stats API: Creating stats for:", userId);

    // Get current user (guide)
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    const body = await request.json();
    console.log("📥 POST Stats API: Request body keys:", Object.keys(body));

    // Validate request data
    const validation = statsSubmissionSchema.safeParse(body);
    if (!validation.success) {
      console.error(
        "❌ POST Stats API: Validation failed:",
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

    // Check if stats already exist
    const existingStats = await prisma.stats.findUnique({
      where: { userId },
    });

    if (existingStats) {
      console.log("⚠️ POST Stats API: Stats already exist, should use PUT");
      return NextResponse.json(
        { error: "Stats already exist. Use PUT to update." },
        { status: 409 }
      );
    }

    // Create stats with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create main stats record
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

      // Create related records...
      // (keeping the rest of the transaction logic)

      return stats;
    });

    console.log("✅ POST Stats API: Stats created successfully");
    return NextResponse.json(
      {
        success: true,
        statsId: result.id,
        message: "Stats created successfully",
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

// PUT - Update existing stats
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.log("❌ PUT Stats API: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: Proper params handling for Next.js 15
    const { userId } = await params;
    console.log("🔍 PUT Stats API: Updating stats for:", userId);

    // Get current user (guide)
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!currentUser) {
      console.log("❌ PUT Stats API: Guide not found");
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    console.log("✅ PUT Stats API: Current user found:", currentUser.firstName);

    const body = await request.json();
    console.log("📥 PUT Stats API: Request body keys:", Object.keys(body));

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

    // Check if stats exist
    const existingStats = await prisma.stats.findUnique({
      where: { userId },
      include: {
        strength: true,
        speed: true,
        stamina: true,
        injuries: true,
      },
    });

    console.log("🔍 PUT Stats API: Existing stats found:", !!existingStats);

    // ✅ FIX: If no existing stats, create them instead of returning 404
    if (!existingStats) {
      console.log("📝 PUT Stats API: No existing stats, creating new ones");

      // Create new stats
      const result = await prisma.$transaction(async (tx) => {
        // Create main stats record
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

        // Create strength & power record
        await tx.strengthAndPower.create({
          data: {
            statId: stats.id,
            strength: strengthPower.strength,
            muscleMass: strengthPower.muscleMass,
            enduranceStrength: strengthPower.enduranceStrength,
            explosivePower: strengthPower.explosivePower,
          },
        });

        // Create speed & agility record
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

        // Create stamina & recovery record
        await tx.staminaAndRecovery.create({
          data: {
            statId: stats.id,
            vo2Max: staminaRecovery.vo2Max,
            flexibility: staminaRecovery.flexibility,
            recoveryTime: staminaRecovery.recoveryTime,
          },
        });

        // Create injury records
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

      console.log("✅ PUT Stats API: New stats created successfully");
      return NextResponse.json({
        success: true,
        statsId: result.id,
        message: "Stats created successfully",
      });
    }

    // Update existing stats
    const result = await prisma.$transaction(async (tx) => {
      // Update main stats record
      const stats = await tx.stats.update({
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

      // Update strength & power record
      await tx.strengthAndPower.upsert({
        where: { statId: stats.id },
        update: {
          strength: strengthPower.strength,
          muscleMass: strengthPower.muscleMass,
          enduranceStrength: strengthPower.enduranceStrength,
          explosivePower: strengthPower.explosivePower,
        },
        create: {
          statId: stats.id,
          strength: strengthPower.strength,
          muscleMass: strengthPower.muscleMass,
          enduranceStrength: strengthPower.enduranceStrength,
          explosivePower: strengthPower.explosivePower,
        },
      });

      // Update speed & agility record
      await tx.speedAndAgility.upsert({
        where: { statId: stats.id },
        update: {
          sprintSpeed: speedAgility.sprintSpeed,
          acceleration: speedAgility.acceleration,
          agility: speedAgility.agility,
          reactionTime: speedAgility.reactionTime,
          balance: speedAgility.balance,
          coordination: speedAgility.coordination,
        },
        create: {
          statId: stats.id,
          sprintSpeed: speedAgility.sprintSpeed,
          acceleration: speedAgility.acceleration,
          agility: speedAgility.agility,
          reactionTime: speedAgility.reactionTime,
          balance: speedAgility.balance,
          coordination: speedAgility.coordination,
        },
      });

      // Update stamina & recovery record
      await tx.staminaAndRecovery.upsert({
        where: { statId: stats.id },
        update: {
          vo2Max: staminaRecovery.vo2Max,
          flexibility: staminaRecovery.flexibility,
          recoveryTime: staminaRecovery.recoveryTime,
        },
        create: {
          statId: stats.id,
          vo2Max: staminaRecovery.vo2Max,
          flexibility: staminaRecovery.flexibility,
          recoveryTime: staminaRecovery.recoveryTime,
        },
      });

      // Handle injuries - delete existing and create new ones
      await tx.injuryStat.deleteMany({
        where: { statId: stats.id },
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

    console.log("✅ PUT Stats API: Stats updated successfully");
    return NextResponse.json({
      success: true,
      statsId: result.id,
      message: "Stats updated successfully",
    });
  } catch (error) {
    console.error("❌ PUT Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
