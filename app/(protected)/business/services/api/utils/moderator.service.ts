// =============================================================================
// MODERATOR SERVICE - BUSINESS LOGIC & DATABASE OPERATIONS
// =============================================================================

import prisma from "@/lib/prisma";
import {
  DatabaseError,
  ConflictError,
  NotFoundError,
  RateLimitError,
  isRetriableError,
  isNonRetriableError,
} from "./errors";
import { logSuccess, logWarning } from "./responses";
import type {
  ModeratorRegistrationData,
  ModeratorRegistrationResponse,
  ModeratorProfileDetails,
} from "./types";

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

const SERVICE_CONFIG = {
  RATE_LIMIT: {
    COOLDOWN_PERIOD_MS: 60 * 60 * 1000, // 1 hour
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY_MS: 1000,
  },
  TRANSACTION: {
    TIMEOUT_MS: 10000,
    MAX_WAIT_MS: 5000,
  },
} as const;

// =============================================================================
// RATE LIMITING FUNCTIONS
// =============================================================================

/**
 * Check if user has recently registered and enforce cooldown period
 */
export async function checkRateLimit(
  clerkId: string,
  traceId: string
): Promise<void> {
  try {
    const recentAttempt = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        Guide: {
          select: { createdAt: true },
        },
      },
    });

    if (recentAttempt?.Guide) {
      const timeSinceCreation =
        Date.now() - recentAttempt.Guide.createdAt.getTime();

      if (timeSinceCreation < SERVICE_CONFIG.RATE_LIMIT.COOLDOWN_PERIOD_MS) {
        const remainingTime = Math.ceil(
          (SERVICE_CONFIG.RATE_LIMIT.COOLDOWN_PERIOD_MS - timeSinceCreation) /
            (60 * 1000)
        );

        throw new RateLimitError(
          `Recent registration detected. Please wait ${remainingTime} minutes before trying again.`
        );
      }
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    logWarning("RATE_LIMIT_CHECK", traceId, "Rate limit check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      clerkId,
    });
  }
}

// =============================================================================
// RETRY LOGIC UTILITY
// =============================================================================

/**
 * Execute database operation with automatic retry for transient failures
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  traceId: string,
  maxRetries: number = SERVICE_CONFIG.RETRY.MAX_ATTEMPTS
): Promise<T> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry business logic errors
      if (isNonRetriableError(error)) {
        throw error;
      }

      // Only retry on transient database errors
      if (!isRetriableError(error) || attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay =
        Math.pow(2, attempt - 1) * SERVICE_CONFIG.RETRY.BASE_DELAY_MS;
      logWarning("RETRY_ATTEMPT", traceId, `Retrying operation`, {
        attempt,
        maxRetries,
        delayMs: delay,
        error: lastError.message,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new DatabaseError("Operation failed after multiple attempts", {
    attempts: maxRetries,
    lastError: lastError.message,
    traceId,
  });
}

// =============================================================================
// CORE MODERATOR REGISTRATION LOGIC
// =============================================================================

/**
 * Register a new moderator with comprehensive validation and error handling
 */
export async function registerModerator(
  clerkId: string,
  data: ModeratorRegistrationData,
  traceId: string
): Promise<ModeratorRegistrationResponse> {
  return executeWithRetry(async () => {
    return await prisma.$transaction(
      async (tx) => {
        // 1. Find and validate user
        const user = await findAndValidateUser(tx, clerkId);

        // 2. Check for existing guide profile
        await checkExistingGuideProfile(tx, user, traceId);

        // 3. Validate email uniqueness
        await validateEmailUniqueness(tx, data.guideEmail, traceId);

        // 4. Create guide profile
        const newGuide = await createGuideProfile(tx, user.id, data);

        // 5. Update user roles
        await updateUserRoles(tx, user, data);

        // 6. Log successful registration
        logSuccess("MODERATOR_REGISTRATION", traceId, {
          userId: user.id,
          guideId: newGuide.id,
          email: data.guideEmail,
          sportsCount: data.sports.length,
          hasCoordinates: !!(data.lat && data.lon),
          hasExperience: data.experience !== null,
        });

        return formatRegistrationResponse(newGuide, user.id);
      },
      {
        timeout: SERVICE_CONFIG.TRANSACTION.TIMEOUT_MS,
        maxWait: SERVICE_CONFIG.TRANSACTION.MAX_WAIT_MS,
      }
    );
  }, traceId);
}

/**
 * Find user by Clerk ID and validate existence
 */
async function findAndValidateUser(tx: any, clerkId: string) {
  const user = await tx.user.findUnique({
    where: { clerkId },
    include: { Guide: true },
  });

  if (!user) {
    throw new NotFoundError(
      "User profile not found. Please complete your account setup first."
    );
  }

  return user;
}

