// lib/utils/profile-review.ts

import { useMemo } from "react";
import { calculateAge } from "@/lib/validations";
import type { ProfileFormData, WizardStep } from "@/types/profile";

/**
 * =============================================================================
 * PROFILE REVIEW UTILITIES & VALIDATION
 * =============================================================================
 */

/**
 * Profile validation hook for review step
 */
export const useProfileValidation = (
  formData: ProfileFormData,
  steps: readonly WizardStep[]
) => {
  const allStepsValid = useMemo(
    () => steps.slice(0, 4).every((step) => step.isValid),
    [steps]
  );

  const userAge = useMemo(
    () => (formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null),
    [formData.dateOfBirth]
  );

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // Validate location data
    if (!formData.city || !formData.country || !formData.state) {
      errors.push("Location information is incomplete");
    }

    // Validate personal details
    if (!formData.dateOfBirth || !formData.gender || !formData.bio) {
      errors.push("Personal details are incomplete");
    }

    // Validate username and names
    if (!formData.username || !formData.firstName || !formData.lastName) {
      errors.push("Name information is incomplete");
    }

    // Validate primary sport
    if (!formData.primarySport) {
      errors.push("Primary sport is not selected");
    }

    // Age validation
    if (userAge !== null && userAge < 13) {
      errors.push("You must be at least 13 years old to create a profile");
    }

    return errors;
  }, [formData, userAge]);

  return {
    allStepsValid,
    validationErrors,
    userAge,
  };
};

/**
 * Validates all steps for submission
 */
export const validateAllSteps = (
  formData: ProfileFormData,
  steps: readonly WizardStep[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check step validity
  const invalidSteps = steps.slice(0, 4).filter((step) => !step.isValid);
  if (invalidSteps.length > 0) {
    errors.push(
      `Steps ${invalidSteps.map((s) => s.id).join(", ")} are incomplete`
    );
  }

  // Validate required fields
  const requiredFields = [
    { field: formData.city, name: "City" },
    { field: formData.country, name: "Country" },
    { field: formData.state, name: "State" },
    { field: formData.username, name: "Username" },
    { field: formData.firstName, name: "First Name" },
    { field: formData.lastName, name: "Last Name" },
    { field: formData.dateOfBirth, name: "Date of Birth" },
    { field: formData.gender, name: "Gender" },
    { field: formData.bio, name: "Bio" },
    { field: formData.primarySport, name: "Primary Sport" },
  ];

  const missingFields = requiredFields
    .filter(({ field }) => !field || field.trim() === "")
    .map(({ name }) => name);

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Profile validation rules
 */
export const PROFILE_VALIDATION_RULES = {
  MIN_AGE: 13,
  MAX_BIO_LENGTH: 500,
  MIN_BIO_LENGTH: 10,
  REQUIRED_FIELDS: [
    "city",
    "country",
    "state",
    "username",
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "bio",
    "primarySport",
  ],
} as const;

/**
 * Gets sport icon by name with fallback
 */
export const getSportIcon = (sportName: string): string => {
  const sportIcons: Record<string, string> = {
    Soccer: "⚽",
    Basketball: "🏀",
    Football: "🏈",
    Baseball: "⚾",
    Tennis: "🎾",
    Swimming: "🏊",
    Running: "🏃",
    Cycling: "🚴",
    Golf: "⛳",
    Volleyball: "🏐",
  };

  return sportIcons[sportName] || "🏆";
};

/**
 * Formats profile data for display
 */
export const formatProfileDisplay = {
  location: (city: string, state: string, country: string) => {
    const parts = [city, state, country].filter(Boolean);
    return parts.join(", ");
  },

  coordinates: (lat: number, lon: number) => {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  },

  dateOfBirth: (dateString: string, age: number | null) => {
    const date = new Date(dateString).toLocaleDateString();
    return age ? `${date} (Age: ${age})` : date;
  },

  gender: (gender: string) => {
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  },
};
