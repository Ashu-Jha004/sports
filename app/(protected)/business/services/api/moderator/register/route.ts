// =============================================================================
// MODERATOR REGISTRATION API - CLEAN HANDLERS
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateTraceId, AuthenticationError } from "../../utils/errors";
import {
  createSuccessResponse,
  createErrorResponse,
  createCreatedResponse,
  createOptionsResponse,
  validateContentType,
} from "../../utils/responses";
import {
  validateRequestBody,
  sanitizeData,
  validateBusinessRules,
} from "../../utils/validation";
import {
  registerModerator,
  getModeratorProfile,
  checkRateLimit,
} from "../../utils/moderator.service";

// =============================================================================
// POST HANDLER - MODERATOR REGISTRATION
// =============================================================================

/**
 * Register new moderator with comprehensive validation and error handling
 *
 * @param request - NextJS request object
 * @returns Promise<NextResponse> - Standardized API response
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const traceId = generateTraceId();

  try {
    // 1. Authentication check
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new AuthenticationError(
        "Authentication required to register as moderator"
      );
    }

    // 2. Content type validation
    validateContentType(request);

    // 3. Request body validation and parsing
    const validatedData = await validateRequestBody(request);

    // 4. Data sanitization and normalization
    const sanitizedData = sanitizeData(validatedData);

    // 5. Business rules validation
    await validateBusinessRules(sanitizedData);

    // 6. Rate limiting check
    await checkRateLimit(authResult.userId, traceId);

    // 7. Execute moderator registration
    const result = await registerModerator(
      authResult.userId,
      sanitizedData,
      traceId
    );

    // 8. Return success response
    return createCreatedResponse(
      result,
      "Moderator registration submitted successfully. You will be contacted within 48 hours.",
      traceId
    );
  } catch (error) {
    // Centralized error handling
    return createErrorResponse(error as Error, traceId);
  }
}

// =============================================================================
// GET HANDLER - MODERATOR PROFILE RETRIEVAL
// =============================================================================

/**
 * Retrieve moderator profile for authenticated user
 *
 * @param request - NextJS request object
 * @returns Promise<NextResponse> - User's moderator profile or status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const traceId = generateTraceId();

  try {
    // 1. Authentication check
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new AuthenticationError(
        "Authentication required to access moderator profile"
      );
    }

    // 2. Retrieve moderator profile
    const profileData = await getModeratorProfile(authResult.userId, traceId);

    // 3. Return profile data
    const message = profileData.hasModeratorProfile
      ? "Moderator profile retrieved successfully"
      : "No moderator profile found";

    return createSuccessResponse(profileData, message, traceId);
  } catch (error) {
    // Centralized error handling
    return createErrorResponse(error as Error, traceId);
  }
}

// =============================================================================
// OPTIONS HANDLER - CORS SUPPORT
// =============================================================================

/**
 * Handle preflight CORS requests
 *
 * @param request - NextJS request object
 * @returns NextResponse - CORS headers response
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return createOptionsResponse();
}

// =============================================================================
// HEALTH CHECK ENDPOINT (OPTIONAL)
// =============================================================================

/**
 * Simple health check for monitoring
 * Uncomment if needed for your deployment
 */
/*
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  const traceId = generateTraceId();
  
  try {
    const stats = await getServiceStats(traceId);
    
    return new NextResponse(null, {
      status: stats.databaseHealthy ? 200 : 503,
      headers: {
        'X-Trace-ID': traceId,
        'X-Service-Status': stats.databaseHealthy ? 'healthy' : 'unhealthy',
        'X-Total-Moderators': stats.totalModerators.toString(),
      }
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Trace-ID': traceId,
        'X-Service-Status': 'error',
      }
    });
  }
}
*/
