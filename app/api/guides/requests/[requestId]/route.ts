// app/api/guides/requests/[requestId]/route.ts (FIXED WITH CORRECT TYPES)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const updateRequestSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
  response: z.string().min(1).max(500).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    const body = await request.json();
    const { action, response } = updateRequestSchema.parse(body);

    // Get user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get guide info
    const guide = await prisma.guide.findFirst({
      where: {
        userId: user.id,
        status: "approved",
      },
      select: { id: true },
    });

    if (!guide) {
      return NextResponse.json(
        { error: "Guide access required" },
        { status: 403 }
      );
    }

    // Get the request and verify ownership
    const evaluationRequest = await prisma.physicalEvaluationRequest.findFirst({
      where: {
        id: requestId,
        guideId: guide.id,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!evaluationRequest) {
      return NextResponse.json(
        {
          error: "Request not found or already processed",
        },
        { status: 404 }
      );
    }

    // Update request status
    const newStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const updatedRequest = await prisma.physicalEvaluationRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
      },
    });

    // FIXED: Create notification with correct NotificationType
    const notificationType =
      action === "ACCEPT" ? "STAT_UPDATE_APPROVED" : "STAT_UPDATE_DENIED";
    const actionText = action === "ACCEPT" ? "accepted" : "rejected";

    await prisma.notification.create({
      data: {
        userId: evaluationRequest.user.id,
        actorId: user.id,
        type: notificationType, // Using STAT_UPDATE_APPROVED or STAT_UPDATE_DENIED
        title: `Evaluation Request ${
          actionText.charAt(0).toUpperCase() + actionText.slice(1)
        }`,
        message: `${user.firstName} ${
          user.lastName
        } ${actionText} your evaluation request${
          response ? ": " + response : ""
        }`,
        data: {
          requestId: updatedRequest.id,
          action: newStatus,
          guideId: guide.id,
          requestType: "evaluation_request",
        },
      },
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Request ${actionText} successfully`,
    });
  } catch (error) {
    console.error("Error updating request:", error);

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
        error: "Failed to update request",
      },
      { status: 500 }
    );
  }
}
