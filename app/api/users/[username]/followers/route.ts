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

    console.log(`👥 Fetching followers for username: ${username}`);

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
      followingId: targetUser.id,
    };

    if (search) {
      whereClause.follower = {
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

    // Get followers with pagination
    const [followers, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: whereClause,
        include: {
          follower: {
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

    // Check current user's relationship with each follower
    const followerIds = followers.map((f) => f.follower.id);
    const currentUserFollowing = await prisma.follow.findMany({
      where: {
        followerId: currentUserData.id,
        followingId: {
          in: followerIds,
        },
      },
      select: {
        followingId: true,
      },
    });

    const followingSet = new Set(
      currentUserFollowing.map((f) => f.followingId)
    );

    // Format followers data
    const followersData = followers.map((follow) => ({
      id: follow.follower.id,
      username: follow.follower.username,
      firstName: follow.follower.firstName,
      lastName: follow.follower.lastName,
      displayName:
        follow.follower.firstName && follow.follower.lastName
          ? `${follow.follower.firstName} ${follow.follower.lastName}`
          : follow.follower.username || "Unknown User",
      profileImageUrl: follow.follower.profileImageUrl,
      bio: follow.follower.profile?.bio,
      primarySport: follow.follower.PrimarySport,
      rank: follow.follower.Rank,
      class: follow.follower.Class,
      role: follow.follower.role,
      city: follow.follower.city,
      country: follow.follower.country,
      location:
        [follow.follower.city, follow.follower.country]
          .filter(Boolean)
          .join(", ") || null,
      followedAt: follow.createdAt,

      // Counters
      followersCount: follow.follower.counters?.followersCount || 0,
      followingCount: follow.follower.counters?.followingCount || 0,

      // Relationship with current user
      isCurrentUser: follow.follower.id === currentUserData.id,
      isFollowingCurrentUser: followingSet.has(follow.follower.id),

      // Privacy (show email only if it's current user or they follow each other)
      showPrivateInfo:
        follow.follower.id === currentUserData.id ||
        followingSet.has(follow.follower.id),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    console.log(
      `✅ Found ${followers.length} followers for ${username} (page ${page})`
    );

    return NextResponse.json({
      success: true,
      data: {
        followers: followersData,
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
    console.error("Get followers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}
