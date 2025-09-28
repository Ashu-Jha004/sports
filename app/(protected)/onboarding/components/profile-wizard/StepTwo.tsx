"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFormData,
  useErrors,
  useSetFormData,
  useSetStepValid,
  useSetStepCompleted,
  useClearErrors,
  useAddError,
  useImageUploadState,
  useUploadImageToCloudinary,
  useClearImageUpload,
} from "@/store/profileWizardStore";
import {
  frontendPersonalDetailsSchema,
  mapGenderToDatabase,
  mapGenderFromDatabase,
} from "@/lib/validations";
import { sanitizeInput, getFieldError, calculateAge } from "@/lib/validations";
import { DEFAULT_IMAGE_VALIDATION } from "@/types/profile";
import {
  UserIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

interface PersonalDetailsFormData {
  dateOfBirth: string;
  gender: "male" | "female" | "";
  bio: string;
  username: string;
  firstName: string;
  lastName: string;
}

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export const StepTwo: React.FC = () => {
  const formData = useFormData();
  const storeErrors = useErrors();
  const setFormData = useSetFormData();
  const setStepValid = useSetStepValid();
  const setStepCompleted = useSetStepCompleted();
  const clearErrors = useClearErrors();
  const addError = useAddError();

  const imageUploadState = useImageUploadState();
  const uploadImageToCloudinary = useUploadImageToCloudinary();
  const clearImageUpload = useClearImageUpload();

  const [isValidating, setIsValidating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // SIMPLIFIED: Use frontend schema directly
  const {
    control,
    watch,
    formState: { errors, isValid, isDirty },
    setValue,
    trigger,
  } = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(frontendPersonalDetailsSchema),
    defaultValues: {
      dateOfBirth: formData.dateOfBirth || "",
      gender: mapGenderFromDatabase(formData.gender as any) || "",
      bio: formData.bio || "",
      username: formData.username || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  // Calculate age from date of birth
  const userAge = watchedValues.dateOfBirth
    ? calculateAge(watchedValues.dateOfBirth)
    : null;

  // SIMPLIFIED: Step validation logic
  const validateStep = useCallback(async () => {
    if (isValidating) return;

    setIsValidating(true);
    try {
      const isFormValid = await trigger();
      const isUploadComplete = formData.imageUploadState !== "uploading";

      // Step is valid if form is valid, dirty, and no upload is in progress
      const stepValid = isFormValid && isDirty && isUploadComplete;

      setStepValid(2, stepValid);
      setStepCompleted(2, stepValid);

      // Clear validation errors if form is valid
      if (isFormValid) {
        [
          "dateOfBirth",
          "gender",
          "bio",
          "username",
          "firstName",
          "lastName",
        ].forEach((field) => clearErrors(field));
      }
    } finally {
      setIsValidating(false);
    }
  }, [
    trigger,
    isDirty,
    formData.imageUploadState,
    setStepValid,
    setStepCompleted,
    clearErrors,
    isValidating,
  ]);

  // Watch for form changes and update store
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      validateStep();

      // Convert frontend gender to database format before storing
      const genderForDB = watchedValues.gender
        ? mapGenderToDatabase(watchedValues.gender)
        : "";

      setFormData({
        dateOfBirth: watchedValues.dateOfBirth,
        gender: genderForDB || "",
        bio: sanitizeInput(watchedValues.bio),
        username: sanitizeInput(watchedValues.username),
        firstName: sanitizeInput(watchedValues.firstName),
        lastName: sanitizeInput(watchedValues.lastName),
      });
    }, 300); // Reduced timeout for better responsiveness

    return () => clearTimeout(timeoutId);
  }, [watchedValues, isDirty, validateStep, setFormData]);

  // File validation function
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > DEFAULT_IMAGE_VALIDATION.maxSizeBytes) {
      return {
        isValid: false,
        error: `File size must be less than ${
          DEFAULT_IMAGE_VALIDATION.maxSizeBytes / (1024 * 1024)
        }MB`,
      };
    }

    const fileExtension = file.name.toLowerCase().split(".").pop();
    if (
      !fileExtension ||
      !DEFAULT_IMAGE_VALIDATION.allowedFormats.includes(fileExtension as any)
    ) {
      return {
        isValid: false,
        error: `File must be one of: ${DEFAULT_IMAGE_VALIDATION.allowedFormats.join(
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

  // Image selection handler
  const handleImageSelect = useCallback(
    async (file: File) => {
      try {
        const validation = validateFile(file);
        if (!validation.isValid) {
          addError({ field: "imageFile", message: validation.error! });
          return;
        }

        clearErrors("imageFile");
        clearErrors("imageUpload");
        setSelectedFile(file);

        const uploadResult = await uploadImageToCloudinary(file);

        if (uploadResult.success) {
          setSelectedFile(null);
        } else {
          setSelectedFile(null);
        }
      } catch (error) {
        setSelectedFile(null);
        addError({
          field: "imageFile",
          message:
            error instanceof Error ? error.message : "Failed to process image",
        });
      }
    },
    [uploadImageToCloudinary, addError, clearErrors]
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

  const handleRemoveImage = useCallback(() => {
    clearImageUpload();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearImageUpload]);

  const getInputClasses = useCallback(
    (fieldName: keyof PersonalDetailsFormData, hasError: boolean) => {
      const baseClasses =
        "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500";

      if (hasError) {
        return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`;
      }

      if (watchedValues[fieldName] && !hasError) {
        return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50`;
      }

      return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white`;
    },
    [watchedValues]
  );

  const getMaxDate = useCallback(() => {
    const today = new Date();
    const thirteenYearsAgo = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate()
    );
    return thirteenYearsAgo.toISOString().split("T")[0];
  }, []);

  const getMinDate = useCallback(() => {
    const today = new Date();
    const hundredYearsAgo = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    );
    return hundredYearsAgo.toISOString().split("T")[0];
  }, []);

  // Render upload state
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
            onClick={handleRemoveImage}
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
          {DEFAULT_IMAGE_VALIDATION.maxSizeBytes / (1024 * 1024)}MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={DEFAULT_IMAGE_VALIDATION.allowedFormats
            .map((format) => `image/${format}`)
            .join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Tell us about yourself
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Share your personal details to create a complete profile
          </p>
        </div>

        <form className="space-y-6" noValidate>
          {/* Profile Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Profile Image (Optional)
            </label>
            {renderUploadState()}
            {(getFieldError(storeErrors, "imageFile") ||
              getFieldError(storeErrors, "imageUpload")) && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>
                  {getFieldError(storeErrors, "imageFile") ||
                    getFieldError(storeErrors, "imageUpload")}
                </span>
              </div>
            )}
            {formData.imageUploadState === "success" && formData.imageUrl && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Image uploaded successfully to cloud storage</span>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700"
              >
                Username *
              </label>
              <div className="relative">
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="username"
                      placeholder="Choose a username"
                      className={getInputClasses("username", !!errors.username)}
                      autoComplete="username"
                      maxLength={130}
                    />
                  )}
                />
                {watchedValues.username && !errors.username && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.username && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{errors.username.message}</span>
                </div>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold text-gray-700"
              >
                First Name *
              </label>
              <div className="relative">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="firstName"
                      placeholder="Your first name"
                      className={getInputClasses(
                        "firstName",
                        !!errors.firstName
                      )}
                      autoComplete="given-name"
                      maxLength={150}
                    />
                  )}
                />
                {watchedValues.firstName && !errors.firstName && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.firstName && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{errors.firstName.message}</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-semibold text-gray-700"
              >
                Last Name *
              </label>
              <div className="relative">
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="lastName"
                      placeholder="Your last name"
                      className={getInputClasses("lastName", !!errors.lastName)}
                      autoComplete="family-name"
                      maxLength={50}
                    />
                  )}
                />
                {watchedValues.lastName && !errors.lastName && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.lastName && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{errors.lastName.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-semibold text-gray-700"
            >
              Date of Birth *
            </label>
            <div className="relative">
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    id="dateOfBirth"
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={getInputClasses(
                      "dateOfBirth",
                      !!errors.dateOfBirth
                    )}
                    autoComplete="bday"
                  />
                )}
              />
              {watchedValues.dateOfBirth && !errors.dateOfBirth && (
                <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {userAge !== null && (
              <p className="text-sm text-gray-600">Age: {userAge} years old</p>
            )}
            {errors.dateOfBirth && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{errors.dateOfBirth.message}</span>
              </div>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Gender *
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        field.value === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        {...field}
                        value={option.value}
                        checked={field.value === option.value}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      {field.value === option.value && (
                        <CheckCircleIcon className="absolute right-2 w-4 h-4 text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.gender && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{errors.gender.message}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="block text-sm font-semibold text-gray-700"
            >
              Bio *
            </label>
            <div className="relative">
              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="bio"
                    rows={4}
                    placeholder="Tell us about yourself, your athletic interests, goals, and what motivates you..."
                    className={getInputClasses("bio", !!errors.bio)}
                    maxLength={500}
                  />
                )}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {watchedValues.bio?.length || 0}/500
              </div>
            </div>
            {errors.bio && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{errors.bio.message}</span>
              </div>
            )}
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Validating...</span>
            </div>
          )}

          {/* Success Message */}
          {isValid &&
            isDirty &&
            !isValidating &&
            !imageUploadState.isUploading && (
              <div className="flex items-center justify-center py-2 text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  Personal details are complete!
                </span>
              </div>
            )}
        </form>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-semibold text-green-800 mb-2">
            Privacy & Security
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Your personal information is encrypted and secure</li>
            <li>• Images are stored securely in cloud storage</li>
            <li>• You control who sees your profile information</li>
            <li>• Profile images are automatically optimized</li>
            <li>• Your data is never shared without permission</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
