import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: {
    username: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params as Next.js expects
    const { username } = await params;
    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch target user with selected relations and counts
    const targetUser = await prisma.user.findUnique({
      where: {
        username,
        deletedAt: null,
      },
      include: {
        profile: { include: { location: true } },
        counters: true,
        _count: { select: { followers: true, following: true } },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch current user by clerkId
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    const isOwnProfile = currentUserData.id === targetUser.id;

    let friendshipStatus = "none";
    let isFollowing = false;
    let isFollowedBy = false;

    if (!isOwnProfile) {
      const [followingRelation, followerRelation] = await Promise.all([
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserData.id,
              followingId: targetUser.id,
            },
          },
        }),
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: targetUser.id,
              followingId: currentUserData.id,
            },
          },
        }),
      ]);

      isFollowing = !!followingRelation;
      isFollowedBy = !!followerRelation;

      if (isFollowing && isFollowedBy) {
        friendshipStatus = "mutual";
      } else if (isFollowing) {
        friendshipStatus = "following";
      } else if (isFollowedBy) {
        friendshipStatus = "follower";
      }
    }

    const profileData = {
      id: targetUser.id,
      username: targetUser.username,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      profileImageUrl: targetUser.profileImageUrl,
      bio: targetUser.profile?.bio ?? null,
      avatarUrl: targetUser.profile?.avatarUrl ?? null,

      primarySport: targetUser.PrimarySport,
      rank: targetUser.Rank,
      class: targetUser.Class,
      role: targetUser.role,

      city: targetUser.city,
      state: targetUser.state,
      country: targetUser.country,
      location: targetUser.profile?.location
        ? {
            lat: targetUser.profile.location.lat,
            lon: targetUser.profile.location.lon,
            city: targetUser.profile.location.city,
            state: targetUser.profile.location.state,
            country: targetUser.profile.location.country,
          }
        : null,

      dateOfBirth: isOwnProfile ? targetUser.dateOfBirth : null,
      gender: targetUser.gender,
      email: isOwnProfile ? targetUser.email : null,

      followersCount:
        targetUser.counters?.followersCount ?? targetUser._count.followers,
      followingCount:
        targetUser.counters?.followingCount ?? targetUser._count.following,
      postsCount: targetUser.counters?.postsCount ?? 0,

      createdAt: targetUser.createdAt,
      updatedAt: targetUser.updatedAt,

      isOwnProfile,
      friendshipStatus,
      isFollowing,
      isFollowedBy,

      showDetailedStats: isOwnProfile || friendshipStatus === "mutual",
    };

    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    // Log full error for debugging
    console.error("Profile fetch error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch profile";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
