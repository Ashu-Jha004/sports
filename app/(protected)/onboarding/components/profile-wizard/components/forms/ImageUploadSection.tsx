// onboarding/components/profile-wizard/components/forms/ImageUploadSection.tsx
"use client";

import React, { useRef, useCallback } from "react";
import {
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { IMAGE_VALIDATION_CONFIG } from "@/types/profile";
import { validateImageFile } from "@/lib/utils/image-validation";
import type {
  ImageUploadState,
  ValidationError,
  ProfileFormData,
} from "@/types/profile";

interface ImageUploadSectionProps {
  readonly imageUploadState: ImageUploadState;
  readonly formData: ProfileFormData;
  readonly storeErrors: ValidationError[];
  readonly onImageSelect: (file: File) => Promise<any>;
  readonly onImageClear: () => void;
  readonly addError: (error: ValidationError) => void;
  readonly clearErrors: (field: string) => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  imageUploadState,
  formData,
  storeErrors,
  onImageSelect,
  onImageClear,
  addError,
  clearErrors,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleImageSelect = useCallback(
    async (file: File) => {
      try {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          addError({ field: "imageFile", message: validation.error! });
          return;
        }

        clearErrors("imageFile");
        clearErrors("imageUpload");
        await onImageSelect(file);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process image";
        addError({ field: "imageFile", message: errorMessage });
      }
    },
    [onImageSelect, addError, clearErrors]
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const renderUploadState = () => {
    const { isUploading, progress, error } = imageUploadState;
    const { imageUploadState: uploadState, imageUrl } = formData;

    if (uploadState === "success" && imageUrl) {
      return (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Profile preview"
            className="w-32 h-32 object-cover rounded-full border-4 border-green-200 shadow-lg"
          />
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
            <CheckBadgeIcon className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onImageClear}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            aria-label="Remove image"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (isUploading || uploadState === "uploading") {
      return (
        <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-6 text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <div className="space-y-3">
            <p className="text-blue-800 font-medium">Uploading to cloud...</p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-blue-600 text-sm">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>
      );
    }

    if (uploadState === "error" || error) {
      return (
        <div className="border-2 border-red-300 bg-red-50 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-800 font-medium mb-2">Upload Failed</p>
          <p className="text-red-600 text-sm mb-4">
            {error || "Please try again"}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-red-600 hover:text-red-700 font-medium text-sm underline"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium text-blue-600">Click to upload</span> or
          drag and drop
        </p>
        <p className="text-xs text-gray-500">
          PNG, JPG, WebP up to{" "}
          {IMAGE_VALIDATION_CONFIG.MAX_SIZE_BYTES / (1024 * 1024)}MB
        </p>
        <input
          title="Image Upload Input"
          ref={fileInputRef}
          type="file"
          accept={IMAGE_VALIDATION_CONFIG.ALLOWED_FORMATS.map(
            (f) => `image/${f}`
          ).join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  };

  const getFieldError = (field: string) => {
    return storeErrors.find((err) => err.field === field)?.message;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Profile Image (Optional)
      </label>
      {renderUploadState()}

      {/* Error Messages */}
      {(getFieldError("imageFile") || getFieldError("imageUpload")) && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>
            {getFieldError("imageFile") || getFieldError("imageUpload")}
          </span>
        </div>
      )}

      {/* Success Message */}
      {formData.imageUploadState === "success" && formData.imageUrl && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircleIcon className="w-4 h-4" />
          <span>Image uploaded successfully to cloud storage</span>
        </div>
      )}
    </div>
  );
};
