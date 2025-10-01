// =============================================================================
// CUSTOM ERROR CLASSES - MODERATOR REGISTRATION
// =============================================================================

/**
 * Base application error class with enhanced context
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly field?: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    field?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string, context?: Record<string, any>) {
    super(message, 400, "VALIDATION_ERROR", field, context);
  }
}

/**
 * Authentication error for unauthorized access
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Conflict error for duplicate resources
 */
export class ConflictError extends AppError {
  constructor(message: string, field?: string, context?: Record<string, any>) {
    super(message, 409, "CONFLICT_ERROR", field, context);
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * Rate limit error for too many requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

/**
 * Database error for data persistence issues
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed",
    context?: Record<string, any>
  ) {
    super(message, 500, "DATABASE_ERROR", undefined, context);
  }
}

/**
 * Utility function to generate unique trace IDs
 */
export function generateTraceId(): string {
  return `mod_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Check if error is retriable (for retry logic)
 */
export function isRetriableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const retriablePatterns = [
    "connection",
    "timeout",
    "ECONNRESET",
    "ETIMEDOUT",
  ];
  return retriablePatterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Check if error should not be retried (business logic errors)
 */
export function isNonRetriableError(error: unknown): boolean {
  return (
    error instanceof ValidationError ||
    error instanceof ConflictError ||
    error instanceof NotFoundError ||
    error instanceof AuthenticationError ||
    error instanceof RateLimitError
  );
}
