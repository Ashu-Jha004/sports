// store/profileWizardStore.ts
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import {
  ProfileWizardStore,
  ProfileFormData,
  WizardStep,
  ValidationError,
  ImageUploadState,
  CloudinaryUploadResponse,
  UploadImageResponse,
  WizardStepId,
  IMAGE_VALIDATION_CONFIG,
} from "@/types/profile";
import { mapGenderToDatabase } from "@/lib/validations";

/**
 * =============================================================================
 * CONSTANTS & CONFIGURATION
 * =============================================================================
 */

/**
 * Initial form data state with proper typing
 */
const INITIAL_FORM_DATA: ProfileFormData = {
  // Location Information (Step 1)
  city: "",
  country: "",
  state: "",

  // Personal Details (Step 2)
  username: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "", // Database format ("MALE"/"FEMALE")
  bio: "",

  // Image Upload
  imageFile: undefined,
  imageUrl: "",
  imageUploadState: "idle",
  imageUploadProgress: 0,
  cloudinaryPublicId: undefined,

  // Sport Selection (Step 3)
  primarySport: "",

  // Geolocation (Step 4)
  latitude: 0,
  longitude: 0,
  locationAccuracy: 0,

  // Form State
  isSubmitting: false,
} as const;

/**
 * Initial wizard steps configuration
 */
const INITIAL_WIZARD_STEPS: readonly WizardStep[] = [
  { id: 1, title: "Location", isCompleted: false, isValid: false },
  { id: 2, title: "Personal Details", isCompleted: false, isValid: false },
  { id: 3, title: "Primary Sport", isCompleted: false, isValid: false },
  { id: 4, title: "Geolocation", isCompleted: false, isValid: false },
  { id: 5, title: "Review & Submit", isCompleted: false, isValid: false },
] as const;

/**
 * Initial image upload state
 */
const INITIAL_IMAGE_UPLOAD_STATE: ImageUploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  uploadId: undefined,
} as const;

/**
 * Store configuration constants
 */
const STORE_CONFIG = {
  /** Debounce delay for form updates (ms) */
  FORM_UPDATE_DELAY: 300,
  /** Maximum number of errors to store */
  MAX_ERRORS: 10,
  /** Default step validation timeout (ms) */
  VALIDATION_TIMEOUT: 30000,
  /** Image upload chunk size for progress tracking */
  UPLOAD_CHUNK_SIZE: 1024 * 1024, // 1MB
} as const;

/**
 * =============================================================================
 * UTILITY FUNCTIONS
 * =============================================================================
 */

/**
 * Deep comparison utility for form data changes
 */
const hasFormDataChanged = (
  previous: Partial<ProfileFormData>,
  current: Partial<ProfileFormData>
): boolean => {
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of keys) {
    const prevValue = previous[key as keyof ProfileFormData];
    const currValue = current[key as keyof ProfileFormData];

    if (prevValue !== currValue) {
      return true;
    }
  }

  return false;
};

/**
 * Validation error deduplication utility
 */
const deduplicateErrors = (
  existingErrors: ValidationError[],
  newError: ValidationError
): ValidationError[] => {
  const filtered = existingErrors.filter((err) => err.field !== newError.field);
  return [...filtered, newError].slice(-STORE_CONFIG.MAX_ERRORS);
};

/**
 * Generate unique upload ID
 */
