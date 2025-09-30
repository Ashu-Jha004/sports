// lib/api/errors/api-errors.ts

/**
 * =============================================================================
 * API ERROR CLASSES
 * =============================================================================
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = "Validation failed", details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT_ERROR");
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super("User not found. Please try logging out and back in.");
  }
}

export class ProfileCreationError extends ApiError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode, "PROFILE_CREATION_ERROR");
  }
}
// lib/api/errors/api-errors.ts (Additional profile errors)

// ... Previous error classes ...

export class ProfileNotFoundError extends NotFoundError {
  constructor(message: string = "Profile not found or incomplete") {
    super(message);
    this.code = "PROFILE_NOT_FOUND";
  }
}

export class ProfileAccessDeniedError extends AuthorizationError {
  constructor(message: string = "Access to this profile is restricted") {
    super(message);
    this.code = "PROFILE_ACCESS_DENIED";
  }
}

export class ProfileDataError extends ApiError {
  constructor(message: string = "Profile data is corrupted or invalid") {
    super(message, 422, "PROFILE_DATA_ERROR");
  }
}
