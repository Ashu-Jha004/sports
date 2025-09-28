import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH - Mark specific notification as read
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get current user from database
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update specific notification
    const notification = await prisma.notification.updateMany({
      where: {
        id: id,
        userId: currentUserData.id,
      },
      data: {
        isRead: true,
      },
    });

    if (notification.count === 0) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Notification marked as read",
      },
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific notification
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get current user from database
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Delete specific notification
    const deletedNotification = await prisma.notification.deleteMany({
      where: {
        id: id,
        userId: currentUserData.id,
      },
    });

    if (deletedNotification.count === 0) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Notification deleted",
      },
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
