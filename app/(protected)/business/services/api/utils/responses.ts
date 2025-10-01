// =============================================================================
// RESPONSE UTILITIES - MODERATOR REGISTRATION
// =============================================================================

import { NextResponse } from "next/server";
import { AppError } from "./errors";
import type { ApiSuccessResponse, ApiErrorResponse } from "./types";

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string,
  traceId: string,
  statusCode: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
    metadata: {
      traceId,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  };

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      "X-Trace-ID": traceId,
      "X-API-Version": "1.0.0",
      "Cache-Control": "no-cache",
    },
  });
}

/**
 * Create standardized error response with proper logging
 */
export function createErrorResponse(
  error: AppError | Error,
  traceId: string,
  includeStack: boolean = process.env.NODE_ENV === "development"
): NextResponse<ApiErrorResponse> {
  const isAppError = error instanceof AppError;

  const response: ApiErrorResponse = {
    success: false,
    error: {
      message: error.message,
      code: isAppError ? error.code : "INTERNAL_ERROR",
      ...(isAppError && error.field && { field: error.field }),
      ...(isAppError && error.context && { details: error.context }),
      ...(includeStack && { stack: error.stack }),
    },
    metadata: {
      traceId,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  };

  const statusCode = isAppError ? error.statusCode : 500;

  // Enhanced error logging
  console.error(`API Error [${traceId}]:`, {
    error: error.message,
    code: isAppError ? error.code : "INTERNAL_ERROR",
    statusCode,
    field: isAppError ? error.field : undefined,
    context: isAppError ? error.context : undefined,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: process.env.VERCEL_URL || "localhost",
  });

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      "X-Trace-ID": traceId,
      "X-API-Version": "1.0.0",
      "Cache-Control": "no-cache",
    },
  });
}

/**
 * Create 201 Created response for new resources
 */
export function createCreatedResponse<T>(
  data: T,
  message: string,
  traceId: string
): NextResponse<ApiSuccessResponse<T>> {
  return createSuccessResponse(data, message, traceId, 201);
}

/**
 * Create 404 Not Found response
 */
export function createNotFoundResponse(
  message: string,
  traceId: string
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      message,
      code: "NOT_FOUND",
    },
    metadata: {
      traceId,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  };

  return NextResponse.json(response, {
    status: 404,
    headers: {
      "X-Trace-ID": traceId,
      "X-API-Version": "1.0.0",
    },
  });
}

/**
 * Create CORS-enabled OPTIONS response
 */
export function createOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "POST, GET, OPTIONS",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/**
 * Validate content type header
 */
export function validateContentType(request: Request): void {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error("Content-Type must be application/json");
  }
}

/**
 * Enhanced logging for successful operations
 */
export function logSuccess(
  operation: string,
  traceId: string,
  data: Record<string, any>
): void {
  console.log(`SUCCESS [${operation}] [${traceId}]:`, {
    ...data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}

/**
 * Enhanced logging for warning operations
 */
export function logWarning(
  operation: string,
  traceId: string,
  message: string,
  data?: Record<string, any>
): void {
  console.warn(`WARNING [${operation}] [${traceId}]: ${message}`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}
