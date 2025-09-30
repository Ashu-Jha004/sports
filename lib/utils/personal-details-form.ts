// lib/utils/personal-details-form.ts

import { useCallback } from "react";
import { calculateAge } from "@/lib/validations";

/**
 * Personal details form validation hook
 */
export const usePersonalDetailsValidation = ({
  stepNumber,
  setIsValidating,
  setStepValid,
  setStepCompleted,
  clearErrors,
  setFormData,
  imageUploadState,
  sanitizeInput,
  mapGenderToDatabase,
}: any) => {
  const validateStep = useCallback(
    async (isValid: boolean, trigger: any) => {
      if (setIsValidating) setIsValidating(true);

      try {
        const isFormValid = await trigger();
        const isUploadComplete = imageUploadState !== "uploading";
        const stepValid = isFormValid && isUploadComplete;

        setStepValid(stepNumber, stepValid);
        setStepCompleted(stepNumber, stepValid);

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
        if (setIsValidating) setIsValidating(false);
      }
    },
    [
      stepNumber,
      imageUploadState,
      setStepValid,
      setStepCompleted,
      clearErrors,
      setIsValidating,
    ]
  );

  const updateFormData = useCallback(
    (values: any) => {
      const genderForDB = values.gender
        ? mapGenderToDatabase(values.gender)
        : "";

      setFormData({
        dateOfBirth: values.dateOfBirth,
        gender: genderForDB || "",
        bio: sanitizeInput(values.bio),
        username: sanitizeInput(values.username),
        firstName: sanitizeInput(values.firstName),
        lastName: sanitizeInput(values.lastName),
      });
    },
    [setFormData, sanitizeInput, mapGenderToDatabase]
  );

  return { validateStep, updateFormData };
};

/**
 * Sanitizes personal details input
 */
export const sanitizePersonalInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Privacy and security help information
 */
export const PERSONAL_DETAILS_HELP_INFO = [
  "Your personal information is encrypted and secure",
  "Images are stored securely in cloud storage",
  "You control who sees your profile information",
  "Profile images are automatically optimized",
  "Your data is never shared without permission",
] as const;
