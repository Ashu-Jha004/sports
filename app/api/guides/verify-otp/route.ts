import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { OTPVerificationError } from "@/lib/utils/errorHandling";

// Enhanced validation with better error messages
const verifyOTPSchema = z.object({
  otp: z
    .number()
    .int("OTP must be a whole number")
    .min(100000, "OTP must be exactly 6 digits")
    .max(999999, "OTP must be exactly 6 digits"),
});

// Enhanced response type with detailed error info
interface VerifyOTPResponse {
  success: boolean;
  user?: {
    id: string;
    firstName: string | null;
    username: string | null;
    PrimarySport: string | null;
    profileImageUrl: string | null;
    role: string;
    Rank: string;
    Class: string;
    country: string | null;
    state: string | null;
    city: string | null;
    gender: string | null;
  };
  requestId?: string;
  scheduledDate?: string;
  error?: {
    type:
      | "INVALID_OTP"
      | "DATE_MISMATCH"
      | "EXPIRED_REQUEST"
      | "NETWORK_ERROR"
      | "VALIDATION_ERROR";
    message: string;
    details?: any;
  };
}

// Enhanced date validation
const isToday = (date: Date): boolean => {
  const today = new Date();
  const compareDate = new Date(date);

  // Normalize to UTC to avoid timezone issues
  const todayUTC = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const compareDateUTC = new Date(
    compareDate.getFullYear(),
    compareDate.getMonth(),
    compareDate.getDate()
  );

  return todayUTC.getTime() === compareDateUTC.getTime();
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

// Enhanced error response helper
const createErrorResponse = (
  type:
    | "INVALID_OTP"
    | "DATE_MISMATCH"
    | "EXPIRED_REQUEST"
    | "NETWORK_ERROR"
    | "VALIDATION_ERROR",
  message: string,
  status: number = 400,
  details?: any
): NextResponse => {
  console.error(`❌ API Error [${type}]:`, message, details ? { details } : "");

  return NextResponse.json(
    {
      success: false,
      error: {
        type,
        message,
        ...(details && { details }),
      },
    } as VerifyOTPResponse,
    { status }
  );
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("🔍 OTP Verification API called at", new Date().toISOString());

  try {
    // Step 1: Enhanced Authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "NETWORK_ERROR",
        "Authentication required. Please sign in and try again.",
        401
      );
    }

    // Step 2: Enhanced User Validation
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!currentUser) {
      return createErrorResponse(
        "NETWORK_ERROR",
        "User account not found. Please contact support.",
        404
      );
    }

    // Step 3: Enhanced Guide Validation
    const guide = await prisma.guide.findFirst({
      where: {
        userId: currentUser.id,
        status: "approved",
      },
      select: { id: true },
    });

    if (!guide) {
      return createErrorResponse(
        "NETWORK_ERROR",
        "You must be an approved guide to verify OTPs. Please check your guide status.",
        403
      );
    }

    // Step 4: Enhanced Request Validation
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "Invalid request format. Please check your data and try again.",
        400,
        {
          parseError:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error",
        }
      );
    }

    console.log(
      "📥 Request received for user:",
      currentUser.firstName,
      "| OTP:",
      body.otp ? `${body.otp}`.slice(0, 3) + "***" : "none"
    );

    const validation = verifyOTPSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResponse(
        "VALIDATION_ERROR",
        firstError?.message || "Please enter a valid 6-digit OTP.",
        400,
        { validationErrors: validation.error.issues }
      );
    }

    const { otp } = validation.data;

    // Step 5: Enhanced Database Query with Error Handling
    let evaluationRequest;
    try {
      evaluationRequest = await prisma.physicalEvaluationRequest.findFirst({
        where: {
          OTP: otp,
          guideId: guide.id,
          status: "ACCEPTED",
        },
        select: {
          id: true,
          userId: true,
          scheduledDate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return createErrorResponse(
        "NETWORK_ERROR",
        "Database connection error. Please try again in a moment.",
        503,
        {
          dbError:
            dbError instanceof Error
              ? dbError.message
              : "Unknown database error",
        }
      );
    }

    if (!evaluationRequest) {
      return createErrorResponse(
        "INVALID_OTP",
        "No matching evaluation found for this OTP. Please verify you entered the correct OTP from an accepted evaluation request.",
        404,
        {
          searchCriteria: {
            otp: `${otp}`.slice(0, 3) + "***",
            guideId: guide.id,
            status: "ACCEPTED",
          },
        }
      );
    }

    console.log("✅ Evaluation request found:", {
      id: evaluationRequest.id,
      userId: evaluationRequest.userId,
      status: evaluationRequest.status,
      scheduledDate: evaluationRequest.scheduledDate,
    });

    // Step 6: Enhanced Date Validation
    if (!evaluationRequest.scheduledDate) {
      return createErrorResponse(
        "EXPIRED_REQUEST",
        "This evaluation request does not have a scheduled date. Please contact the athlete to reschedule.",
        400,
        { requestId: evaluationRequest.id }
      );
    }

    if (!isToday(evaluationRequest.scheduledDate)) {
      const scheduledDateStr = formatDate(evaluationRequest.scheduledDate);
      const todayStr = formatDate(new Date());

      return createErrorResponse(
        "DATE_MISMATCH",
        `This evaluation is scheduled for ${scheduledDateStr}. OTP verification is only allowed on the scheduled date. Today is ${todayStr}.`,
        400,
        {
          scheduledDate: scheduledDateStr,
          currentDate: todayStr,
          requestId: evaluationRequest.id,
        }
      );
    }

    // Step 7: Enhanced User Fetch
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: evaluationRequest.userId },
        select: {
          id: true,
          firstName: true,
          username: true,
          PrimarySport: true,
          profileImageUrl: true,
          role: true,
          Rank: true,
          Class: true,
          country: true,
          state: true,
          city: true,
          gender: true,
        },
      });
    } catch (dbError) {
      console.error("User fetch error:", dbError);
      return createErrorResponse(
        "NETWORK_ERROR",
        "Error retrieving user information. Please try again.",
        503
      );
    }

    if (!user) {
      return createErrorResponse(
        "EXPIRED_REQUEST",
        "The athlete associated with this evaluation request no longer exists in our system.",
        404,
        { userId: evaluationRequest.userId, requestId: evaluationRequest.id }
      );
    }

    // Step 8: Success Response with Performance Metrics
    const processingTime = Date.now() - startTime;
    console.log(
      `✅ OTP verification successful in ${processingTime}ms for user:`,
      {
        id: user.id,
        firstName: user.firstName,
        PrimarySport: user.PrimarySport,
      }
    );

    const response: VerifyOTPResponse = {
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        username: user.username,
        PrimarySport: user.PrimarySport,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        Rank: user.Rank,
        Class: user.Class,
        country: user.country,
        state: user.state,
        city: user.city,
        gender: user.gender,
      },
      requestId: evaluationRequest.id,
      scheduledDate: evaluationRequest.scheduledDate.toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "X-Processing-Time": `${processingTime}ms`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Unexpected error after ${processingTime}ms:`, error);

    // Enhanced error Classification
    if (error instanceof Error) {
      // Network/Connection errors
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED")
      ) {
        return createErrorResponse(
          "NETWORK_ERROR",
          "Unable to connect to the database. Please check your connection and try again.",
          503,
          { errorType: "CONNECTION_ERROR", processingTime }
        );
      }

      // Timeout errors
      if (error.message.includes("timeout")) {
        return createErrorResponse(
          "NETWORK_ERROR",
          "Request timed out. Please try again.",
          504,
          { errorType: "TIMEOUT_ERROR", processingTime }
        );
      }

      // JSON parsing errors
      if (error instanceof SyntaxError) {
        return createErrorResponse(
          "VALIDATION_ERROR",
          "Invalid request format. Please check your data.",
          400,
          { errorType: "PARSE_ERROR", processingTime }
        );
      }
    }

    // Generic server error with correlation ID for debugging
    const correlationId = `err_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    console.error(`Correlation ID: ${correlationId}`, error);

    return createErrorResponse(
      "NETWORK_ERROR",
      "An unexpected error occurred. Please try again or contact support if the problem persists.",
      500,
      {
        correlationId,
        processingTime,
        errorType: "UNEXPECTED_ERROR",
      }
    );
  }
}
