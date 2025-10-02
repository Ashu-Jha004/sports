// =============================================================================
// VALIDATION SCHEMAS & LOGIC - MODERATOR REGISTRATION
// =============================================================================

import { z } from "zod";
import { ValidationError } from "./errors";
import type { ModeratorRegistrationData } from "./types";

// =============================================================================
// ZOD VALIDATION SCHEMA
// =============================================================================

// UPDATED: Better error messages for documents validation
export const moderatorRegistrationSchema = z.object({
  guideEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .max(254, "Email is too long"),

  primarySports: z
    .string()
    .min(1, "Primary sport is required")
    .max(100, "Primary sport name is too long"),

  sports: z
    .array(
      z
        .string()
        .min(1, "Sport name cannot be empty")
        .max(100, "Sport name is too long")
    )
    .min(1, "At least one sport must be selected")
    .max(20, "Maximum 20 sports allowed")
    .refine((sports) => new Set(sports).size === sports.length, {
      message: "Duplicate sports are not allowed",
    }),

  // UPDATED: More detailed document validation
  documents: z
    .array(z.string().min(1, "Document path cannot be empty"))
    .min(1, "At least one document must be uploaded")
    .max(10, "Maximum 10 documents allowed")
    .refine(
      (docs) => {
        // Additional validation for debugging
        docs.forEach((doc, index) => {
          if (typeof doc !== "string") {
            throw new Error(
              `Document at index ${index} must be a string, got ${typeof doc}`
            );
          }
          if (!doc.trim()) {
            throw new Error(
              `Document at index ${index} is empty or whitespace only`
            );
          }
        });
        return true;
      },
      {
        message: "All documents must be valid non-empty strings",
      }
    ),

  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country name is too long"),

  experience: z
    .number()
    .int("Experience must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(50, "Experience cannot exceed 50 years")
    .optional()
    .nullable(),

  state: z.string().max(100, "State name is too long").optional().nullable(),

  city: z.string().max(100, "City name is too long").optional().nullable(),

  lat: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable(),

  lon: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable(),
});

// =============================================================================
// REQUEST VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate and parse request body using Zod schema
 */
export async function validateRequestBody(
  request: Request
): Promise<ModeratorRegistrationData> {
  let body: any;

  try {
    body = await request.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON format in request body", "body", {
      parseError: error instanceof Error ? error.message : "Unknown JSON error",
    });
  }

  // DEBUG: Log received data structure
  console.log("=== SERVER VALIDATION DEBUG ===");
  console.log("Received body:", JSON.stringify(body, null, 2));
  console.log("Documents in body:", body.documents);
  if (body.documents && Array.isArray(body.documents)) {
    body.documents.forEach((doc: any, index: number) => {
      console.log(`Server received document ${index}:`, doc);
      console.log(`Server document ${index} type:`, typeof doc);
    });
  }

  try {
    return moderatorRegistrationSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      console.log("Zod validation error:", error.issues);
      throw new ValidationError(firstError.message, firstError.path.join("."), {
        allErrors: error.issues,
        receivedData: sanitizeForLogging(body),
      });
    }
    throw new ValidationError("Request validation failed");
  }
}

/**
 * Sanitize data for safe logging (remove sensitive information)
 */
function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== "object") return data;

  const sensitiveFields = ["password", "token", "secret", "key"];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = "[REDACTED]";
    }
  });

  return sanitized;
}

// =============================================================================
// DATA SANITIZATION
// =============================================================================

/**
 * Sanitize and normalize input data
 */
export function sanitizeData(
  data: ModeratorRegistrationData
): ModeratorRegistrationData {
  return {
    ...data,
    guideEmail: data.guideEmail.trim().toLowerCase(),
    primarySports: data.primarySports.trim(),
    sports: data.sports.map((sport) => sport.trim()).filter(Boolean),
    // UPDATED: Handle both string and object documents
    documents: data.documents
      .map((doc) => {
        if (typeof doc === "string") {
          return doc.trim();
        }
        // If it's an object, extract the relevant string identifier
        return doc || String(doc);
      })
      .filter(Boolean),
    country: data.country.trim(),
    state: data.state?.trim() || null,
    city: data.city?.trim() || null,
  };
}

// =============================================================================
// BUSINESS RULES VALIDATION
// =============================================================================

/**
 * Validate business rules for moderator registration
 */
export async function validateBusinessRules(
  data: ModeratorRegistrationData
): Promise<void> {
  // Run all business rule validations
  validatePrimarySportInList(data);
  validateLocationConsistency(data);
  validateDocumentFormats(data);
  validateExperienceReasonableness(data);
}

/**
 * Ensure primary sport is included in sports array
 */
function validatePrimarySportInList(data: ModeratorRegistrationData): void {
  if (!data.sports.includes(data.primarySports)) {
    throw new ValidationError(
      "Primary sport must be included in the sports list",
      "primarySports",
      {
        primarySport: data.primarySports,
        availableSports: data.sports,
      }
    );
  }
}

/**
 * Validate location data consistency - COMPLETELY FIXED
 */
