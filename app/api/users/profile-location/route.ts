// app/api/evaluation-requests/route.ts (FIXED VALIDATION)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// FIXED: Use uuid() validation instead of cuid()
const createRequestSchema = z.object({
  guideId: z.string().uuid("Invalid guide ID format"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(150, "Message too long"),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("🔍 Request body received:", {
      guideId: body.guideId,
      guideIdType: typeof body.guideId,
      guideIdLength: body.guideId?.length,
      message: body.message?.substring(0, 50) + "...",
    });

    // Add debug logging
    console.log("Request body:", body);

    const { guideId, message } = body;

    // Check if user already has pending request to this guide
    const existingRequest = await prisma.physicalEvaluationRequest.findFirst({
      where: {
        userId,
        guideId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: "You already have a pending request with this guide",
        },
        { status: 400 }
      );
    }

    // Get user and guide details for notification
    const [user, guide] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, PrimarySport: true },
      }),
      prisma.guide.findUnique({
        where: { id: guideId },
        include: { user: { select: { id: true } } },
      }),
    ]);

    if (!user || !guide) {
      return NextResponse.json(
        { error: "User or guide not found" },
        { status: 404 }
      );
    }

    // Create evaluation request using existing model
    const evaluationRequest = await prisma.physicalEvaluationRequest.create({
      data: {
        userId,
        guideId,
        message: message.trim(),
        status: "PENDING",
      },
    });

    // Create notification for guide
    await prisma.notification.create({
      data: {
        userId: guide.user.id,
        actorId: userId,
        type: "STAT_UPDATE_REQUEST",
        title: "New Evaluation Request",
        message: `${user.firstName} ${user.lastName} requested an evaluation`,
        data: {
          requestId: evaluationRequest.id,
          requestType: "evaluation_request",
          userSport: user.PrimarySport,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        requestId: evaluationRequest.id,
        message: "Request sent successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating evaluation request:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to send request",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
