// lib/utils/image-validation.ts

import { IMAGE_VALIDATION_CONFIG } from "@/types/profile";

/**
 * Image validation result interface
 */
interface ValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

/**
 * Validates uploaded image file
 */
export const validateImageFile = (file: File): ValidationResult => {
  if (file.size > IMAGE_VALIDATION_CONFIG.MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size must be less than ${
        IMAGE_VALIDATION_CONFIG.MAX_SIZE_BYTES / (1024 * 1024)
      }MB`,
    };
  }

  const fileExtension = file.name.toLowerCase().split(".").pop();
  if (
    !fileExtension ||
    !IMAGE_VALIDATION_CONFIG.ALLOWED_FORMATS.includes(fileExtension as any)
  ) {
    return {
      isValid: false,
      error: `File must be one of: ${IMAGE_VALIDATION_CONFIG.ALLOWED_FORMATS.join(
        ", "
      )}`,
    };
  }

  if (!file.type.startsWith("image/")) {
    return {
      isValid: false,
      error: "File must be an image",
    };
  }

  return { isValid: true };
};
