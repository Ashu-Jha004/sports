// types/profile.ts
import { z } from "zod";
import {
  locationSchema,
  personalDetailsSchema,
  primarySportSchema,
  geolocationSchema,
  completeProfileSchema,
} from "@/lib/validations";

/**
 * =============================================================================
 * CORE PROFILE TYPES & INTERFACES
 * =============================================================================
 */

/**
 * Represents the state of image upload operations
 */
export type ImageUploadStateType = "idle" | "uploading" | "success" | "error";

/**
 * Main form data interface for the profile wizard
 * Contains all user input data across all steps
 */
export interface ProfileFormData {
  /** Location Information (Step 1) */
  readonly city: string;
  readonly country: string;
  readonly state: string;

  /** Personal Details (Step 2) */
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string;
  readonly gender: string;
  readonly bio: string;

  /** Image Upload Handling */
  readonly imageFile?: File;
  readonly imageUrl: string;
  readonly imageUploadState: ImageUploadStateType;
  readonly imageUploadProgress: number;
  readonly cloudinaryPublicId?: string;

  /** Sport Selection (Step 3) */
  readonly primarySport: string;

  /** Geolocation Data (Step 4) */
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;

  /** Form State Management */
  readonly isSubmitting: boolean;
}

/**
 * =============================================================================
 * WIZARD STEP MANAGEMENT
 * =============================================================================
 */

/**
 * Represents a single step in the profile wizard
 */
export interface WizardStep {
  /** Unique step identifier (1-5) */
  readonly id: number;
  /** Display title for the step */
  readonly title: string;
  /** Whether the step has been completed successfully */
  readonly isCompleted: boolean;
  /** Whether the step's form data is valid */
  readonly isValid: boolean;
}

/**
 * Configuration options for the profile wizard
 */
export interface WizardConfig {
  /** Whether to show the wizard header */
  readonly showHeader?: boolean;
  /** Allow users to skip to any step */
  readonly allowStepSkipping?: boolean;
  /** Automatically save progress */
  readonly autoSave?: boolean;
  /** When to trigger validation */
  readonly validationMode?: "onChange" | "onBlur" | "onSubmit";
  /** Visual theme for the wizard */
  readonly theme?: "default" | "minimal" | "branded";
}

/**
 * =============================================================================
 * ERROR HANDLING & VALIDATION
 * =============================================================================
 */

/**
 * Represents a validation error with field context
 */
export interface ValidationError {
  /** The field that has the error */
  readonly field: string;
  /** Human-readable error message */
  readonly message: string;
  /** Optional error code for programmatic handling */
  readonly code?: string;
}

/**
 * =============================================================================
 * IMAGE UPLOAD MANAGEMENT
 * =============================================================================
 */

/**
 * Detailed state for image upload operations
 */
export interface ImageUploadState {
  /** Whether an upload is currently in progress */
  readonly isUploading: boolean;
  /** Upload progress percentage (0-100) */
  readonly progress: number;
  /** Error message if upload failed */
  readonly error: string | null;
  /** Unique identifier for the upload operation */
  readonly uploadId?: string;
}

/**
 * Response from Cloudinary upload operations
 */
export interface CloudinaryUploadResponse {
  readonly success: boolean;
  readonly data?: {
    readonly secure_url: string;
    readonly public_id: string;
    readonly width: number;
    readonly height: number;
    readonly format: string;
    readonly resource_type: string;
  };
  readonly error?: string;
}

/**
 * Generic upload response interface
 * @deprecated Use CloudinaryUploadResponse for consistency
 */
export interface UploadImageResponse extends CloudinaryUploadResponse {}

/**
 * =============================================================================
 * STORE MANAGEMENT
 * =============================================================================
 */

/**
 * Complete interface for the profile wizard Zustand store
 * Manages all state and actions for the profile creation process
 */
export interface ProfileWizardStore {
  /** Current form data state */
  readonly formData: ProfileFormData;
  /** Currently active step (1-5) */
  readonly currentStep: number;
  /** Array of all wizard steps with their status */
  readonly steps: readonly WizardStep[];
  /** Current validation errors */
  readonly errors: ValidationError[];
  /** Current image upload state */
  readonly imageUploadState: ImageUploadState;

  /** Form data mutation actions */
  setFormData: (data: Partial<ProfileFormData>) => void;

  /** Step navigation actions */
  setCurrentStep: (step: number) => void;
  setStepValid: (step: number, isValid: boolean) => void;
  setStepCompleted: (step: number, isCompleted: boolean) => void;

  /** Error management actions */
  addError: (error: ValidationError) => void;
  clearErrors: (field?: string) => void;

  /** Wizard reset action */
  resetWizard: () => void;

  /** Image upload actions */
  setImageUploadState: (state: Partial<ImageUploadState>) => void;
  uploadImageToCloudinary: (file: File) => Promise<CloudinaryUploadResponse>;
  clearImageUpload: () => void;

  /** Profile submission action */
  submitProfile: () => Promise<boolean>;
}

/**
 * =============================================================================
 * VALIDATION CONSTANTS & CONFIGURATION
 * =============================================================================
 */

/**
 * Image validation configuration
 * Centralized settings for file upload validation
 */
export const IMAGE_VALIDATION_CONFIG = {
  /** Maximum file size in bytes (5MB) */
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  /** Allowed file formats */
  ALLOWED_FORMATS: ["jpeg", "jpg", "png", "webp"] as const,
  /** Minimum image dimensions */
  MIN_WIDTH: 100,
  MIN_HEIGHT: 100,
  /** Maximum image dimensions */
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
} as const;

/**
 * @deprecated Use IMAGE_VALIDATION_CONFIG for consistency
 */
export const DEFAULT_IMAGE_VALIDATION = IMAGE_VALIDATION_CONFIG;

/**
 * Default wizard configuration
 */
export const DEFAULT_WIZARD_CONFIG: WizardConfig = {
  showHeader: true,
  allowStepSkipping: false,
  autoSave: true,
  validationMode: "onChange",
  theme: "default",
} as const;

/**
 * =============================================================================
 * ZOD SCHEMA INFERENCE TYPES
 * =============================================================================
 */

/** Type inference for location form data */
export type LocationFormData = z.infer<typeof locationSchema>;

/** Type inference for personal details form data */
export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

/** Type inference for primary sport form data */
export type PrimarySportFormData = z.infer<typeof primarySportSchema>;

/** Type inference for geolocation form data */
export type GeolocationFormData = z.infer<typeof geolocationSchema>;

/** Type inference for complete profile form data */
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

/**
 * =============================================================================
 * TYPE GUARDS & UTILITIES
 * =============================================================================
 */

/**
 * Type guard to check if an upload state indicates completion
 */
export const isUploadComplete = (state: ImageUploadStateType): boolean => {
  return state === "success" || state === "error";
};

/**
 * Type guard to check if an upload state indicates an active operation
 */
export const isUploadActive = (state: ImageUploadStateType): boolean => {
  return state === "uploading";
};

/**
 * Utility type for partial profile updates
 */
export type PartialProfileFormData = Partial<ProfileFormData>;

/**
 * Utility type for wizard step IDs
 */
export type WizardStepId = 1 | 2 | 3 | 4 | 5;

/**
 * =============================================================================
 * EXPORTS
 * =============================================================================
 */
