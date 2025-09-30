// lib/api/services/notification-service.ts
import prisma from "@/lib/prisma";
import { NotFoundError, UserNotFoundError } from "@/lib/api/errors/api-errors";

/**
 * =============================================================================
 * NOTIFICATION SERVICE LAYER
 * =============================================================================
 */

interface NotificationQueryParams {
  limit: number;
  offset: number;
  unreadOnly?: boolean;
}

interface NotificationResult {
  notifications: any[];
  unreadCount: number;
  total: number;
  hasMore: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

export const notificationService = {
  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    clerkId: string,
    params: NotificationQueryParams
  ): Promise<NotificationResult> {
    const { limit, offset, unreadOnly } = params;

    // Get user from database
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!currentUserData) {
      throw new UserNotFoundError();
    }

    // Build where clause
    const whereClause: any = {
      userId: currentUserData.id,
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    console.log("🔍 Fetching notifications with:", {
      whereClause,
      limit,
      offset,
    });

    // Fetch notifications with pagination
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: currentUserData.id },
      }),
      prisma.notification.count({
        where: {
          userId: currentUserData.id,
          isRead: false,
        },
      }),
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      notifications: notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      })),
      unreadCount,
      total: totalCount,
      hasMore: notifications.length === limit && offset + limit < totalCount,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        limit,
      },
    };
  },

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(clerkId: string) {
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!currentUserData) {
      throw new UserNotFoundError();
    }

    const updatedNotifications = await prisma.notification.updateMany({
      where: {
        userId: currentUserData.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      updatedCount: updatedNotifications.count,
    };
  },

  /**
   * Mark specific notification as read
   */
  async markAsRead(clerkId: string, notificationId: string) {
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!currentUserData) {
      throw new UserNotFoundError();
    }

    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: currentUserData.id,
      },
      data: {
        isRead: true,
      },
    });

    if (notification.count === 0) {
      throw new NotFoundError("Notification not found");
    }

    // Get updated notification
    const updatedNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: currentUserData.id,
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    return {
      notification: updatedNotification,
    };
  },

  /**
   * Delete specific notification
   */
  async deleteNotification(clerkId: string, notificationId: string) {
    const currentUserData = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!currentUserData) {
      throw new UserNotFoundError();
    }

    const deletedNotification = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: currentUserData.id,
      },
    });

    if (deletedNotification.count === 0) {
      throw new NotFoundError("Notification not found");
    }

    return {
      deletedCount: deletedNotification.count,
    };
  },
};
