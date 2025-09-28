import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    username: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // FIX: Await params in Next.js 15
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    console.log(`👤 Fetching following for username: ${username}`);

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: {
        username: username,
        deletedAt: null,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get current user to check relationships
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    // Build where clause for search
    const whereClause: any = {
      followerId: targetUser.id,
    };

    if (search) {
      whereClause.following = {
        OR: [
          {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    // Get following with pagination
    const [following, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: whereClause,
        include: {
          following: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              PrimarySport: true,
              Rank: true,
              Class: true,
              role: true,
              city: true,
              country: true,
              createdAt: true,
              profile: {
                select: {
                  bio: true,
                },
              },
              counters: {
                select: {
                  followersCount: true,
                  followingCount: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.follow.count({
        where: whereClause,
      }),
    ]);

    // Check current user's relationship with each person being followed
    const followingIds = following.map((f) => f.following.id);
    const currentUserFollowing = await prisma.follow.findMany({
      where: {
        followerId: currentUserData.id,
        followingId: {
          in: followingIds,
        },
      },
      select: {
        followingId: true,
      },
    });

    const followingSet = new Set(
      currentUserFollowing.map((f) => f.followingId)
    );

    // Format following data
    const followingData = following.map((follow) => ({
      id: follow.following.id,
      username: follow.following.username,
      firstName: follow.following.firstName,
      lastName: follow.following.lastName,
      displayName:
        follow.following.firstName && follow.following.lastName
          ? `${follow.following.firstName} ${follow.following.lastName}`
          : follow.following.username || "Unknown User",
      profileImageUrl: follow.following.profileImageUrl,
      bio: follow.following.profile?.bio,
      primarySport: follow.following.PrimarySport,
      rank: follow.following.Rank,
      class: follow.following.Class,
      role: follow.following.role,
      city: follow.following.city,
      country: follow.following.country,
      location:
        [follow.following.city, follow.following.country]
          .filter(Boolean)
          .join(", ") || null,
      followedAt: follow.createdAt,

      // Counters
      followersCount: follow.following.counters?.followersCount || 0,
      followingCount: follow.following.counters?.followingCount || 0,

      // Relationship with current user
      isCurrentUser: follow.following.id === currentUserData.id,
      isFollowedByCurrentUser: followingSet.has(follow.following.id),

      // Privacy
      showPrivateInfo:
        follow.following.id === currentUserData.id ||
        followingSet.has(follow.following.id),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    console.log(
      `✅ Found ${following.length} following for ${username} (page ${page})`
    );

    return NextResponse.json({
      success: true,
      data: {
        following: followingData,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          limit,
        },
        meta: {
          targetUser: {
            id: targetUser.id,
            username: targetUser.username,
            displayName:
              targetUser.firstName && targetUser.lastName
                ? `${targetUser.firstName} ${targetUser.lastName}`
                : targetUser.username || "Unknown User",
          },
          search: search || null,
        },
      },
    });
  } catch (error) {
    console.error("Get following error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch following" },
      { status: 500 }
    );
  }
}
