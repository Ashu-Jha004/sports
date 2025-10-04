// app/api/user/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// app/api/user/stats/route.ts (ALSO NEEDS SAME FIX)
export async function GET() {
  try {
    const { userId } = await auth(); // This is Clerk ID
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIXED: Get user by clerkId first, then get their stats
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }, // CHANGED FROM id TO clerkId
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userStats = await prisma.stats.findUnique({
      where: { userId: user.id }, // Use database user ID
      include: {
        injuries: true,
        strength: true,
        speed: true,
        stamina: true,
      },
    });

    if (!userStats) {
      return NextResponse.json({ stats: null });
    }

    return NextResponse.json({ stats: userStats });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}
