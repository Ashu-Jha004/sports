// app/api/stats/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  getAthleteStats,
  createAthleteStats,
  updateAthleteStats,
} from "./services/stats.service";
import { auth } from "@clerk/nextjs/server";
import { statsSubmissionSchema } from "./types"; // your Zod schema
import { ValidationError, NotFoundError } from "./types";
import { checkModeratorAccess } from "./middleware";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const clerkUserId = (await auth()).userId;
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const stats = await getAthleteStats(userId);

    if (!stats) {
      return NextResponse.json(null);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const clerkUserId = (await auth()).userId;
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await checkModeratorAccess(clerkUserId);

    const { userId } = await params;
    const body = await request.json();

    // Validate body schema
    const validation = statsSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    if (body.userId !== userId) {
      return NextResponse.json(
        { error: "User ID mismatch - potential data corruption prevented" },
        { status: 400 }
      );
    }

    // Create stats via service
    const result = await createAthleteStats(
      userId,
      body.basicMetrics,
      body.strengthPower,
      body.speedAgility,
      body.staminaRecovery,
      body.injuries,
      { id: clerkUserId, firstName: "Moderator" } // Ideally get more user info
    );

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
    console.error("POST Stats API Error:", error);
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to create stats" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const clerkUserId = (await auth()).userId;
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await checkModeratorAccess(clerkUserId);

    const { userId } = await params;
    const body = await request.json();

    // Validate body schema
    const validation = statsSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    if (body.userId !== userId) {
      return NextResponse.json(
        { error: "User ID mismatch - potential data corruption prevented" },
        { status: 400 }
      );
    }

    // Update stats using service
    const updatedStats = await updateAthleteStats(
      userId,
      body.basicMetrics,
      body.strengthPower,
      body.speedAgility,
      body.staminaRecovery,
      body.injuries,
      { id: clerkUserId, firstName: "Moderator" } // Ideally get more user info
    );

    return NextResponse.json({
      success: true,
      statsId: updatedStats.id,
      message:
        "Stats updated successfully with detailed strength tests and history backup.",
    });
  } catch (error) {
    console.error("PUT Stats API Error:", error);
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
