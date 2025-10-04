// app/api/guides/evaluation-requests/route.ts (ENHANCED WITH REQUEST TRACKING)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const createRequestSchema = z.object({
  guideId: z.string().uuid("Invalid guide ID format"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(150, "Message too long"),
});
type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
const STATUS_MESSAGES: Record<RequestStatus, string> = {
  PENDING: "You already have a pending request with this guide",
  ACCEPTED: "You already have an accepted evaluation with this guide",
  REJECTED: "Previous request was rejected",
  CANCELLED: "Previous request was cancelled",
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guideId, message } = createRequestSchema.parse(body);

    // Get user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        PrimarySport: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const targetGuide = await prisma.guide.findUnique({
      where: { id: guideId },
      select: {
        id: true,
        userId: true,
        user: { select: { id: true } },
      },
    });

    if (!targetGuide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }
    // ADDED: Prevent self-evaluation requests
    if (targetGuide.userId === user.id) {
      return NextResponse.json(
        {
          error: "You cannot request an evaluation from yourself",
          errorType: "SELF_REQUEST_NOT_ALLOWED",
        },
        { status: 400 }
      );
    }
    // ENHANCED: Check for existing requests with various statuses
    const existingRequest = await prisma.physicalEvaluationRequest.findFirst({
      where: {
        userId: user.id,
        guideId,
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    if (existingRequest) {
      const statusMessages = {
        PENDING: "You already have a pending request with this guide",
        ACCEPTED: "You already have an accepted evaluation with this guide",
      };

      const status = existingRequest.status as keyof typeof statusMessages;
      const errorMessage =
        statusMessages[status] || "You already have a request with this guide";

      return NextResponse.json(
        {
          error: errorMessage,
          existingRequestId: existingRequest.id,
          requestStatus: status,
        },
        { status: 400 }
      );
    }
    // Check if user has been rejected recently (within 7 days) - optional cooldown
    const recentRejection = await prisma.physicalEvaluationRequest.findFirst({
      where: {
        userId: user.id,
        guideId,
        status: "REJECTED",
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      },
    });

    if (recentRejection) {
      return NextResponse.json(
        {
          error:
            "Please wait 7 days before sending another request to this guide",
          cooldownUntil: new Date(
            recentRejection.updatedAt.getTime() + 7 * 24 * 60 * 60 * 1000
          ),
        },
        { status: 400 }
      );
    }

    // Verify guide exists
    const guide = await prisma.guide.findUnique({
      where: { id: guideId },
      include: { user: { select: { id: true } } },
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    // Create evaluation request
    const evaluationRequest = await prisma.physicalEvaluationRequest.create({
      data: {
        userId: user.id,
        guideId,
        message: message.trim(),
        status: "PENDING",
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: guide.user.id,
        actorId: user.id,
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
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to send request",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
