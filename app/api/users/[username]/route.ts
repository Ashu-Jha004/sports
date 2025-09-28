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
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // FIX: Await params in Next.js 15
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    console.log(`👤 Fetching profile for username: ${username}`);
    // Find user by username with all related data
    const targetUser = await prisma.user.findUnique({
      where: {
        username: username,
        deletedAt: null,
      },
      include: {
        profile: {
          include: {
            location: true,
          },
        },
        counters: true, // Include user counters
        _count: {
          select: {
            followers: true,
            following: true,
            // posts: true, // Uncomment when Post model is ready
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get current user's data to check relationship
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    // Check if this is the user's own profile
    const isOwnProfile = currentUserData.id === targetUser.id;

    // Check friendship status if not own profile
    let friendshipStatus = "none";
    let isFollowing = false;
    let isFollowedBy = false;

    if (!isOwnProfile) {
      const [followingRelation, followerRelation] = await Promise.all([
        // Am I following them?
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserData.id,
              followingId: targetUser.id,
            },
          },
        }),
        // Are they following me?
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

    // Prepare response data
    const profileData = {
      id: targetUser.id,
      username: targetUser.username,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      profileImageUrl: targetUser.profileImageUrl,
      bio: targetUser.profile?.bio,
      avatarUrl: targetUser.profile?.avatarUrl,

      // Athletic info
      primarySport: targetUser.PrimarySport,
      rank: targetUser.Rank,
      class: targetUser.Class,
      role: targetUser.role,

      // Location info
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

      // Personal info (conditional based on privacy/friendship)
      dateOfBirth: isOwnProfile ? targetUser.dateOfBirth : null,
      gender: targetUser.gender,
      email: isOwnProfile ? targetUser.email : null,

      // Social counts - prioritize UserCounters, fallback to _count
      followersCount:
        targetUser.counters?.followersCount ?? targetUser._count.followers,
      followingCount:
        targetUser.counters?.followingCount ?? targetUser._count.following,
      postsCount: targetUser.counters?.postsCount ?? 0, // Will be real count when Post model is ready

      // Metadata
      createdAt: targetUser.createdAt,
      updatedAt: targetUser.updatedAt,

      // Relationship info
      isOwnProfile,
      friendshipStatus,
      isFollowing,
      isFollowedBy,

      // Additional social info for own profile or friends
      showDetailedStats: isOwnProfile || friendshipStatus === "mutual",
    };

    console.log(`✅ Profile data fetched for ${username}`, {
      followersCount: profileData.followersCount,
      followingCount: profileData.followingCount,
      friendshipStatus: profileData.friendshipStatus,
    });

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
