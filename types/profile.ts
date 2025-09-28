// types/profile.ts
import { z } from "zod";
import {
  locationSchema,
  personalDetailsSchema,
  primarySportSchema,
  geolocationSchema,
  completeProfileSchema,
} from "@/lib/validations";

// Form data types
export interface ProfileFormData {
  // Location
  city: string;
  country: string;
  state: string;

  // Personal details
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bio: string;

  // Image handling
  imageFile?: File;
  imageUrl: string;
  imageUploadState: ImageUploadStateType;
  imageUploadProgress: number;
  cloudinaryPublicId?: string;

  // Sport
  primarySport: string;

  // Geolocation
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;

  // Submission state
  isSubmitting: boolean;
}

// Wizard step types
export interface WizardStep {
  id: number;
  title: string;
  isCompleted: boolean;
  isValid: boolean;
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

// Image upload states
export type ImageUploadStateType = "idle" | "uploading" | "success" | "error";

// Image upload state
export interface ImageUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadId?: string;
}

// Cloudinary response types
export interface CloudinaryUploadResponse {
  success: boolean;
  data?: {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
  };
  error?: string;
}

export interface UploadImageResponse {
  success: boolean;
  data?: {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
  };
  error?: string;
}

// Profile wizard store type
export interface ProfileWizardStore {
  // State
  formData: ProfileFormData;
  currentStep: number;
  steps: WizardStep[];
  errors: ValidationError[];
  imageUploadState: ImageUploadState;

  // Actions
  setFormData: (data: Partial<ProfileFormData>) => void;
  setCurrentStep: (step: number) => void;
  setStepValid: (step: number, isValid: boolean) => void;
  setStepCompleted: (step: number, isCompleted: boolean) => void;
  addError: (error: ValidationError) => void;
  clearErrors: (field?: string) => void;
  resetWizard: () => void;

  // Image upload actions
  setImageUploadState: (state: Partial<ImageUploadState>) => void;
  uploadImageToCloudinary: (file: File) => Promise<CloudinaryUploadResponse>;
  clearImageUpload: () => void;
  submitProfile: () => Promise<boolean>;
}

// Default image validation constants
export const DEFAULT_IMAGE_VALIDATION = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedFormats: ["jpeg", "jpg", "png", "webp"] as const,
  minWidth: 100,
  minHeight: 100,
  maxWidth: 2048,
  maxHeight: 2048,
};

// Validation schema types
export type LocationFormData = z.infer<typeof locationSchema>;
export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;
export type PrimarySportFormData = z.infer<typeof primarySportSchema>;
export type GeolocationFormData = z.infer<typeof geolocationSchema>;
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;
