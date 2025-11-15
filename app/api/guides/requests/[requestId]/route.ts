import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z, ZodError } from "zod";

const acceptRequestSchema = z.object({
  action: z.literal("ACCEPT"),
  message: z.string().min(1).max(500),
  location: z.string().min(1).max(200),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  scheduledTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  equipment: z.string().max(300).optional(),
});

const rejectRequestSchema = z.object({
  action: z.literal("REJECT"),
  message: z.string().min(1).max(500).optional(),
});

const updateRequestSchema = z.union([acceptRequestSchema, rejectRequestSchema]);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const parseEquipment = (equipmentString: string): string[] => {
  if (!equipmentString.trim()) return [];
  return equipmentString
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

interface RouteContext {
  params: Promise<{ requestId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await context.params;
    if (!requestId) {
      return NextResponse.json(
        { error: "Missing requestId parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateRequestSchema.parse(body);

    // Logger.debug("Validated data", validatedData);

    // Retrieve user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check guide approval status
    const guide = await prisma.guide.findFirst({
      where: { userId: user.id, status: "approved" },
      select: { id: true },
    });

    if (!guide) {
      return NextResponse.json(
        { error: "Guide access required" },
        { status: 403 }
      );
    }

    // Fetch pending evaluation request owned by this guide
    const evaluationRequest = await prisma.physicalEvaluationRequest.findFirst({
      where: { id: requestId, guideId: guide.id, status: "PENDING" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!evaluationRequest) {
      return NextResponse.json(
        { error: "Request not found or already processed" },
        { status: 404 }
      );
    }

    // Prepare update data
    const newStatus =
      validatedData.action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const updateData: Record<string, any> = { status: newStatus };

    let generatedOTP: number | undefined;

    if (validatedData.action === "ACCEPT") {
      generatedOTP = generateOTP();
      const equipmentArray = parseEquipment(validatedData.equipment ?? "");

      Object.assign(updateData, {
        MessageFromModerator: validatedData.message,
        location: validatedData.location,
        scheduledDate: new Date(validatedData.scheduledDate + "T00:00:00.000Z"),
        scheduledTime: validatedData.scheduledTime,
        equipment: equipmentArray,
        OTP: generatedOTP,
      });
    } else if (validatedData.message) {
      updateData.MessageFromModerator = validatedData.message;
    }

    // Update the physical evaluation request
    const updatedRequest = await prisma.physicalEvaluationRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Compose notification message
    const actionText =
      validatedData.action === "ACCEPT" ? "accepted" : "rejected";
    let notificationMessage = `${user.firstName} ${user.lastName} ${actionText} your evaluation request`;

    if (validatedData.action === "ACCEPT") {
      notificationMessage += `. Meeting scheduled for ${validatedData.scheduledDate} at ${validatedData.scheduledTime}. Location: ${validatedData.location}. Verification OTP: ${generatedOTP}`;
    }

    if (validatedData.message) {
      notificationMessage += `. Message: "${validatedData.message}"`;
    }

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: evaluationRequest.user.id,
        actorId: user.id,
        type:
          validatedData.action === "ACCEPT"
            ? "STAT_UPDATE_APPROVED"
            : "STAT_UPDATE_DENIED",
        title: `Evaluation Request ${
          actionText[0].toUpperCase() + actionText.slice(1)
        }`,
        message: notificationMessage,
        data: {
          requestId: updatedRequest.id,
          action: newStatus,
          guideId: guide.id,
          requestType: "evaluation_request",
          ...(validatedData.action === "ACCEPT" && {
            location: validatedData.location,
            scheduledDate: validatedData.scheduledDate,
            scheduledTime: validatedData.scheduledTime,
            otp: generatedOTP,
            equipment: parseEquipment(validatedData.equipment ?? ""),
          }),
        },
      },
    });

    // Construct response including OTP if accepted
    const responsePayload: any = {
      success: true,
      request: updatedRequest,
      message: `Request ${actionText} successfully`,
    };
    if (generatedOTP) {
      responsePayload.otp = generatedOTP;
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    // Log error for debugging (ideally replace with a proper logger)
    console.error("Error updating request:", error);

    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
