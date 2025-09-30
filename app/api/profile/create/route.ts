// api/profile/create/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { profileCreateSchema } from "@/lib/api/schemas/profile-schemas";
import { createProfileService } from "@/lib/api/services/profile-service";
import { validateApiRequest } from "@/lib/api/middleware/validation";
import { handleApiError, createApiResponse } from "@/lib/api/utils/response-utils";
import { authenticateUser } from "@/lib/api/middleware/auth";

/**
 * =============================================================================
 * PROFILE CREATION API ENDPOINT
 * =============================================================================
 */

export async function POST(req: NextRequest) {
  console.log("--- 📝 PROFILE CREATE REQUEST ---");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Request validation
    const body = await req.json();
    const validatedData = await validateApiRequest(body, profileCreateSchema);

    console.log("✅ Authentication and validation successful");

    // Step 3: Profile creation service
    const result = await createProfileService(user.id, validatedData);

    console.log("✅ Profile created successfully:", result.profileId);

    // Step 4: Success response
    return createApiResponse(
      {
        userId: result.userId,
        profileId: result.profileId,
        locationId: result.locationId,
        message: "Profile created successfully",
      },
      201
    );

  } catch (error) {
    console.error("❌ Profile creation failed:", error);
    return handleApiError(error, "profile creation");
  }
}

/**
 * Enhanced: GET endpoint to check if profile exists
 */
export async function GET() {
  try {
    const user = await authenticateUser();
    const result = await createProfileService.checkProfileExists(user.id);

    return createApiResponse({
      hasProfile: result.hasProfile,
      user: result.user,
    });

  } catch (error) {
    console.error("❌ Profile check failed:", error);
    return handleApiError(error, "profile check");
  }
}
