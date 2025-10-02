import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { authenticateUser } from "@/lib/api/middleware/auth";
import {
  handleApiError,
  createApiResponse,
} from "@/lib/api/utils/response-utils";
import { DOCUMENT_VALIDATION_CONFIG } from "../../../types/document";
import { auth } from "@clerk/nextjs/server";

/**
 * =============================================================================
 * DOCUMENT UPLOAD API ENDPOINT (SEPARATE FROM IMAGES)
 * =============================================================================
 */

// Use existing Cloudinary config (no changes needed)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  console.log("📄 Document upload request received");
  const { userId } = await auth();

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const purpose = formData.get("purpose") || "moderator_application"; // Optional context

    if (!file) {
      return createApiResponse({ error: "No file provided" }, 400);
    }

    console.log("📄 Document received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Step 3: Validate document file
    const validation = validateDocumentFile(file);
    if (!validation.isValid) {
      return createApiResponse({ error: validation.error }, 400);
    }

    // Step 4: Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("🔄 Starting Cloudinary document upload...");

    // Step 5: Upload to Cloudinary (DIFFERENT from images)
    // Step 5: Upload to Cloudinary with original filename preserved
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: "moderator-documents",
        resource_type: "raw" as const,
        use_filename: true, // ✅ Preserve original filename
        unique_filename: false, // ✅ Don't generate random names
        public_id: `${userId}_${Date.now()}_${file.name.replace(
          /\.[^/.]+$/,
          ""
        )}`, // ✅ Custom public_id with user info
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary document upload error:", error);
            reject(error);
          } else {
            console.log(
              "✅ Cloudinary document upload successful:",
              result?.public_id
            );
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // Step 6: Return URL with original filename preserved
    const result = uploadResult as any;

    return NextResponse.json(
      {
        secure_url: result.secure_url,
        public_id: result.public_id,
        original_filename: result.original_filename || file.name, // ✅ Include original filename
        format: result.format,
        bytes: result.bytes,
        resource_type: result.resource_type,
        created_at: result.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Document upload failed:", error);
    return handleApiError(error, "document upload");
  }
}

/**
 * =============================================================================
 * DOCUMENT VALIDATION HELPERS (SEPARATE FROM IMAGE VALIDATION)
 * =============================================================================
 */

const validateDocumentFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // File size validation
  if (file.size > DOCUMENT_VALIDATION_CONFIG.MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Document size must be less than ${
        DOCUMENT_VALIDATION_CONFIG.MAX_SIZE_BYTES / (1024 * 1024)
      }MB`,
    };
  }

  // File extension validation
  const fileExtension = file.name.toLowerCase().split(".").pop();

  if (
    !fileExtension ||
    !DOCUMENT_VALIDATION_CONFIG.ALLOWED_FORMATS.includes(fileExtension as any)
  ) {
    return {
      isValid: false,
      error: `Document type not supported. Allowed formats: ${DOCUMENT_VALIDATION_CONFIG.ALLOWED_FORMATS.join(
        ", "
      )}`,
    };
  }

  // MIME type validation for documents
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid document type. Please upload PDF, DOC, DOCX, or TXT files.`,
    };
  }

  return { isValid: true };
};
