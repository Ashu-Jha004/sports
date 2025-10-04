// app/api/user/guide-requests/route.ts (NEW ENDPOINT)
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all user's requests with guide info
    const requests = await prisma.physicalEvaluationRequest.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["PENDING", "ACCEPTED", "REJECTED"],
        },
      },
      select: {
        id: true,
        guideId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create a map of guideId -> request status for easy lookup
    const requestStatusMap = requests.reduce((map, request) => {
      map[request.guideId] = {
        id: request.id,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      };
      return map;
    }, {} as Record<string, any>);

    return NextResponse.json({
      requestStatusMap,
      totalRequests: requests.length,
    });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch requests",
      },
      { status: 500 }
    );
  }
}
