import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    username: string;
  }>;
}

// OPTIMIZED: Helper function to update user counters (faster version)
async function updateFollowCounters(
  followerId: string,
  followingId: string,
  increment: boolean
) {
  const change = increment ? 1 : -1;

  console.log(
    `🔢 Updating counters: ${
      increment ? "increment" : "decrement"
    } by ${change}`
  );

  try {
    // Do both updates in parallel for speed
    await Promise.all([
      // Update follower's following count
      prisma.userCounters.upsert({
        where: { userId: followerId },
        update: {
          followingCount: {
            increment: change,
          },
        },
        create: {
          userId: followerId,
          followingCount: Math.max(0, change),
          followersCount: 0,
          postsCount: 0,
        },
      }),

      // Update following's followers count
      prisma.userCounters.upsert({
        where: { userId: followingId },
        update: {
          followersCount: {
            increment: change,
          },
        },
        create: {
          userId: followingId,
          followersCount: Math.max(0, change),
          followingCount: 0,
          postsCount: 0,
        },
      }),
    ]);

    console.log(`✅ Counters updated successfully`);
  } catch (error) {
    console.error(`❌ Error updating counters:`, error);
    throw error;
  }
}

// ADD FRIEND (FOLLOW)
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    console.log(`👥 Adding friend: ${username}`);

    // Get current user from database
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUserData) {
      console.error("❌ Current user not found in database");
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    console.log(
      `✅ Current user found: ${currentUserData.username} (${currentUserData.id})`
    );

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: {
        username: username,
        deletedAt: null,
      },
    });

    if (!targetUser) {
      console.error("❌ Target user not found:", username);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log(
      `✅ Target user found: ${targetUser.username} (${targetUser.id})`
    );

    // Can't follow yourself
    if (currentUserData.id === targetUser.id) {
      console.error("❌ Attempted to follow self");
      return NextResponse.json(
        { success: false, error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    console.log(`🔍 Checking existing follow relationship...`);
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserData.id,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      console.log("⚠️ Already following this user");
      return NextResponse.json(
        { success: false, error: "Already following this user" },
        { status: 409 }
      );
    }

    console.log("🔄 Creating follow relationship...");

    // FIX: Create follow relationship with increased transaction timeout
    const result = await prisma.$transaction(
      async (prisma) => {
        // 1. Create follow relationship
        console.log("📝 Creating follow record...");
        const newFollow = await prisma.follow.create({
          data: {
            followerId: currentUserData.id,
            followingId: targetUser.id,
          },
        });
        console.log(`✅ Follow record created: ${newFollow.id}`);

        return newFollow;
      },
      {
        timeout: 10000, // Increase timeout to 10 seconds
      }
    );

    // 2. Update counters outside transaction for speed
    console.log("🔢 Updating user counters...");
    await updateFollowCounters(currentUserData.id, targetUser.id, true);

    console.log(`✅ Follow operation completed successfully`);

    // 3. Create notification (outside transaction)
    try {
      console.log("🔔 Creating follow notification...");
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          actorId: currentUserData.id,
          type: "FOLLOW",
          title: "New Follower",
          message: `${
            currentUserData.firstName || currentUserData.username || "Someone"
          } started following you`,
          isRead: false,
          data: {
            followId: result.id,
            followerUsername: currentUserData.username,
          },
        },
      });
      console.log("✅ Notification created successfully");
    } catch (notificationError) {
      console.warn(
        "⚠️ Failed to create follow notification:",
        notificationError
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Successfully followed user",
        follow: {
          id: result.id,
          followerId: result.followerId,
          followingId: result.followingId,
          createdAt: result.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("❌ Follow user error:", error);

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        cause: error.cause,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to follow user",
      },
      { status: 500 }
    );
  }
}

// REMOVE FRIEND (UNFOLLOW)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    console.log(`💔 Unfollowing user: ${username}`);

    // Get current user from database
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

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

    // Find existing follow relationship
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserData.id,
          followingId: targetUser.id,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { success: false, error: "Not following this user" },
        { status: 404 }
      );
    }

    // Delete follow relationship with increased timeout
    await prisma.$transaction(
      async (prisma) => {
        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: currentUserData.id,
              followingId: targetUser.id,
            },
          },
        });
      },
      {
        timeout: 10000,
      }
    );

    // Update counters outside transaction
    await updateFollowCounters(currentUserData.id, targetUser.id, false);

    console.log(
      `✅ Unfollow completed: ${currentUserData.username} -> ${targetUser.username}`
    );

    return NextResponse.json({
      success: true,
      data: {
        message: "Successfully unfollowed user",
      },
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}

// GET FRIENDSHIP STATUS
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

    // Get current user from database
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

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

    // Check both directions of the relationship
    const [isFollowing, isFollowedBy] = await Promise.all([
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

    let status = "none";
    if (isFollowing && isFollowedBy) {
      status = "mutual";
    } else if (isFollowing) {
      status = "following";
    } else if (isFollowedBy) {
      status = "follower";
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        isFollowing: !!isFollowing,
        isFollowedBy: !!isFollowedBy,
        follow: isFollowing || null,
      },
    });
  } catch (error) {
    console.error("Get follow status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get follow status" },
      { status: 500 }
    );
  }
}
