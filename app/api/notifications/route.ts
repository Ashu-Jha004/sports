// api/notifications/route.ts (OPTIMIZED)
import { NextRequest } from "next/server";
import { notificationService } from "@/lib/api/services/notification-service";
import { validateApiRequest } from "@/lib/api/middleware/validation";
import {
  handleApiError,
  createApiResponse,
} from "@/lib/api/utils/response-utils";
import { authenticateUser } from "@/lib/api/middleware/auth";
import { z } from "zod";

/**
 * =============================================================================
 * NOTIFICATIONS API ENDPOINT (OPTIMIZED)
 * =============================================================================
 */

// Query parameters validation schema
const notificationQuerySchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
  unreadOnly: z.boolean().default(false),
});

// GET - Fetch user's notifications (FIXED for compatibility)
export async function GET(request: NextRequest) {
  console.log("🔔 Notifications fetch request received");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Parse and validate query parameters
    const { searchParams } = new URL(request.url);

    // FIXED: Support both page/offset pagination for compatibility
    const rawLimit = parseInt(searchParams.get("limit") || "20");
    const rawOffset = parseInt(searchParams.get("offset") || "0");
    const rawPage = parseInt(searchParams.get("page") || "1");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Convert page-based to offset-based if needed
    const limit = Math.min(Math.max(rawLimit, 1), 50);
    const offset = rawOffset > 0 ? rawOffset : (rawPage - 1) * limit;

    const queryParams = {
      limit,
      offset,
      unreadOnly,
    };

    console.log("📊 Query params:", queryParams);

    // Step 3: Fetch notifications via service
    const result = await notificationService.getUserNotifications(
      user.id,
      queryParams
    );

    console.log("✅ Notifications fetched:", {
      count: result.notifications.length,
      unreadCount: result.unreadCount,
    });

    // Step 4: FIXED - Return response format compatible with useNotifications hook
    return createApiResponse({
      notifications: result.notifications,
      unreadCount: result.unreadCount,
      total: result.total,
      hasMore: result.hasMore,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("❌ Failed to fetch notifications:", error);
    return handleApiError(error, "notification fetch");
  }
}

// PATCH - Mark all notifications as read (OPTIMIZED)
export async function PATCH(request: NextRequest) {
  console.log("🔔 Mark all notifications as read request");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Mark all as read via service
    const result = await notificationService.markAllAsRead(user.id);

    console.log("✅ All notifications marked as read:", result.updatedCount);

    // Step 3: Success response
    return createApiResponse({
      message: "All notifications marked as read",
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error("❌ Failed to mark all notifications as read:", error);
    return handleApiError(error, "mark all notifications as read");
  }
}
