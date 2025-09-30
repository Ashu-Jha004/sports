// lib/validations.ts
import { z } from "zod";

// Location validation schema (Step 1)
export const locationSchema = z.object({
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "City can only contain letters, spaces, hyphens, and apostrophes"
    ),

  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Country can only contain letters, spaces, hyphens, and apostrophes"
    ),

  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "State can only contain letters, spaces, hyphens, and apostrophes"
    ),
});

// Backend validation schema (for API endpoints)
export const personalDetailsSchema = z.object({
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 13;
      }
      return age >= 13;
    }, "You must be at least 13 years old")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, "Date of birth cannot be in the future"),

  gender: z
    .enum(["MALE", "FEMALE"], {
      message: "Please select a valid gender option",
    })
    .optional(),

  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters")
    .refine(
      (bio) => bio.trim().length >= 10,
      "Bio must contain at least 10 non-whitespace characters"
    ),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(130, "Username must be less than 130 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  firstName: z
    .string()
    .min(1, "First name is required")
    .max(150, "First name must be less than 150 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
});

// NEW: Frontend validation schema (for form validation)
export const frontendPersonalDetailsSchema = z.object({
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 13;
      }
      return age >= 13;
    }, "You must be at least 13 years old")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, "Date of birth cannot be in the future"),

  // Frontend uses lowercase values
  gender: z
    .enum(["MALE", "FEMALE"], {
      message: "Please select a valid gender option",
    })
    .optional(),

  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters")
    .refine(
      (bio) => bio.trim().length >= 10,
      "Bio must contain at least 10 non-whitespace characters"
    ),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(130, "Username must be less than 130 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  firstName: z
    .string()
    .min(1, "First name is required")
    .max(150, "First name must be less than 150 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
});

// Primary sport validation schema (Step 3)
export const primarySportSchema = z.object({
  primarySport: z
    .string()
    .min(1, "Please select a primary sport")
    .max(50, "Sport name is too long"),
});

// Geolocation validation schema (Step 4)
export const geolocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .optional(),

  longitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .optional(),

  locationAccuracy: z.number().min(0, "Invalid accuracy value").optional(),
});

// Complete profile validation schema (Step 5)
export const completeProfileSchema = z.object({
  city: locationSchema.shape.city,
  country: locationSchema.shape.country,
  state: locationSchema.shape.state,
  dateOfBirth: personalDetailsSchema.shape.dateOfBirth,
  gender: personalDetailsSchema.shape.gender,
  bio: personalDetailsSchema.shape.bio,
  username: personalDetailsSchema.shape.username,
  firstName: personalDetailsSchema.shape.firstName,
  lastName: personalDetailsSchema.shape.lastName,
  primarySport: primarySportSchema.shape.primarySport,
  latitude: geolocationSchema.shape.latitude,
  longitude: geolocationSchema.shape.longitude,
  locationAccuracy: geolocationSchema.shape.locationAccuracy,
  imageUrl: z.string().url().optional(),
});

// Image upload validation
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type
        ),
      "Only JPEG, PNG, and WebP files are allowed"
    ),
});

// Validation helper functions
export const validateStep = (step: number, data: any) => {
  try {
    switch (step) {
      case 1:
        locationSchema.parse(data);
        return { isValid: true, errors: [] };

      case 2:
        personalDetailsSchema.parse(data);
        return { isValid: true, errors: [] };

      case 3:
        primarySportSchema.parse(data);
        return { isValid: true, errors: [] };

      case 4:
        geolocationSchema.parse(data);
        return { isValid: true, errors: [] };

      case 5:
        completeProfileSchema.parse(data);
        return { isValid: true, errors: [] };

      default:
        return {
          isValid: false,
          errors: [{ field: "step", message: "Invalid step number" }],
        };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return { isValid: false, errors };
    }

    return {
      isValid: false,
      errors: [{ field: "unknown", message: "Validation failed" }],
    };
  }
};

// Get validation schema for specific step
export const getStepSchema = (step: number) => {
  switch (step) {
    case 1:
      return locationSchema;
    case 2:
      return personalDetailsSchema;
    case 3:
      return primarySportSchema;
    case 4:
      return geolocationSchema;
    case 5:
      return completeProfileSchema;
    default:
      throw new Error("Invalid step number");
  }
};

// Check if all required fields are filled for a step
export const isStepComplete = (step: number, data: any): boolean => {
  try {
    const schema = getStepSchema(step);
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
};

// Get field-specific error message
export const getFieldError = (
  errors: Array<{ field: string; message: string }>,
  fieldName: string
): string | undefined => {
  const error = errors.find((err) => err.field === fieldName);
  return error?.message;
};

// Sanitize input data
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

// Age calculation helper
export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Sports list for validation
export const AVAILABLE_SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Soccer",
  "Baseball",
  "Golf",
  "Swimming",
  "Running",
  "Cycling",
  "Volleyball",
  "Cricket",
  "Rugby",
  "Hockey",
  "Boxing",
  "Wrestling",
  "Track and Field",
  "Gymnastics",
  "Martial Arts",
  "Rock Climbing",
  "Surfing",
  "Skiing",
  "Snowboarding",
  "Other",
] as const;

export type SportType = (typeof AVAILABLE_SPORTS)[number];

// Helper function to convert frontend gender values to database enum
export const mapGenderToDatabase = (
  frontendGender: string
): "MALE" | "FEMALE" => {
  const genderMap: Record<string, "MALE" | "FEMALE"> = {
    male: "MALE",
    female: "FEMALE",
  };
  return genderMap[frontendGender.toLowerCase()];
};

// Helper function to convert database gender values to frontend
export const mapGenderFromDatabase = (
  dbGender: "MALE" | "FEMALE" | ""
): "MALE" | "FEMALE" | "" => {
  if (!dbGender) return "";
  return dbGender.toLowerCase() as "MALE" | "FEMALE";
};
