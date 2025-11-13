// ============================================
// FILE: app/api/stats/[userId]/middleware.ts
// Reusable middleware for auth, validation, and error handling
// ============================================

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  AuthorizationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  StatsApiError,
} from "./types";

// ============================================
// AUTH MIDDLEWARE
// ============================================

/**
 * Authenticates the request using Clerk
 * @throws AuthorizationError if not authenticated
 */
export async function authenticateRequest(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new AuthorizationError("Authentication required");
  }

  return userId;
}

/**
 * In-memory cache for user authorization checks
 * Reduces database queries for frequently accessed users
 */
const authCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clears expired entries from auth cache
 */
function cleanAuthCache(): void {
  const now = Date.now();
  for (const [key, value] of authCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      authCache.delete(key);
    }
  }
}

/**
 * Checks if user has moderator access with caching
 * @throws NotFoundError if user doesn't exist
 * @throws ForbiddenError if user lacks moderator role
 */
export async function checkModeratorAccess(clerkUserId: string): Promise<any> {
  // Check cache first
  const cached = authCache.get(clerkUserId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }

  // Clean cache periodically
  if (authCache.size > 100) {
    cleanAuthCache();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!user.roles.includes("MODERATOR")) {
      throw new ForbiddenError(
        "Access denied. Only moderators can manage athlete stats."
      );
    }

    // Cache the result
    authCache.set(clerkUserId, {
      user: user,
      timestamp: Date.now(),
    });

    return user;
  } catch (error) {
    if (error instanceof StatsApiError) {
      throw error;
    }
    throw new NotFoundError("User");
  }
}

/**
 * Verifies athlete exists in database
 * @throws NotFoundError if athlete doesn't exist
 */
export async function verifyAthleteExists(userId: string): Promise<{
  id: string;
  firstName: string | null;
  lastName: string | null;
}> {
  try {
    const athlete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!athlete) {
      throw new NotFoundError("Athlete");
    }

    return athlete;
  } catch (error) {
    if (error instanceof StatsApiError) {
      throw error;
    }
    throw new NotFoundError("Athlete");
  }
}

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

/**
 * Validates request body against a Zod schema
 * @throws ValidationError if validation fails
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      }));

      throw new ValidationError("Invalid request data", {
        errors: formattedErrors,
        details: validation.error.issues,
      });
    }

    return validation.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      throw new ValidationError("Invalid JSON in request body");
    }

    throw new ValidationError("Failed to parse request body");
  }
}

/**
 * Validates userId match between params and body
 * @throws ValidationError if IDs don't match
 */
export function validateUserIdMatch(
  paramsUserId: string,
  bodyUserId: string
): void {
  if (paramsUserId !== bodyUserId) {
    throw new ValidationError(
      "User ID mismatch - potential data corruption prevented",
      { paramsUserId, bodyUserId }
    );
  }
}

// ============================================
// ERROR RESPONSE FORMATTER
// ============================================

/**
 * Formats error into consistent NextResponse
 */
export function formatErrorResponse(error: unknown): NextResponse {
  console.error("❌ API Error:", error);

  // Handle known API errors
  if (error instanceof StatsApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        cause: error.cause,
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: any };

    switch (prismaError.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "A record with this data already exists",
            code: "DUPLICATE_RECORD",
          },
          { status: 409 }
        );

      case "P2025":
        return NextResponse.json(
          {
            error: "Record not found",
            code: "NOT_FOUND",
          },
          { status: 404 }
        );

      case "P2003":
        return NextResponse.json(
          {
            error: "Related record not found",
            code: "FOREIGN_KEY_VIOLATION",
          },
          { status: 400 }
        );

      case "P2034":
        return NextResponse.json(
          {
            error: "Transaction failed due to conflict. Please retry.",
            code: "TRANSACTION_CONFLICT",
          },
          { status: 409 }
        );

      default:
        console.error("Unhandled Prisma error:", prismaError);
    }
  }

  // Generic server error
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );
}

// ============================================
// REQUEST WRAPPER
// ============================================

/**
 * Wraps API route handler with error handling
 */
export function withErrorHandler(
  handler: (
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return formatErrorResponse(error);
    }
  };
}

// ============================================
// RATE LIMITING (BASIC IMPLEMENTATION)
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

/**
 * Basic rate limiting implementation
 * For production, use Redis or external service
 */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Cleans up expired rate limit entries
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);
