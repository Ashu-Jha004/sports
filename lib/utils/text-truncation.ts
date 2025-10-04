// lib/utils/text-truncation.ts (NEW FILE)
/**
 * =============================================================================
 * TEXT TRUNCATION UTILITIES
 * =============================================================================
 */

// lib/utils/text-truncation.ts (CORRECTED VERSION)
/**
 * =============================================================================
 * TEXT TRUNCATION UTILITIES (TYPESCRIPT CORRECTED)
 * =============================================================================
 */

export interface TruncationOptions {
  /** Maximum character limit */
  maxLength: number;
  /** Suffix to append when text is truncated */
  suffix?: string;
  /** Preserve whole words when possible */
  preserveWords?: boolean;
  /** Minimum length before truncation applies */
  minLength?: number;
  /** Important keywords to try to preserve */
  preserveKeywords?: string[]; // FIXED: Regular string[] instead of readonly
}

/**
 * Default truncation configurations for different content types
 */
export const TRUNCATION_CONFIGS = {
  NOTIFICATION_TITLE: {
    maxLength: 50,
    suffix: "...",
    preserveWords: true,
    minLength: 20,
  },
  NOTIFICATION_MESSAGE: {
    maxLength: 80,
    suffix: "...",
    preserveWords: true,
    minLength: 30,
    preserveKeywords: [
      "OTP",
      "evaluation",
      "accepted",
      "rejected",
      "scheduled",
      "location",
    ], // FIXED: Regular array
  },
  NOTIFICATION_ACTOR: {
    maxLength: 25,
    suffix: "...",
    preserveWords: false,
    minLength: 10,
  },
}; // FIXED: Removed 'as const'

// ... (rest of functions remain the same)

/**
 * Smart text truncation with word preservation
 */
export const truncateText = (
  text: string,
  options: TruncationOptions
): { truncated: string; isTruncated: boolean } => {
  const {
    maxLength,
    suffix = "...",
    preserveWords = true,
    minLength = 10,
    preserveKeywords = [],
  } = options;

  // Return original if it's already short enough
  if (!text || text.length <= maxLength) {
    return { truncated: text, isTruncated: false };
  }

  // Don't truncate if it's shorter than minimum length
  if (text.length <= minLength) {
    return { truncated: text, isTruncated: false };
  }

  let truncatedText = text;

  // If preserving words, try to cut at word boundaries
  if (preserveWords) {
    const targetLength = maxLength - suffix.length;

    // First, check if any important keywords would be cut off
    if (preserveKeywords.length > 0) {
      const hasImportantKeywords = preserveKeywords.some((keyword) =>
        text.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasImportantKeywords) {
        // Try to preserve important keywords
        const keywordPositions = preserveKeywords
          .map((keyword) => {
            const pos = text.toLowerCase().indexOf(keyword.toLowerCase());
            return pos !== -1
              ? { keyword, start: pos, end: pos + keyword.length }
              : null;
          })
          .filter(Boolean);

        if (keywordPositions.length > 0) {
          // Find the last keyword that fits within our limit
          const lastKeywordInRange = keywordPositions
            .filter((kp) => kp!.end <= targetLength)
            .sort((a, b) => b!.end - a!.end)[0];

          if (lastKeywordInRange) {
            // Extend to include the full keyword
            const extendedLength = Math.min(
              lastKeywordInRange.end + 10,
              targetLength
            );
            truncatedText = text.substring(0, extendedLength);
          }
        }
      }
    }

    // If we haven't set truncatedText yet, use standard word boundary logic
    if (truncatedText === text) {
      truncatedText = text.substring(0, targetLength);

      // Find the last space to avoid cutting words
      const lastSpaceIndex = truncatedText.lastIndexOf(" ");
      if (lastSpaceIndex > targetLength * 0.7) {
        // Only if we don't lose too much content
        truncatedText = truncatedText.substring(0, lastSpaceIndex);
      }
    }
  } else {
    // Simple character-based truncation
    truncatedText = text.substring(0, maxLength - suffix.length);
  }

  // Clean up trailing punctuation and whitespace
  truncatedText = truncatedText.replace(/[.,;:!?\s]+$/, "");

  return {
    truncated: truncatedText + suffix,
    isTruncated: true,
  };
};

/**
 * Truncate notification title
 */
export const truncateNotificationTitle = (
  title: string
): { truncated: string; isTruncated: boolean } => {
  return truncateText(title, TRUNCATION_CONFIGS.NOTIFICATION_TITLE);
};

/**
 * Truncate notification message with smart keyword preservation
 */
export const truncateNotificationMessage = (
  message: string
): { truncated: string; isTruncated: boolean } => {
  return truncateText(message, TRUNCATION_CONFIGS.NOTIFICATION_MESSAGE);
};

/**
 * Truncate actor name
 */
export const truncateActorName = (
  name: string
): { truncated: string; isTruncated: boolean } => {
  return truncateText(name, TRUNCATION_CONFIGS.NOTIFICATION_ACTOR);
};

/**
 * Get preview text for hover tooltips
 */
export const getPreviewText = (
  text: string,
  maxLength: number = 200
): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
};

/**
 * Smart line breaking for long text
 */
export const formatTextWithLineBreaks = (
  text: string,
  maxLineLength: number = 40
): string => {
  if (!text || text.length <= maxLineLength) {
    return text;
  }

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + " " + word).length <= maxLineLength) {
      currentLine = currentLine ? currentLine + " " + word : word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join("\n");
};

/**
 * Check if text contains evaluation-related keywords
 */
export const isEvaluationNotification = (message: string): boolean => {
  const evaluationKeywords = [
    "evaluation",
    "otp",
    "scheduled",
    "location",
    "equipment",
    "meeting",
    "appointment",
    "verification",
    "guide",
    "stat update",
    "physical evaluation",
  ];

  const lowerMessage = message.toLowerCase();
  return evaluationKeywords.some((keyword) => lowerMessage.includes(keyword));
};

/**
 * Extract key information from evaluation notifications
 */
export const extractEvaluationDetails = (
  message: string
): {
  hasOTP: boolean;
  hasLocation: boolean;
  hasSchedule: boolean;
  keywords: string[];
} => {
  const lowerMessage = message.toLowerCase();

  return {
    hasOTP: /otp|verification|code/.test(lowerMessage),
    hasLocation: /location|address|venue|meet/.test(lowerMessage),
    hasSchedule: /scheduled|time|date|appointment/.test(lowerMessage),
    keywords: [
      "evaluation",
      "otp",
      "location",
      "scheduled",
      "equipment",
    ].filter((keyword) => lowerMessage.includes(keyword)),
  };
};

/**
 * Format relative time with truncation
 */
export const formatTimeWithTruncation = (
  dateString: string,
  includeSeconds: boolean = false
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return includeSeconds ? "now" : "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
