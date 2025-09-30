// lib/api/schemas/profile-schemas.ts
import { z } from "zod";

/**
 * =============================================================================
 * API PROFILE SCHEMAS
 * =============================================================================
 */

/**
 * Profile creation schema matching wizard data
 */
export const profileCreateSchema = z.object({
  // Location data
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().min(1, "State is required").max(100),

  // User identification
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(130),
  firstName: z.string().min(1, "First name is required").max(150),
  lastName: z.string().min(1, "Last name is required").max(50),

  // Personal details
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  }, "You must be between 13 and 120 years old"),

  gender: z.enum(["MALE", "FEMALE"]).optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500),

  // Image data
  profileImageUrl: z.string().url().optional(),
  profileImagePublicId: z.string().optional(),

  // Sport information
  primarySport: z.string().min(1, "Primary sport is required"),

  // Geolocation data (optional)
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationAccuracy: z.number().min(0).optional(),
});

/**
 * Profile update schema (all fields optional)
 */
export const profileUpdateSchema = profileCreateSchema.partial();

export type ProfileCreateData = z.infer<typeof profileCreateSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
