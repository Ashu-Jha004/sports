// api/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { authenticateUser } from "@/lib/api/middleware/auth";
import {
  handleApiError,
  createApiResponse,
} from "@/lib/api/utils/response-utils";
import { IMAGE_VALIDATION_CONFIG } from "@/types/profile";

/**
 * =============================================================================
 * IMAGE UPLOAD API ENDPOINT
 * =============================================================================
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  console.log("📸 Image upload request received");

  try {
    // Step 1: Authentication
    const user = await authenticateUser();

    // Step 2: Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const options = formData.get("options");

    if (!file) {
      return createApiResponse({ error: "No file provided" }, 400);
    }

    console.log("📄 File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Step 3: Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return createApiResponse({ error: validation.error }, 400);
    }

    // Step 4: Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("🔄 Starting Cloudinary upload...");

    // Step 5: Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: "profile-images",
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            quality: "auto:good",
          },
        ],
        resource_type: "image" as const,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("✅ Cloudinary upload successful:", result?.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // Step 6: Success response
    return createApiResponse(
      {
        secure_url: (uploadResult as any).secure_url,
        public_id: (uploadResult as any).public_id,
        width: (uploadResult as any).width,
        height: (uploadResult as any).height,
        format: (uploadResult as any).format,
        resource_type: (uploadResult as any).resource_type,
      },
      201
    );
  } catch (error) {
    console.error("❌ Image upload failed:", error);
    return handleApiError(error, "image upload");
  }
}

/**
 * =============================================================================
 * VALIDATION HELPERS
 * =============================================================================
 */

const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // File size validation
  if (file.size > IMAGE_VALIDATION_CONFIG.MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size must be less than ${
        IMAGE_VALIDATION_CONFIG.MAX_SIZE_BYTES / (1024 * 1024)
      }MB`,
    };
  }

  // File extension validation
  const fileExtension = file.name.toLowerCase().split(".").pop();

  if (
    !fileExtension ||
    !IMAGE_VALIDATION_CONFIG.ALLOWED_FORMATS.includes(fileExtension as any)
  ) {
    return {
      isValid: false,
      error: `File type not supported. Allowed formats: ${IMAGE_VALIDATION_CONFIG.ALLOWED_FORMATS.join(
        ", "
      )}`,
    };
  }

  // File type validation (MIME type)
  const allowedMimeTypes = IMAGE_VALIDATION_CONFIG.ALLOWED_FORMATS.map(
    (format) => `image/${format === "jpg" ? "jpeg" : format}`
  );

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Expected: ${allowedMimeTypes.join(", ")}`,
    };
  }

  return { isValid: true };
};
