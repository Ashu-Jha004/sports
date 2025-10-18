// File: lib/utils/errorHandling.ts
export class OTPVerificationError extends Error {
  constructor(
    public type:
      | "INVALID_OTP"
      | "DATE_MISMATCH"
      | "EXPIRED_REQUEST"
      | "NETWORK_ERROR"
      | "VALIDATION_ERROR",
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = "OTPVerificationError";
  }
}

export const errorMessages = {
  INVALID_OTP: {
    title: "Invalid OTP",
    message: "The OTP you entered is incorrect or does not exist.",
    suggestion: "Please check your OTP and try again.",
  },
  DATE_MISMATCH: {
    title: "Date Mismatch",
    message:
      "OTP verification is only allowed on the scheduled evaluation date.",
    suggestion: "Please verify the OTP on the correct date.",
  },
  EXPIRED_REQUEST: {
    title: "Request Expired",
    message: "The evaluation request has expired or been cancelled.",
    suggestion: "Please request a new evaluation if needed.",
  },
  NETWORK_ERROR: {
    title: "Connection Error",
    message: "Unable to connect to the server.",
    suggestion: "Please check your internet connection and try again.",
  },
  VALIDATION_ERROR: {
    title: "Validation Error",
    message: "The data provided is invalid.",
    suggestion: "Please check your input and try again.",
  },
};

export const formatErrorForUser = (
  error: any
): { type: string; message: string; suggestion: string } => {
  if (error instanceof OTPVerificationError) {
    const errorInfo = errorMessages[error.type];
    return {
      type: error.type,
      message: error.message || errorInfo.message,
      suggestion: errorInfo.suggestion,
    };
  }

  // Fallback for unknown errors
  return {
    type: "NETWORK_ERROR",
    message: "An unexpected error occurred.",
    suggestion: "Please try again later or contact support.",
  };
};
