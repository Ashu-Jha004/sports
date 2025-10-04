// app/api/guides/incoming-requests/route.ts (NEW)
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user by clerkId first
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is an approved guide
    const guide = await prisma.guide.findFirst({
      where: {
        userId: user.id,
        status: "approved", // Only approved guides can see requests
      },
      select: { id: true },
    });

    if (!guide) {
      return NextResponse.json(
        { error: "Guide access required" },
        { status: 403 }
      );
    }

    // Get incoming requests for this guide
    const requests = await prisma.physicalEvaluationRequest.findMany({
      where: {
        guideId: guide.id,
        status: {
          in: ["PENDING", "ACCEPTED", "REJECTED"],
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            PrimarySport: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { createdAt: "desc" },
      ],
    });

    // Get request counts for stats
    const stats = {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      accepted: requests.filter((r) => r.status === "ACCEPTED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    };

    return NextResponse.json({
      requests,
      stats,
      guideId: guide.id,
    });
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch requests",
      },
      { status: 500 }
    );
  }
}
