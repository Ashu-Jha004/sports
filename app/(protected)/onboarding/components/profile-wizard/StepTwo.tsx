// onboarding/components/profile-wizard/StepTwo.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
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
} from "@/lib/validations";
import { UserIcon } from "@heroicons/react/24/outline";

import { StepContainer } from "./components/forms/StepContainer";
import { ValidationStatus } from "./components/forms/ValidationStatus";
import { ImageUploadSection } from "./components/forms/ImageUploadSection";
import { PersonalDetailsForm } from "./components/forms/PersonalDetailsForm";
import { PrivacyNotice } from "./components/forms/PrivacyNotice";

import {
  usePersonalDetailsValidation,
  sanitizePersonalInput,
  PERSONAL_DETAILS_HELP_INFO,
} from "@/lib/utils/personal-details-form";

import type { PersonalDetailsFormData } from "@/types/profile";

/**
 * =============================================================================
 * STEP TWO - PERSONAL DETAILS
 * =============================================================================
 */

export const StepTwo: React.FC = () => {
  const formData: any = useFormData();
  const storeErrors: any = useErrors();
  const setFormData: any = useSetFormData();
  const setStepValid: any = useSetStepValid();
  const setStepCompleted: any = useSetStepCompleted();
  const clearErrors: any = useClearErrors();
  const addError: any = useAddError();

  const imageUploadState: any = useImageUploadState();
  const uploadImageToCloudinary: any = useUploadImageToCloudinary();
  const clearImageUpload: any = useClearImageUpload();

  const [isValidating, setIsValidating] = useState(false);

  // Form setup with validation
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
      gender: (formData.gender === "MALE"
        ? "MALE"
        : formData.gender === "FEMALE"
        ? "FEMALE"
        : "") as "MALE" | "FEMALE",
      bio: formData.bio || "",
      username: formData.username || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  // Custom validation hook
  const { validateStep, updateFormData } = usePersonalDetailsValidation({
    stepNumber: 2,
    setIsValidating,
    setStepValid,
    setStepCompleted,
    clearErrors,
    setFormData,
    imageUploadState: formData.imageUploadState,
    sanitizeInput: sanitizePersonalInput,
    mapGenderToDatabase,
  });

  // Form change handler with validation
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      validateStep(isValid, trigger);
      updateFormData(watchedValues);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, isDirty, isValid, validateStep, updateFormData, trigger]);

  return (
    <StepContainer
      icon={<UserIcon className="w-8 h-8 text-green-600" />}
      title="Tell us about yourself"
      description="Share your personal details to create a complete profile"
    >
      <form className="space-y-6" noValidate>
        {/* Profile Image Upload */}
        <ImageUploadSection
          imageUploadState={imageUploadState}
          formData={formData}
          storeErrors={storeErrors}
          onImageSelect={uploadImageToCloudinary}
          onImageClear={clearImageUpload}
          addError={addError}
          clearErrors={clearErrors}
        />

        {/* Personal Details Form */}
        <PersonalDetailsForm
          control={control}
          errors={errors}
          storeErrors={storeErrors}
          watchedValues={watchedValues}
        />

        {/* Validation Status */}
        <ValidationStatus
          isValidating={isValidating}
          isValid={isValid && !imageUploadState.isUploading}
          isDirty={isDirty}
          successMessage="Personal details are complete!"
        />
      </form>

      {/* Privacy Notice */}
      <PrivacyNotice helpInfo={PERSONAL_DETAILS_HELP_INFO} />
    </StepContainer>
  );
};

export default StepTwo;