function validateLocationConsistency(data: ModeratorRegistrationData): void {
  // Check if we have valid coordinates (not null, not undefined)
  const hasCoordinates =
    data.lat !== null &&
    data.lat !== undefined &&
    data.lon !== null &&
    data.lon !== undefined;
  const hasLocation = data.city || data.state;

  if (hasCoordinates && !hasLocation) {
    throw new ValidationError(
      "City or state must be provided when coordinates are specified",
      "location",
      {
        coordinates: { lat: data.lat, lon: data.lon },
        providedLocation: { city: data.city, state: data.state },
      }
    );
  }

  // FIXED: Only validate coordinate ranges if coordinates exist AND are numbers
  if (hasCoordinates) {
    // Type assertions since we've already verified they're not null/undefined
    const lat = data.lat as number;
    const lon = data.lon as number;

    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      throw new ValidationError(
        "Invalid coordinate values provided",
        "coordinates",
        { lat, lon }
      );
    }
  }
}

/**
 * Validate document formats and file extensions
 */
/**
 * Validate document formats and file extensions
 */
function validateDocumentFormats(data: ModeratorRegistrationData): void {
  console.log("🔍 VALIDATION: Starting document format validation");
  console.log("🔍 VALIDATION: Documents to validate:", data.documents);

  const validExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".doc",
    ".docx",
  ];
  const invalidDocs: string[] = [];

  data.documents.forEach((doc, index) => {
    console.log(`🔍 VALIDATION: Checking document ${index}:`, doc);

    // ✅ FIXED: Skip validation for Cloudinary moderator documents
    if (
      doc.includes("res.cloudinary.com") &&
      doc.includes("moderator-documents")
    ) {
      console.log(
        `✅ VALIDATION: Document ${index} is a Cloudinary moderator document - skipping format validation`
      );
      return; // Skip validation for trusted Cloudinary documents
    }

    // ✅ FIXED: Better extension extraction logic
    let extension = "";

    // Try to extract extension from the last part of the path (after last slash)
    const pathParts = doc.split("/");
    const filename = pathParts[pathParts.length - 1];
    const lastDotIndex = filename.lastIndexOf(".");

    if (lastDotIndex !== -1 && lastDotIndex < filename.length - 1) {
      extension = filename.substring(lastDotIndex).toLowerCase();
      console.log(
        `🔍 VALIDATION: Extracted extension for document ${index}:`,
        extension
      );
    } else {
      console.log(
        `🔍 VALIDATION: No extension found for document ${index}:`,
        filename
      );
    }

    // Check if extension is valid
    if (extension && !validExtensions.includes(extension)) {
      console.log(
        `❌ VALIDATION: Invalid extension for document ${index}:`,
        extension
      );
      invalidDocs.push(doc);
    } else if (!extension) {
      console.log(
        `❌ VALIDATION: No extension found for document ${index}:`,
        doc
      );
      invalidDocs.push(doc);
    } else {
      console.log(
        `✅ VALIDATION: Valid extension for document ${index}:`,
        extension
      );
    }
  });

  if (invalidDocs.length > 0) {
    console.log("❌ VALIDATION: Found invalid documents:", invalidDocs);
    throw new ValidationError(
      "Invalid document formats detected. Only PDF, image, and document files are allowed.",
      "documents",
      {
        invalidDocuments: invalidDocs,
        validFormats: validExtensions,
        totalDocuments: data.documents.length,
      }
    );
  }

  // Check for reasonable document names (basic security)
  const suspiciousPatterns = ["../", ".exe", ".js", ".php", ".asp"];
  const suspiciousDocs = data.documents.filter((doc) =>
    suspiciousPatterns.some((pattern) => doc.toLowerCase().includes(pattern))
  );

  if (suspiciousDocs.length > 0) {
    throw new ValidationError(
      "Suspicious document paths detected",
      "documents",
      { suspiciousDocuments: suspiciousDocs }
    );
  }

  console.log("✅ VALIDATION: All documents passed format validation");
}

/**
 * Validate experience values are reasonable
 */
function validateExperienceReasonableness(
  data: ModeratorRegistrationData
): void {
  if (data.experience !== null && data.experience !== undefined) {
    // Additional business logic checks
    if (data.experience > 50) {
      throw new ValidationError(
        "Experience value seems unusually high. Please verify the number of years.",
        "experience",
        {
          providedExperience: data.experience,
          maximumReasonable: 50,
        }
      );
    }

    if (data.experience < 0) {
      throw new ValidationError("Experience cannot be negative", "experience", {
        providedExperience: data.experience,
      });
    }
  }
}

// =============================================================================
// CONTENT TYPE VALIDATION
// =============================================================================

/**
 * Validate request content type
 */
export function validateContentType(request: Request): void {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new ValidationError(
      "Content-Type must be application/json",
      "content-type",
      { receivedContentType: contentType }
    );
  }
}

// =============================================================================
// EXPORT TYPE FOR EXTERNAL USE
// =============================================================================

// Re-export the inferred type for use in other modules
export type { ModeratorRegistrationData } from "./types";
