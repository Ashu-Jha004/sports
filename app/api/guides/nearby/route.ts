// app/api/guides/nearby/route.tsimport { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
// Haversine formula to calculate distance in KM between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
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
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const radiusParam = searchParams.get("radius") || "10";
    const limitParam = searchParams.get("limit") || "100";

    if (!latParam || !lonParam) {
      return NextResponse.json(
        { error: "Location coordinates required" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);
    const radius = Math.max(0, parseFloat(radiusParam)) || 50;
    const limit = Math.min(1000, Math.max(1, parseInt(limitParam))) || 100;

    if (isNaN(lat) || isNaN(lon) || isNaN(radius) || isNaN(limit)) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
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

    // Query approved guides with location data and excluding current user
    const guides = await prisma.guide.findMany({
      where: {
        status: "approved",
        userId: { not: currentUser.id },
        city: { not: null },
        state: { not: null },
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

    // Filter guides by distance asynchronously using Promise.all
    const guidesWithDistance = (
      await Promise.all(
        guides.map(async (guide) => {
          // Guard: skip guides without lat/lon
          if (guide.lat == null || guide.lon == null) return null;

          const dist = calculateDistance(lat, lon, guide.lat, guide.lon);
          return { ...guide, distance: dist };
        })
      )
    )
      .filter((g): g is (typeof guides)[0] & { distance: number } => g != null)
      .filter((g) => g.distance <= radius)
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
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
