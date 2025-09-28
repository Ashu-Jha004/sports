import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("📋 Fetching current user profile...");

    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
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

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Initialize counters if they don't exist
    if (!userData.counters) {
      console.log("🔢 Creating initial user counters...");
      await prisma.userCounters.create({
        data: {
          userId: userData.id,
          followersCount: userData._count.followers,
          followingCount: userData._count.following,
          postsCount: 0,
        },
      });
    }

    // Format data same as public profile endpoint
    const profileData = {
      id: userData.id,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      bio: userData.profile?.bio,
      avatarUrl: userData.profile?.avatarUrl,

      // Athletic info
      primarySport: userData.PrimarySport,
      rank: userData.Rank,
      class: userData.Class,
      role: userData.role,

      // Location info
      city: userData.city,
      state: userData.state,
      country: userData.country,
      location: userData.profile?.location
        ? {
            lat: userData.profile.location.lat,
            lon: userData.profile.location.lon,
            city: userData.profile.location.city,
            state: userData.profile.location.state,
            country: userData.profile.location.country,
          }
        : null,

      // Personal info (full access for own profile)
      dateOfBirth: userData.dateOfBirth?.toISOString(),
      gender: userData.gender,
      email: userData.email,

      // Social counts
      followersCount:
        userData.counters?.followersCount ?? userData._count.followers,
      followingCount:
        userData.counters?.followingCount ?? userData._count.following,
      postsCount: userData.counters?.postsCount ?? 0,

      // Metadata
      createdAt: userData.createdAt.toISOString(),
      updatedAt: userData.updatedAt.toISOString(),

      // Own profile flags
      isOwnProfile: true,
      friendshipStatus: "self",
      isFollowing: false,
      isFollowedBy: false,
      showDetailedStats: true,
    };

    console.log(`✅ Current profile fetched`, {
      followersCount: profileData.followersCount,
      followingCount: profileData.followingCount,
    });

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Current profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