/**
 * Check if user already has a guide profile
 */
async function checkExistingGuideProfile(
  tx: any,
  user: any,
  traceId: string
): Promise<void> {
  if (user.Guide) {
    throw new ConflictError(
      "User already has a moderator profile. Only one profile allowed per user.",
      "user",
      {
        existingGuideId: user.Guide.id,
        existingEmail: user.Guide.guideEmail,
        traceId,
      }
    );
  }
}

/**
 * Validate that guide email is unique
 */
async function validateEmailUniqueness(
  tx: any,
  guideEmail: string,
  traceId: string
): Promise<void> {
  const existingEmail = await tx.guide.findUnique({
    where: { guideEmail },
    select: { id: true, userId: true, createdAt: true },
  });

  if (existingEmail) {
    throw new ConflictError(
      "This email is already registered as a moderator.",
      "guideEmail",
      {
        conflictingGuideId: existingEmail.id,
        registeredAt: existingEmail.createdAt.toISOString(),
        traceId,
      }
    );
  }
}

/**
 * Create new guide profile in database
 */
async function createGuideProfile(
  tx: any,
  userId: string,
  data: ModeratorRegistrationData
) {
  return await tx.guide.create({
    data: {
      userId,
      guideEmail: data.guideEmail,
      documents: data.documents,
      PrimarySports: data.primarySports,
      Sports: data.sports,
      Experience: data.experience,
      state: data.state,
      city: data.city,
      country: data.country,
      lat: data.lat,
      lon: data.lon,
    },
  });
}

/**
 * Update user roles to include MODERATOR
 */
async function updateUserRoles(
  tx: any,
  user: any,
  data: ModeratorRegistrationData
): Promise<void> {
  const currentRoles = user.roles || [];
  const updatedRoles = [...new Set([...currentRoles, "MODERATOR"])];

  await tx.user.update({
    where: { id: user.id },
    data: {
      roles: updatedRoles,
      PrimarySport: data.primarySports,
      version: (user.version || 1) + 1, // Optimistic locking
    },
  });
}

/**
 * Format registration response
 */
function formatRegistrationResponse(
  guide: any,
  userId: string
): ModeratorRegistrationResponse {
  return {
    id: guide.id,
    userId,
    guideEmail: guide.guideEmail || "",
    status: "pending_review" as const,
    submittedAt: guide.createdAt.toISOString(),
  };
}

// =============================================================================
// MODERATOR PROFILE RETRIEVAL
// =============================================================================

/**
 * Get moderator profile for authenticated user
 */
export async function getModeratorProfile(
  clerkId: string,
  traceId: string
): Promise<ModeratorProfileDetails> {
  return executeWithRetry(async () => {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        Guide: {
          select: {
            id: true,
            guideEmail: true,
            PrimarySports: true,
            Sports: true,
            status: true,
            Experience: true,
            state: true,
            city: true,
            country: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    if (!user.Guide) {
      return {
        hasModeratorProfile: false,
        message: "No moderator profile found",
      };
    }

    // Log successful profile retrieval
    logSuccess("PROFILE_RETRIEVAL", traceId, {
      userId: user.id,
      guideId: user.Guide.id,
    });

    return formatProfileResponse(user);
  }, traceId);
}

/**
 * Format profile response with all details
 */
function formatProfileResponse(user: any): ModeratorProfileDetails {
  const moderatorProfile: ModeratorRegistrationResponse = {
    id: user.Guide.id,
    userId: user.id,
    guideEmail: user.Guide.guideEmail || "",
    status: user.Guide.status || "pending_review",
    submittedAt: user.Guide.createdAt.toISOString(),
  };

  return {
    hasModeratorProfile: true,
    profile: moderatorProfile,
    details: {
      primarySports: user.Guide.PrimarySports,
      sports: user.Guide.Sports,
      experience: user.Guide.Experience,
      location: {
        city: user.Guide.city,
        state: user.Guide.state,
        country: user.Guide.country,
      },
    },
  };
}

// =============================================================================
// HEALTH CHECK UTILITIES
// =============================================================================

/**
 * Check database connectivity
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * Get service statistics
 */
export async function getServiceStats(traceId: string): Promise<{
  totalModerators: number;
  pendingRegistrations: number;
  databaseHealthy: boolean;
}> {
  try {
    const [totalModerators, databaseHealthy] = await Promise.all([
      prisma.guide.count(),
      checkDatabaseHealth(),
    ]);

    logSuccess("SERVICE_STATS", traceId, {
      totalModerators,
      databaseHealthy,
    });

    return {
      totalModerators,
      pendingRegistrations: totalModerators, // All are pending in this implementation
      databaseHealthy,
    };
  } catch (error) {
    throw new DatabaseError("Failed to retrieve service statistics", {
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
