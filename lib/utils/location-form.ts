// lib/utils/location-form.ts

import { useCallback } from "react";

/**
 * =============================================================================
 * LOCATION FORM UTILITIES & HELPERS
 * =============================================================================
 */

/**
 * Parameters for form validation hook
 */
interface FormValidationParams {
  readonly stepNumber: number;
  readonly setIsValidating?: (value: boolean) => void;
  readonly setStepValid: (step: number, isValid: boolean) => void;
  readonly setStepCompleted: (step: number, isCompleted: boolean) => void;
  readonly clearErrors: (field?: string) => void;
  readonly setFormData: (data: any) => void;
  readonly sanitizeInput: (input: string) => string;
}

/**
 * Custom hook for form validation logic
 * Provides reusable validation and data update functions
 */
export const useFormValidation = ({
  stepNumber,
  setIsValidating,
  setStepValid,
  setStepCompleted,
  clearErrors,
  setFormData,
  sanitizeInput,
}: FormValidationParams) => {
  /**
   * Validates the current step with proper error handling
   */
  const validateStep = useCallback(
    async (isValid: boolean, trigger: () => Promise<boolean>) => {
      if (setIsValidating) setIsValidating(true);

      try {
        const isFormValid = await trigger();
        const stepValid = isFormValid && isValid;

        setStepValid(stepNumber, stepValid);
        setStepCompleted(stepNumber, stepValid);

        if (isFormValid) {
          // Clear field-specific errors for location form
          clearErrors("city");
          clearErrors("country");
          clearErrors("state");
        }
      } catch (error) {
        console.error(`Step ${stepNumber} validation error:`, error);
        setStepValid(stepNumber, false);
        setStepCompleted(stepNumber, false);
      } finally {
        if (setIsValidating) setIsValidating(false);
      }
    },
    [stepNumber, setStepValid, setStepCompleted, clearErrors, setIsValidating]
  );

  /**
   * Updates form data with sanitized values
   */
  const updateFormData = useCallback(
    (values: Record<string, any>) => {
      const sanitizedData: Record<string, string> = {};

      // Sanitize each field value
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === "string") {
          sanitizedData[key] = sanitizeInput(values[key]);
        }
      });

      setFormData(sanitizedData);
    },
    [setFormData, sanitizeInput]
  );

  return { validateStep, updateFormData };
};

/**
 * Sanitizes location input data
 * Removes dangerous characters and trims whitespace
 */
export const sanitizeLocationInput = (input: string): string => {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential XSS characters
    .replace(/\s+/g, " "); // Normalize whitespace
};

/**
 * Location help information for user education
 */
export const LOCATION_HELP_INFO = [
  "Find athletes and events near you",
  "Customize content based on your region",
  "Connect you with local sports communities",
  "Show relevant weather and venue information",
] as const;

/**
 * Validation constants for location fields
 */
export const LOCATION_VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  ALLOWED_PATTERN: /^[a-zA-Z\s'-]+$/,
} as const;

/**
 * Validates location field input
 */
export const validateLocationField = (
  value: string,
  fieldName: string
): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }

  if (value.length < LOCATION_VALIDATION.MIN_LENGTH) {
    return `${fieldName} must be at least ${LOCATION_VALIDATION.MIN_LENGTH} characters`;
  }

  if (value.length > LOCATION_VALIDATION.MAX_LENGTH) {
    return `${fieldName} must be less than ${LOCATION_VALIDATION.MAX_LENGTH} characters`;
  }

  if (!LOCATION_VALIDATION.ALLOWED_PATTERN.test(value)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }

  return null;
};

/**
 * Helper to format location display name
 */
export const formatLocationDisplay = (
  city: string,
  state: string,
  country: string
): string => {
  const parts = [city, state, country].filter((part) => part && part.trim());
  return parts.join(", ");
};
