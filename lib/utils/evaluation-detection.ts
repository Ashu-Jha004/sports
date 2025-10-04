// lib/utils/evaluation-detection.ts (NEW FILE)
/**
 * =============================================================================
 * EVALUATION NOTIFICATION DETECTION UTILITIES
 * =============================================================================
 */

import { isEvaluationNotification } from "./text-truncation";

export interface EvaluationDetectionResult {
  isEvaluation: boolean;
  hasOTP: boolean;
  hasSchedule: boolean;
  hasLocation: boolean;
  hasEquipment: boolean;
  confidence: "high" | "medium" | "low";
  evaluationType:
    | "stats_approval"
    | "stats_denial"
    | "stats_request"
    | "general"
    | null;
}

/**
 * Enhanced evaluation notification detection
 */
export const detectEvaluationNotification = (
  notification: any
): EvaluationDetectionResult => {
  const message = notification.message?.toLowerCase() || "";
  const title = notification.title?.toLowerCase() || "";
  const type = notification.type;
  const data = notification.data || {};

  // Initialize result
  const result: EvaluationDetectionResult = {
    isEvaluation: false,
    hasOTP: false,
    hasSchedule: false,
    hasLocation: false,
    hasEquipment: false,
    confidence: "low",
    evaluationType: null,
  };

  // High confidence: Direct type matching
  if (
    [
      "STAT_UPDATE_APPROVED",
      "STAT_UPDATE_DENIED",
      "STAT_UPDATE_REQUEST",
    ].includes(type)
  ) {
    result.isEvaluation = true;
    result.confidence = "high";
    result.evaluationType =
      type === "STAT_UPDATE_APPROVED"
        ? "stats_approval"
        : type === "STAT_UPDATE_DENIED"
        ? "stats_denial"
        : "stats_request";
  }

  // Medium confidence: Content-based detection
  else if (
    isEvaluationNotification(message) ||
    isEvaluationNotification(title)
  ) {
    result.isEvaluation = true;
    result.confidence = "medium";
    result.evaluationType = "general";
  }

  // Low confidence: Keyword detection
  else {
    const evaluationKeywords = [
      "physical evaluation",
      "stats verification",
      "performance check",
      "skill assessment",
      "athletic evaluation",
      "verification required",
    ];

    const hasEvaluationKeywords = evaluationKeywords.some(
      (keyword) => message.includes(keyword) || title.includes(keyword)
    );

    if (hasEvaluationKeywords) {
      result.isEvaluation = true;
      result.confidence = "low";
      result.evaluationType = "general";
    }
  }

  // Detect specific evaluation components
  if (result.isEvaluation) {
    // OTP detection
    result.hasOTP =
      /otp|verification code|access code|pin|EVL-\\d+/i.test(message) ||
      /otp|verification code|access code|pin|EVL-\\d+/i.test(title) ||
      !!data.otp;

    // Schedule detection
    result.hasSchedule =
      /scheduled|appointment|meeting|time|date/i.test(message) ||
      /scheduled|appointment|meeting|time|date/i.test(title) ||
      !!data.scheduledTime ||
      !!data.appointmentTime;

    // Location detection
    result.hasLocation =
      /location|venue|address|meet at|ground|field|gym/i.test(message) ||
      /location|venue|address|meet at|ground|field|gym/i.test(title) ||
      !!data.location ||
      !!data.venue;

    // Equipment detection
    result.hasEquipment =
      /equipment|gear|bring|required items|materials/i.test(message) ||
      /equipment|gear|bring|required items|materials/i.test(title) ||
      !!(data.equipment && Array.isArray(data.equipment));

    // Increase confidence if multiple components detected
    const componentCount = [
      result.hasOTP,
      result.hasSchedule,
      result.hasLocation,
      result.hasEquipment,
    ].filter(Boolean).length;

    if (componentCount >= 3) {
      result.confidence = "high";
    } else if (componentCount >= 2) {
      result.confidence =
        result.confidence === "low" ? "medium" : result.confidence;
    }
  }

  return result;
};

/**
 * Determine if notification should use evaluation dialog
 */
export const shouldUseEvaluationDialog = (notification: any): boolean => {
  const detection = detectEvaluationNotification(notification);

  // Use evaluation dialog for high confidence or medium confidence with specific components
  return (
    detection.confidence === "high" ||
    (detection.confidence === "medium" &&
      (detection.hasOTP || detection.hasSchedule))
  );
};

/**
 * Extract evaluation data from notification
 */
export const extractEvaluationData = (notification: any) => {
  const message = notification.message || "";
  const data = notification.data || {};

  // Extract OTP from message or data
  const otpMatch =
    message.match(/(?:OTP|Code|PIN):\\s*([A-Z0-9-]+)/i) ||
    message.match(/(EVL-\\d{4}-\\d{4})/i);

  // Extract location from message or data
  const locationMatch = message.match(
    /(?:Location|Venue|Address):\\s*([^.!?]+)/i
  );

  // Extract time from message or data
  const timeMatch = message.match(
    /(?:Time|Scheduled|Appointment):\\s*([^.!?]+)/i
  );

  return {
    otp: data.otp || (otpMatch ? otpMatch[1] : null),
    location: data.location || (locationMatch ? locationMatch[1].trim() : null),
    scheduledTime:
      data.scheduledTime ||
      data.appointmentTime ||
      (timeMatch ? new Date(timeMatch[1]).toISOString() : null),
    equipment: data.equipment || [],
    evaluatorName: data.evaluatorName || data.guideName || null,
    evaluatorContact: data.evaluatorContact || data.guideContact || null,
    meetingType:
      data.meetingType ||
      (message.includes("virtual") ? "virtual" : "physical"),
    additionalNotes: data.additionalNotes || data.notes || null,
    venue: data.venue || null,
    requirements: data.requirements || "Valid ID, Athletic wear, Water bottle",
    ...data, // Spread existing data to preserve any additional fields
  };
};