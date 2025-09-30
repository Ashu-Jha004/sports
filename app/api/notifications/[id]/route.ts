// api/notifications/[id]/route.ts (OPTIMIZED)
import { NextRequest } from "next/server";
import { notificationService } from "@/lib/api/services/notification-service";
import {
  handleApiError,
  createApiResponse,
} from "@/lib/api/utils/response-utils";
import { authenticateUser } from "@/lib/api/middleware/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH - Mark specific notification as read (OPTIMIZED)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  console.log("🔔 Mark specific notification as read request");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Get notification ID
    const { id } = await params;
    console.log("📧 Notification ID:", id);

    // Step 3: Mark as read via service
    const result = await notificationService.markAsRead(user.id, id);

    console.log("✅ Notification marked as read");

    // Step 4: Success response
    return createApiResponse({
      message: "Notification marked as read",
      notification: result.notification,
    });
  } catch (error) {
    console.error("❌ Failed to mark notification as read:", error);
    return handleApiError(error, "mark notification as read");
  }
}

// DELETE - Delete specific notification (OPTIMIZED)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  console.log("🗑️ Delete notification request");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Get notification ID
    const { id } = await params;
    console.log("📧 Notification ID to delete:", id);

    // Step 3: Delete via service
    await notificationService.deleteNotification(user.id, id);

    console.log("✅ Notification deleted");

    // Step 4: Success response
    return createApiResponse({
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("❌ Failed to delete notification:", error);
    return handleApiError(error, "delete notification");
  }
}
