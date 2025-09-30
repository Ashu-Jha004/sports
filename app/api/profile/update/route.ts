// api/profile/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { profileUpdateSchema } from "@/lib/api/schemas/profile-schemas";
import {
  updateProfileService,
  deleteProfileService,
} from "@/lib/api/services/profile-service";
import { validateApiRequest } from "@/lib/api/middleware/validation";
import {
  handleApiError,
  createApiResponse,
} from "@/lib/api/utils/response-utils";
import { authenticateUser } from "@/lib/api/middleware/auth";

/**
 * =============================================================================
 * PROFILE UPDATE API ENDPOINT
 * =============================================================================
 */

export async function PUT(req: NextRequest) {
  console.log("🔄 Profile update request received");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Request validation
    const body = await req.json();
    const validatedData = await validateApiRequest(body, profileUpdateSchema);

    console.log("✅ Authentication and validation successful");

    // Step 3: Profile update service
    const result = await updateProfileService(user.id, validatedData);

    console.log("✅ Profile updated successfully:", result.profileId);

    // Step 4: Success response
    return createApiResponse({
      userId: result.userId,
      profileId: result.profileId,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("❌ Profile update failed:", error);
    return handleApiError(error, "profile update");
  }
}

/**
 * Profile deletion endpoint
 */
export async function DELETE(req: NextRequest) {
  console.log("🗑️ Profile deletion request received");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Profile deletion service
    const result = await deleteProfileService(user.id);

    console.log("✅ Profile deleted successfully:", result.userId);

    // Step 3: Success response
    return createApiResponse({
      userId: result.userId,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("❌ Profile deletion failed:", error);
    return handleApiError(error, "profile deletion");
  }
}
