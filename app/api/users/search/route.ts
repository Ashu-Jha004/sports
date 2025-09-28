import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching users with query: "${query}"`);

    // Search users by username, firstName, or lastName
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { deletedAt: null }, // Only active users
          {
            OR: [
              {
                username: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                firstName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        PrimarySport: true,
        Rank: true,
        Class: true,
        city: true,
        country: true,
        role: true,
        profile: {
          select: {
            bio: true,
          },
        },
      },
      take: limit,
      orderBy: [{ username: "asc" }, { firstName: "asc" }],
    });

    console.log(`✅ Found ${users.length} users`);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
