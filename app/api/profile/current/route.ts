// api/profile/current/route.ts
import { NextResponse } from "next/server";
import { getCurrentProfileService } from "@/lib/api/services/profile-service";
import {
  handleApiError,
  createApiResponse,
} from "@/lib/api/utils/response-utils";
import { authenticateUser } from "@/lib/api/middleware/auth";

/**
 * =============================================================================
 * CURRENT USER PROFILE API ENDPOINT
 * =============================================================================
 */

export async function GET() {
  console.log("📋 Fetching current user profile...");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Get current profile service
    const profileData = await getCurrentProfileService(user.id);

    console.log("✅ Current profile fetched successfully");

    // Step 3: Success response
    return createApiResponse({
      ...profileData,
      isOwnProfile: true,
      friendshipStatus: "self",
      isFollowing: false,
      isFollowedBy: false,
      showDetailedStats: true,
    });
  } catch (error) {
    console.error("❌ Current profile fetch failed:", error);
    return handleApiError(error, "current profile fetch");
  }
}
