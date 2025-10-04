// app/api/guides/requests/[requestId]/route.ts (ENHANCED WITH SCHEDULING DATA & OTP)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// Enhanced validation schemas
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

// OTP generation function
const generateOTP = (): number => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

// Equipment parsing function
const parseEquipment = (equipmentString: string): string[] => {
  if (!equipmentString.trim()) return [];
  return equipmentString
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

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

    console.log("📥 Received request data:", body);

    const validatedData = updateRequestSchema.parse(body);
    console.log("✅ Validated data:", validatedData);

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

    // Prepare update data based on action
    const newStatus =
      validatedData.action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
    let updateData: any = {
      status: newStatus,
    };

    let generatedOTP: number | null = null;

    if (validatedData.action === "ACCEPT") {
      // Generate OTP for accepted requests
      generatedOTP = generateOTP();

      // Parse equipment from comma-separated string to array
      const equipmentArray = parseEquipment(validatedData.equipment || "");

      updateData = {
        ...updateData,
        MessageFromModerator: validatedData.message,
        location: validatedData.location,
        scheduledDate: new Date(validatedData.scheduledDate + "T00:00:00.000Z"),
        scheduledTime: validatedData.scheduledTime,
        equipment: equipmentArray,
        OTP: generatedOTP,
      };
    } else {
      // REJECT: Only update message if provided
      if (validatedData.message) {
        updateData.MessageFromModerator = validatedData.message;
      }
    }

    console.log("💾 Updating request with data:", updateData);

    // Update request with enhanced data
    const updatedRequest = await prisma.physicalEvaluationRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    console.log("✅ Request updated successfully:", updatedRequest);

    // Create notification with enhanced message
    const notificationType =
      validatedData.action === "ACCEPT"
        ? "STAT_UPDATE_APPROVED"
        : "STAT_UPDATE_DENIED";
    const actionText =
      validatedData.action === "ACCEPT" ? "accepted" : "rejected";

    let notificationMessage = `${user.firstName} ${user.lastName} ${actionText} your evaluation request`;

    if (validatedData.action === "ACCEPT") {
      notificationMessage += `. Meeting scheduled for ${validatedData.scheduledDate} at ${validatedData.scheduledTime}. Location: ${validatedData.location}. Verification OTP: ${generatedOTP}`;
    }

    if (validatedData.message) {
      notificationMessage += `. Message: "${validatedData.message}"`;
    }

    await prisma.notification.create({
      data: {
        userId: evaluationRequest.user.id,
        actorId: user.id,
        type: notificationType,
        title: `Evaluation Request ${
          actionText.charAt(0).toUpperCase() + actionText.slice(1)
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
            equipment: parseEquipment(validatedData.equipment || ""),
          }),
        },
      },
    });

    console.log("📩 Notification created successfully");

    // Prepare response
    const response: any = {
      success: true,
      request: updatedRequest,
      message: `Request ${actionText} successfully`,
    };

    // Include OTP in response for accepted requests
    if (validatedData.action === "ACCEPT" && generatedOTP) {
      response.otp = generatedOTP;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error updating request:", error);

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.issues);
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