const generateUploadId = (): string => {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * =============================================================================
 * MAIN STORE IMPLEMENTATION
 * =============================================================================
 */

export const useProfileWizardStore = create<ProfileWizardStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      /**
       * =============================================================================
       * STATE PROPERTIES
       * =============================================================================
       */

      formData: { ...INITIAL_FORM_DATA },
      currentStep: 1,
      steps: [...INITIAL_WIZARD_STEPS],
      errors: [],
      imageUploadState: { ...INITIAL_IMAGE_UPLOAD_STATE },

      /**
       * =============================================================================
       * FORM DATA MANAGEMENT
       * =============================================================================
       */

      /**
       * Updates form data with optimized change detection
       * Prevents unnecessary re-renders and provides better performance
       */
      setFormData: (data: Partial<ProfileFormData>) => {
        const currentState = get();

        // Performance optimization: Skip update if no actual changes
        if (!hasFormDataChanged(currentState.formData, data)) {
          return;
        }

        try {
          set(
            (state) => ({
              formData: {
                ...state.formData,
                ...data,
                // Ensure proper data types
                imageUploadProgress: Math.max(
                  0,
                  Math.min(
                    100,
                    data.imageUploadProgress ??
                      state.formData.imageUploadProgress
                  )
                ),
              },
            }),
            false,
            {
              type: "formData/update",
              payload: Object.keys(data),
            }
          );
        } catch (error) {
          console.error("Form data update failed:", error);
          get().addError({
            field: "formData",
            message: "Failed to update form data",
            code: "FORM_UPDATE_ERROR",
          });
        }
      },

      /**
       * =============================================================================
       * STEP NAVIGATION & VALIDATION
       * =============================================================================
       */

      /**
       * Sets current step with boundary validation
       */
      setCurrentStep: (step: number) => {
        const currentState = get();
        const newStep = Math.max(1, Math.min(5, step)) as WizardStepId;

        if (currentState.currentStep === newStep) {
          return;
        }

        set(() => ({ currentStep: newStep }), false, {
          type: "navigation/setStep",
          payload: { from: currentState.currentStep, to: newStep },
        });
      },

      /**
       * Updates step validation status with change detection
       */
      setStepValid: (step: number, isValid: boolean) => {
        const currentState = get();
        const stepIndex = currentState.steps.findIndex((s) => s.id === step);

        if (stepIndex === -1) {
          console.warn(`Invalid step ID: ${step}`);
          return;
        }

        const currentStep = currentState.steps[stepIndex];
        if (currentStep && currentStep.isValid === isValid) {
          return; // No change needed
        }

        set(
          (state) => ({
            steps: state.steps.map((s) =>
              s.id === step ? { ...s, isValid } : s
            ),
          }),
          false,
          {
            type: "validation/setStepValid",
            payload: { step, isValid },
          }
        );
      },

      /**
       * Updates step completion status with change detection
       */
      setStepCompleted: (step: number, isCompleted: boolean) => {
        const currentState = get();
        const stepIndex = currentState.steps.findIndex((s) => s.id === step);

        if (stepIndex === -1) {
          console.warn(`Invalid step ID: ${step}`);
          return;
        }

        const currentStep = currentState.steps[stepIndex];
        if (currentStep && currentStep.isCompleted === isCompleted) {
          return; // No change needed
        }

        set(
          (state) => ({
            steps: state.steps.map((s) =>
              s.id === step ? { ...s, isCompleted } : s
            ),
          }),
          false,
          {
            type: "validation/setStepCompleted",
            payload: { step, isCompleted },
          }
        );
      },

      /**
       * =============================================================================
       * ERROR MANAGEMENT
       * =============================================================================
       */

      /**
       * Adds validation error with deduplication
       */
      addError: (error: ValidationError) => {
        const currentState = get();

        // Check for duplicate error
        const existingError = currentState.errors.find(
          (e) => e.field === error.field && e.message === error.message
        );

        if (existingError) {
          return; // Don't add duplicate errors
        }

        set(
          (state) => ({
            errors: deduplicateErrors(state.errors, {
              ...error,
              code: error.code || `ERROR_${Date.now()}`,
            }),
          }),
          false,
          {
            type: "error/add",
            payload: error,
          }
        );
      },

      /**
       * Clears errors with optional field filtering
       */
      clearErrors: (field?: string) => {
        const currentState = get();

        if (field) {
          const hasFieldErrors = currentState.errors.some(
            (e) => e.field === field
          );
          if (!hasFieldErrors) {
            return; // No errors to clear for this field
          }
        } else {
          if (currentState.errors.length === 0) {
            return; // No errors to clear
          }
        }

        set(
          (state) => ({
            errors: field ? state.errors.filter((e) => e.field !== field) : [],
          }),
          false,
          {
            type: "error/clear",
            payload: { field },
          }
        );
      },

      /**
       * =============================================================================
       * WIZARD RESET & CLEANUP
       * =============================================================================
       */

      /**
       * Resets wizard to initial state with cleanup
       */
      resetWizard: () => {
        try {
          // Clear any pending timeouts or intervals
          const currentState = get();
          if (currentState.imageUploadState.uploadId) {
            // Cancel any ongoing uploads if possible
            console.log(
              "Cancelling ongoing upload:",
              currentState.imageUploadState.uploadId
            );
          }

          set(
            {
              formData: { ...INITIAL_FORM_DATA },
              currentStep: 1,
              steps: [...INITIAL_WIZARD_STEPS],
              errors: [],
              imageUploadState: { ...INITIAL_IMAGE_UPLOAD_STATE },
            },
            false,
            {
              type: "wizard/reset",
              payload: { timestamp: Date.now() },
            }
          );
        } catch (error) {
          console.error("Wizard reset failed:", error);
        }
      },

      /**
       * =============================================================================
       * IMAGE UPLOAD MANAGEMENT
       * =============================================================================
       */

      /**
       * Updates image upload state with validation
       */
      /**
       * Updates image upload state with validation
       */
      /**
       * Updates image upload state with validation
       */
      setImageUploadState: (state: Partial<ImageUploadState>) => {
        const currentState = get();

        // ✅ FIXED: Build the new state directly
        const newImageUploadState = {
          ...currentState.imageUploadState,
          ...state,
          // Override progress with validation if provided
          ...(state.progress !== undefined && {
            progress: Math.max(0, Math.min(100, state.progress)),
          }),
        };

        // Skip update if no actual changes
        const hasChanges = Object.keys(state).some((key) => {
          const stateKey = key as keyof ImageUploadState;
          return (
            currentState.imageUploadState[stateKey] !==
            newImageUploadState[stateKey]
          );
        });

        if (!hasChanges) {
          return;
        }

        set(
          (prevState) => ({
            ...prevState,
            imageUploadState: newImageUploadState,
          }),
          false,
          {
            type: "imageUpload/updateState",
            payload: state,
          }
        );
      },

      /**
       * Handles Cloudinary image upload with comprehensive error handling
       */
      /**
       * Handles Cloudinary image upload with comprehensive error handling
       */
      uploadImageToCloudinary: async (
        file: File
      ): Promise<CloudinaryUploadResponse> => {
        const { setImageUploadState, setFormData, addError, clearErrors } =
          get();

        try {
          // Validate file before upload
          if (file.size > IMAGE_VALIDATION_CONFIG.MAX_SIZE_BYTES) {
            throw new Error(
              `File size exceeds ${
                IMAGE_VALIDATION_CONFIG.MAX_SIZE_BYTES / (1024 * 1024)
              }MB limit`
            );
          }

          const fileExtension = file.name.toLowerCase().split(".").pop();
          if (
            !fileExtension ||
            !IMAGE_VALIDATION_CONFIG.ALLOWED_FORMATS.includes(
              fileExtension as any
            )
          ) {
            throw new Error(
              `File format not supported. Allowed: ${IMAGE_VALIDATION_CONFIG.ALLOWED_FORMATS.join(
                ", "
              )}`
            );
          }

          // Generate unique upload ID for tracking
          const uploadId = generateUploadId();

          // Clear previous errors
          clearErrors("imageFile");
          clearErrors("imageUpload");

          // Initialize upload state
          setImageUploadState({
            isUploading: true,
            progress: 0,
            error: null,
            uploadId,
          });

          // Update form data
          setFormData({
            imageUploadState: "uploading",
            imageUploadProgress: 0,
          });

          // Prepare upload data
          const formData = new FormData();
          formData.append("file", file);
          formData.append(
            "options",
            JSON.stringify({
              folder: "profile-images",
              transformation: {
                width: 400,
                height: 400,
                crop: "fill",
                quality: "auto:good",
              },
            })
          );

          // ✅ IMPROVED: Upload with proper timeout and cancellation
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, STORE_CONFIG.VALIDATION_TIMEOUT);

          console.log(
            `🔄 Starting upload with ${
              STORE_CONFIG.VALIDATION_TIMEOUT / 1000
            }s timeout...`
          );

          const response = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          // Clear timeout on successful response
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: "Unknown error" }));
            throw new Error(
              errorData.error || `Upload failed with status ${response.status}`
            );
          }

          const result: UploadImageResponse = await response.json();

          if (!result.success || !result.data) {
            throw new Error(result.error || "Upload failed - no data returned");
          }

          console.log(
            "✅ Upload completed successfully:",
            result.data.public_id
          );

          // Update success state
          setImageUploadState({
            isUploading: false,
            progress: 100,
            error: null,
          });

          setFormData({
            imageUrl: result.data.secure_url,
            cloudinaryPublicId: result.data.public_id,
            imageUploadState: "success",
            imageUploadProgress: 100,
          });

          return result;
        } catch (error) {
          console.error("Cloudinary upload error:", error);

          let errorMessage = "Upload failed";

          if (error instanceof Error) {
            if (error.name === "AbortError") {
              errorMessage =
                "Upload timed out after 30 seconds. Please try again with a smaller image.";
            } else {
              errorMessage = error.message;
            }
          }

          // Update error state
          setImageUploadState({
            isUploading: false,
            progress: 0,
            error: errorMessage,
          });

          setFormData({
            imageUploadState: "error",
            imageUploadProgress: 0,
          });

          // Add error to store
          addError({
            field: "imageUpload",
            message: errorMessage,
            code: "UPLOAD_ERROR",
          });

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      /**
       * Clears image upload state and data
       */
      clearImageUpload: () => {
        const { setImageUploadState, setFormData, clearErrors } = get();

        try {
          // Reset upload state
          setImageUploadState({ ...INITIAL_IMAGE_UPLOAD_STATE });

          // Clear form data
          setFormData({
            imageFile: undefined,
            imageUrl: "",
            cloudinaryPublicId: undefined,
            imageUploadState: "idle",
            imageUploadProgress: 0,
          });

          // Clear related errors
          clearErrors("imageFile");
          clearErrors("imageUpload");
        } catch (error) {
          console.error("Failed to clear image upload:", error);
        }
      },

      /**
       * =============================================================================
       * PROFILE SUBMISSION
       * =============================================================================
       */

      /**
       * Submits complete profile with comprehensive validation and error handling
       */
      submitProfile: async (): Promise<boolean> => {
        const state = get();

        try {
          // Set submitting state
          set(
            (state) => ({
              formData: { ...state.formData, isSubmitting: true },
            }),
            false,
            { type: "profile/submitStart" }
          );

          // Comprehensive validation
          const allStepsValid = state.steps.every((step) => step.isValid);
          if (!allStepsValid) {
            throw new Error(
              "Please complete all required fields before submitting"
            );
          }

          // Prepare submission data with proper formatting
          const submissionData = {
            // Location data
            city: state.formData.city,
            country: state.formData.country,
            state: state.formData.state,

            // Personal data
            username: state.formData.username,
            firstName: state.formData.firstName,
            lastName: state.formData.lastName,
            dateOfBirth: state.formData.dateOfBirth,
            gender: state.formData.gender || "",
            bio: state.formData.bio,

            // Image data
            profileImageUrl: state.formData.imageUrl,
            profileImagePublicId: state.formData.cloudinaryPublicId,

            // Sport data
            primarySport: state.formData.primarySport,

            // Location coordinates
            latitude: state.formData.latitude,
            longitude: state.formData.longitude,
            locationAccuracy: state.formData.locationAccuracy,
          };

          console.log("Submitting profile data:", {
            ...submissionData,
            profileImageUrl: submissionData.profileImageUrl
              ? "[URL_PROVIDED]"
              : undefined,
          });

          // Try update first (for editing existing profiles)
          let response = await fetch("/api/profile/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submissionData),
          });

          // If update fails with 404, try creating new profile
          if (!response.ok && response.status === 404) {
            console.log("Profile not found, creating new profile...");
            response = await fetch("/api/profile/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(submissionData),
            });
          }

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.error || `HTTP ${response.status}: Failed to save profile`
            );
          }

          console.log("Profile saved successfully:", result.data);

          // Mark final step as completed
          set(
            (state) => ({
              steps: state.steps.map((s) =>
                s.id === 5 ? { ...s, isCompleted: true } : s
              ),
              formData: { ...state.formData, isSubmitting: false },
            }),
            false,
            { type: "profile/submitSuccess", payload: result.data }
          );

          return true;
        } catch (error) {
          console.error("Profile submission error:", error);

          const errorMessage =
            error instanceof Error ? error.message : "Submission failed";

          set(
            (state) => ({
              formData: { ...state.formData, isSubmitting: false },
              errors: deduplicateErrors(state.errors, {
                field: "submit",
                message: errorMessage,
                code: "SUBMISSION_ERROR",
              }),
            }),
            false,
            { type: "profile/submitError", payload: { error: errorMessage } }
          );

          return false;
        }
      },
    })),
    {
      name: "profile-wizard-store",
      // Enhanced devtools configuration
      serialize: {
        options: {
          // Don't serialize large objects like File instances
          filter: (key: string, value: any) => {
            if (key === "imageFile" && value instanceof File) {
              return `[File: ${value.name}]`;
            }
            return value;
          },
        },
      },
    }
  )
);

