// lib/api/utils/response-utils.ts
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors/api-errors";

/**
 * =============================================================================
 * API RESPONSE UTILITIES
 * =============================================================================
 */

/**
 * Standard API response interface
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp: string;
}

/**
 * Creates standardized success response
 */
export const createApiResponse = <T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Creates standardized error response
 */
export const createErrorResponse = (
  error: string,
  status: number = 500,
  details?: any
): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error,
      details: process.env.NODE_ENV === "development" ? details : undefined,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Handles API errors with proper status codes and messages
 */
export const handleApiError = (
  error: unknown,
  context?: string
): NextResponse<ApiResponse> => {
  console.error(`❌ API Error${context ? ` in ${context}` : ""}:`, error);

  if (error instanceof ApiError) {
    return createErrorResponse(error.message, error.statusCode, error.details);
  }

  if (error instanceof Error) {
    // Handle specific database errors
    if (error.message.includes("Unique constraint")) {
      const field = error.message.includes("username") ? "username" : "field";
      return createErrorResponse(
        `This ${field} is already taken. Please choose another.`,
        409,
        { field }
      );
    }

    if (error.message.includes("Foreign key constraint")) {
      return createErrorResponse("Invalid reference provided", 400);
    }

    if (error.message.includes("enum")) {
      return createErrorResponse("Invalid enum value provided", 400, {
        message: error.message,
      });
    }

    return createErrorResponse(error.message, 500);
  }

  return createErrorResponse("Internal server error", 500);
};

/**
 * Validates request content type
 */
export const validateContentType = (req: Request): void => {
  const contentType = req.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    throw new ApiError("Content-Type must be application/json", 400);
  }
};
