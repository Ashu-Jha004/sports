// ============================================
// FILE: utils/error-handler.ts
// Centralized error handling with retry logic
// ============================================

import type { ApiErrorResponse } from "@/types/wizard.types";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Parses API error responses into structured error objects
 */
export function parseApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiErrorResponse;
    return apiError.error || apiError.message || "An unknown error occurred";
  }

  return "An unexpected error occurred";
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    shouldRetry = (error) => {
      // Retry on network errors or 5xx server errors
      if (error instanceof NetworkError) return true;
      if (error instanceof ApiError) {
        return error.statusCode ? error.statusCode >= 500 : false;
      }
      return false;
    },
  } = options;

  let lastError: unknown;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
      
      console.warn(
        `⚠️ Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`,
        parseApiError(error)
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe fetch wrapper with error handling
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    // Network errors (no response received)
    if (error instanceof TypeError) {
      throw new NetworkError("Network request failed. Please check your connection.", error);
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Unknown errors
    throw new ApiError(parseApiError(error));
  }
}

/**
 * Validates input boundaries for numeric fields
 */
export function validateNumericInput(
  value: number | null,
  constraints: {
    min?: number;
    max?: number;
    fieldName: string;
  }
): ValidationError | null {
  if (value === null) return null;

  const { min, max, fieldName } = constraints;

  if (min !== undefined && value < min) {
    return new ValidationError(`${fieldName} must be at least ${min}`, {
      [fieldName]: [`Minimum value is ${min}`],
    });
  }

  if (max !== undefined && value > max) {
    return new ValidationError(`${fieldName} must not exceed ${max}`, {
      [fieldName]: [`Maximum value is ${max}`],
    });
  }

  return null;
}

/**
 * Validates date input
 */
export function validateDate(
  dateString: string,
  fieldName: string
): ValidationError | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return new ValidationError(`${fieldName} is not a valid date`, {
      [fieldName]: ["Invalid date format"],
    });
  }

  // Future dates not allowed for occurred injuries
  if (date > now) {
    return new ValidationError(`${fieldName} cannot be in the future`, {
      [fieldName]: ["Date cannot be in the future"],
    });
  }

  return null;
}