/**
 * =============================================================================
 * OPTIMIZED SELECTOR HOOKS
 * =============================================================================
 */

// State selectors with memoization
export const useFormData = () =>
  useProfileWizardStore((state) => state.formData);

export const useCurrentStep = () =>
  useProfileWizardStore((state) => state.currentStep);

export const useSteps = () => useProfileWizardStore((state) => state.steps);

export const useErrors = () => useProfileWizardStore((state) => state.errors);

export const useImageUploadState = () =>
  useProfileWizardStore((state) => state.imageUploadState);

// Computed selectors
export const useWizardProgress = () =>
  useProfileWizardStore((state) => {
    const completedSteps = state.steps.filter(
      (step) => step.isCompleted
    ).length;
    return Math.round((completedSteps / state.steps.length) * 100);
  });

export const useIsWizardComplete = () =>
  useProfileWizardStore((state) => state.steps.every((step) => step.isValid));

export const useCurrentStepInfo = () =>
  useProfileWizardStore((state) => {
    const currentStepData = state.steps.find(
      (step) => step.id === state.currentStep
    );
    return {
      step: currentStepData,
      canGoNext: currentStepData?.isValid || false,
      canGoPrevious: state.currentStep > 1,
      isLastStep: state.currentStep === state.steps.length,
    };
  });

