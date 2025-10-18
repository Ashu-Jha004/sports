import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.log("❌ Cleanup API: Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { otp, athleteId } = body;

    console.log("🧹 Cleanup API: Received request:", {
      otp: otp ? `${otp}`.slice(0, 3) + "***" : null,
      athleteId,
    });

    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    // Get current user (guide)
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, firstName: true },
    });

    if (!currentUser) {
      console.log("❌ Cleanup API: Guide not found");
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    console.log("✅ Cleanup API: Guide found:", currentUser.firstName);

    // Verify user is an approved guide
    const guide = await prisma.guide.findFirst({
      where: { userId: currentUser.id, status: "approved" },
    });

    if (!guide) {
      console.log("❌ Cleanup API: Guide not approved");
      return NextResponse.json(
        { error: "Guide access required" },
        { status: 403 }
      );
    }

    console.log("✅ Cleanup API: Guide approved, proceeding with cleanup");

    try {
      // ✅ FIX: First, try to find the record to see what exists (using correct field name)
      const existingRequest = await prisma.physicalEvaluationRequest.findFirst({
        where: {
          OTP: otp, // ✅ FIX: Use uppercase OTP
          ...(athleteId && { userId: athleteId }),
        },
      });

      console.log("🔍 Cleanup API: Existing request found:", !!existingRequest);

      if (existingRequest) {
        console.log("🔍 Cleanup API: Request details:", {
          id: existingRequest.id,
          userId: existingRequest.userId,
          OTP: `${existingRequest.OTP}`.slice(0, 3) + "***", // ✅ FIX: Use uppercase OTP
        });
      }

      // ✅ FIX: Delete the request(s) using correct field name
      const deletedRequest = await prisma.physicalEvaluationRequest.deleteMany({
        where: {
          OTP: otp, // ✅ FIX: Use uppercase OTP
          // Make athleteId optional in case it's not provided
          ...(athleteId && { userId: athleteId }),
        },
      });

      console.log(
        `✅ Cleanup API: Deleted ${deletedRequest.count} OTP record(s) for OTP: ${otp}`
      );

      return NextResponse.json({
        success: true,
        message: "OTP record cleaned up successfully",
        deletedCount: deletedRequest.count,
        foundExisting: !!existingRequest,
      });
    } catch (dbError) {
      console.error("❌ Cleanup API: Database error:", dbError);

      // Return success even if deletion fails (security by obscurity)
      return NextResponse.json({
        success: true,
        message: "Cleanup completed",
        deletedCount: 0,
        error: "Database operation failed but cleanup marked as complete",
      });
    }
  } catch (error) {
    console.error("❌ Cleanup API: General error:", error);
    return NextResponse.json(
      {
        error: "Failed to cleanup OTP record",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
