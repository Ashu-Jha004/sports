import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import {
  UploadImageRequest,
  UploadImageResponse,
  DEFAULT_IMAGE_VALIDATION,
} from "@/types/profile";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Helper function to validate file
function validateImageFile(
  fileBuffer: Buffer,
  fileName: string
): { isValid: boolean; error?: string } {
  // Check file size
  if (fileBuffer.length > DEFAULT_IMAGE_VALIDATION.maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${
        DEFAULT_IMAGE_VALIDATION.maxSizeBytes / (1024 * 1024)
      }MB limit`,
    };
  }

  // Check file format by extension
  const fileExtension = fileName.toLowerCase().split(".").pop();
  if (
    !fileExtension ||
    !DEFAULT_IMAGE_VALIDATION.allowedFormats.includes(fileExtension)
  ) {
    return {
      isValid: false,
      error: `Unsupported file format. Allowed: ${DEFAULT_IMAGE_VALIDATION.allowedFormats.join(
        ", "
      )}`,
    };
  }

  // Check if it's actually an image by checking magic bytes
  const magicBytes = fileBuffer.slice(0, 4).toString("hex");
  const imageSignatures = {
    ffd8ffe0: "jpg",
    ffd8ffe1: "jpg",
    ffd8ffe2: "jpg",
    ffd8ffe3: "jpg",
    ffd8ffe8: "jpg",
    "89504e47": "png",
    "47494638": "gif",
    "52494646": "webp",
  };

  const isValidImageSignature = Object.keys(imageSignatures).some((signature) =>
    magicBytes.startsWith(signature)
  );

  if (!isValidImageSignature) {
    return { isValid: false, error: "File is not a valid image" };
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const options = formData.get("options")
      ? JSON.parse(formData.get("options") as string)
      : {};

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate the file
    const validation = validateImageFile(buffer, file.name);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Convert buffer to base64 for Cloudinary
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Configure upload options
    const uploadOptions = {
      folder: "profile-images", // Organize uploads in a folder
      public_id: `profile_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`, // Unique ID
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face", // Focus on faces when cropping
          quality: "auto:good",
          format: "webp", // Convert to WebP for optimization
        },
      ],
      eager: [
        // Create additional sizes
        {
          width: 150,
          height: 150,
          crop: "fill",
          quality: "auto:good",
          format: "webp",
        }, // Thumbnail
        {
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto:best",
          format: "webp",
        }, // Large size
      ],
      eager_async: true, // Generate transformations asynchronously
      invalidate: true, // Invalidate CDN cache
      ...options, // Allow custom options
    };

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      base64File,
      uploadOptions
    );

    // Prepare response
    const response: UploadImageResponse = {
      success: true,
      data: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        created_at: uploadResult.created_at,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Handle specific Cloudinary errors
    let errorMessage = "Upload failed";
    if (error instanceof Error) {
      if (error.message.includes("Invalid image file")) {
        errorMessage = "Invalid image file format";
      } else if (error.message.includes("File size too large")) {
        errorMessage = "File size exceeds limit";
      } else if (error.message.includes("Invalid API key")) {
        errorMessage = "Server configuration error";
      } else {
        errorMessage = error.message;
      }
    }

    const response: UploadImageResponse = {
      success: false,
      error: errorMessage,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Optional: Handle DELETE requests to remove images
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "Public ID required" },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: result.result === "ok",
      message:
        result.result === "ok"
          ? "Image deleted successfully"
          : "Failed to delete image",
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