// Action selectors
export const useSetFormData = () =>
  useProfileWizardStore((state) => state.setFormData);

export const useSetCurrentStep = () =>
  useProfileWizardStore((state) => state.setCurrentStep);

export const useSetStepValid = () =>
  useProfileWizardStore((state) => state.setStepValid);

export const useSetStepCompleted = () =>
  useProfileWizardStore((state) => state.setStepCompleted);

export const useAddError = () =>
  useProfileWizardStore((state) => state.addError);

export const useClearErrors = () =>
  useProfileWizardStore((state) => state.clearErrors);

export const useResetWizard = () =>
  useProfileWizardStore((state) => state.resetWizard);

export const useSubmitProfile = () =>
  useProfileWizardStore((state) => state.submitProfile);

// Image upload action selectors
export const useSetImageUploadState = () =>
  useProfileWizardStore((state) => state.setImageUploadState);

export const useUploadImageToCloudinary = () =>
  useProfileWizardStore((state) => state.uploadImageToCloudinary);

export const useClearImageUpload = () =>
  useProfileWizardStore((state) => state.clearImageUpload);

/**
 * =============================================================================
 * STORE UTILITIES & DEBUG HELPERS
 * =============================================================================
 */

/**
 * Debug utility to log current store state
 * Only available in development
 */
export const useDebugStore = () => {
  if (process.env.NODE_ENV === "development") {
    return useProfileWizardStore.getState;
  }
  return () => console.warn("Debug store only available in development");
};

/**
 * Utility hook to subscribe to specific store changes
 */
export const useStoreSubscription = (
  selector: (state: ProfileWizardStore) => any,
  callback: (value: any, previousValue: any) => void
) => {
  return useProfileWizardStore.subscribe(selector, callback);
};
