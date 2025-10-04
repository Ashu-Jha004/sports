// app/api/guides/nearby/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Haversine formula for precise distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { userId }: any = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lon = parseFloat(searchParams.get("lon") || "0");
    const radius = parseFloat(searchParams.get("radius") || "10");
    const sport = searchParams.get("sport");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Location coordinates required" },
        { status: 400 }
      );
    }
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Get all approved guides with location data
    const guides = await prisma.guide.findMany({
      where: {
        status: "approved",
        // ADDED: Exclude the current user from results
        userId: {
          not: currentUser.id,
        },
        AND: [
          {
            city: { not: null },
          },
          {
            state: { not: null },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            Rank: true,
            Class: true,
          },
        },
      },
    });
    // Calculate distances and filter by radius
    const guidesWithDistance = guides
      .map((guide) => ({
        ...guide,
        distance: calculateDistance(lat, lon, guide.lat!, guide.lon!),
      }))
      .filter((guide) => guide.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({
      guides: guidesWithDistance,
      total: guidesWithDistance.length,
      searchRadius: radius,
    });
  } catch (error) {
    console.error("Error fetching nearby guides:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch guides",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
