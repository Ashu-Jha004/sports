import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("🔍 Debug: Current authenticated userId:", userId);

    // Get the actual database record
    const guide = await prisma.guide.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        reviewNote: true,
        reviewedBy: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
        guideEmail: true,
        PrimarySports: true,
        Sports: true,
        user: {
          select: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Also check for Guide record by user's internal ID
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true },
    });

    let guideByInternalId = null;
    if (userRecord) {
      guideByInternalId = await prisma.guide.findUnique({
        where: { userId: userRecord.id },
        select: {
          id: true,
          status: true,
          reviewNote: true,
          reviewedBy: true,
          reviewedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        clerkUserId: userId,
        userRecord,
        guideByClerkId: guide,
        guideByInternalId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
