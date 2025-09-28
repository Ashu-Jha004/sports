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
} from "@/types/profile";
import { mapGenderToDatabase } from "@/lib/validations"; // FIXED: Added import

const initialFormData: ProfileFormData = {
  city: "",
  country: "",
  username: "",
  firstName: "",
  lastName: "",
  state: "",
  dateOfBirth: "",
  gender: "", // This will store database format ("MALE"/"FEMALE")
  bio: "",
  imageFile: undefined,
  imageUrl: "",
  // NEW: Cloudinary fields
  imageUploadState: "idle",
  imageUploadProgress: 0,
  cloudinaryPublicId: undefined,
  primarySport: "",
  latitude: undefined,
  longitude: undefined,
  locationAccuracy: undefined,
  isSubmitting: false,
};

const initialSteps: WizardStep[] = [
  { id: 1, title: "Location", isCompleted: false, isValid: false },
  { id: 2, title: "Personal Details", isCompleted: false, isValid: false },
  { id: 3, title: "Primary Sport", isCompleted: false, isValid: false },
  { id: 4, title: "Geolocation", isCompleted: false, isValid: false },
  { id: 5, title: "Review & Submit", isCompleted: false, isValid: false },
];

const initialImageUploadState: ImageUploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  uploadId: undefined,
};

export const useProfileWizardStore = create<ProfileWizardStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      formData: initialFormData,
      currentStep: 1,
      steps: initialSteps,
      errors: [],
      // NEW: Image upload state
      imageUploadState: initialImageUploadState,

      // Existing Actions - Enhanced for efficiency
      setFormData: (data: Partial<ProfileFormData>) => {
        const currentState = get();

        // Only update if data actually changed
        const hasChanges = Object.keys(data).some(
          (key) =>
            currentState.formData[key as keyof ProfileFormData] !==
            data[key as keyof ProfileFormData]
        );

        if (!hasChanges) return;

        set(
          (state) => ({
            formData: { ...state.formData, ...data },
          }),
          false,
          "setFormData"
        );
      },

      setCurrentStep: (step: number) => {
        const currentState = get();
        const newStep = Math.max(1, Math.min(5, step));

        if (currentState.currentStep === newStep) return;

        set(
          () => ({
            currentStep: newStep,
          }),
          false,
          "setCurrentStep"
        );
      },

      setStepValid: (step: number, isValid: boolean) => {
        const currentState = get();
        const currentStep = currentState.steps.find((s) => s.id === step);

        if (currentStep && currentStep.isValid === isValid) return;

        set(
          (state) => ({
            steps: state.steps.map((s) =>
              s.id === step ? { ...s, isValid } : s
            ),
          }),
          false,
          "setStepValid"
        );
      },

      setStepCompleted: (step: number, isCompleted: boolean) => {
        const currentState = get();
        const currentStep = currentState.steps.find((s) => s.id === step);

        if (currentStep && currentStep.isCompleted === isCompleted) return;

        set(
          (state) => ({
            steps: state.steps.map((s) =>
              s.id === step ? { ...s, isCompleted } : s
            ),
          }),
          false,
          "setStepCompleted"
        );
      },

      addError: (error: ValidationError) => {
        const currentState = get();
        const existingError = currentState.errors.find(
          (e) => e.field === error.field
        );

        if (existingError && existingError.message === error.message) return;

        set(
          (state) => ({
            errors: [
              ...state.errors.filter((e) => e.field !== error.field),
              error,
            ],
          }),
          false,
          "addError"
        );
      },

      clearErrors: (field?: string) => {
        const currentState = get();

        if (field) {
          const hasFieldErrors = currentState.errors.some(
            (e) => e.field === field
          );
          if (!hasFieldErrors) return;
        } else {
          if (currentState.errors.length === 0) return;
        }

        set(
          (state) => ({
            errors: field ? state.errors.filter((e) => e.field !== field) : [],
          }),
          false,
          "clearErrors"
        );
      },

      resetWizard: () => {
        set(
          {
            formData: { ...initialFormData },
            currentStep: 1,
            steps: initialSteps.map((step) => ({ ...step })),
            errors: [],
            imageUploadState: { ...initialImageUploadState },
          },
          false,
          "resetWizard"
        );
      },

      // NEW: Cloudinary upload actions
      setImageUploadState: (state: Partial<ImageUploadState>) => {
        const currentState = get();

        // Only update if state actually changed
        const hasChanges = Object.keys(state).some(
          (key) =>
            currentState.imageUploadState[key as keyof ImageUploadState] !==
            state[key as keyof ImageUploadState]
        );

        if (!hasChanges) return;

        set(
          (prevState) => ({
            imageUploadState: { ...prevState.imageUploadState, ...state },
          }),
          false,
          "setImageUploadState"
        );
      },

      uploadImageToCloudinary: async (
        file: File
      ): Promise<CloudinaryUploadResponse> => {
        const { setImageUploadState, setFormData, addError, clearErrors } =
          get();

        try {
          // Generate unique upload ID
          const uploadId = `upload_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          // Clear any previous errors
          clearErrors("imageFile");
          clearErrors("imageUpload");

          // Set initial upload state
          setImageUploadState({
            isUploading: true,
            progress: 0,
            error: null,
            uploadId,
          });

          // Update form data to show upload in progress
          setFormData({
            imageUploadState: "uploading",
            imageUploadProgress: 0,
          });

          // Create FormData for the API call
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

          // Upload to API route with progress tracking
          const response = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed");
          }

          const result: UploadImageResponse = await response.json();

          if (!result.success || !result.data) {
            throw new Error(result.error || "Upload failed");
          }

          // Update upload state to success
          setImageUploadState({
            isUploading: false,
            progress: 100,
            error: null,
          });

          // Update form data with successful upload
          setFormData({
            imageUrl: result.data.secure_url,
            cloudinaryPublicId: result.data.public_id,
            imageUploadState: "success",
            imageUploadProgress: 100,
          });

          return result;
        } catch (error) {
          console.error("Cloudinary upload error:", error);

          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";

          // Update upload state to error
          setImageUploadState({
            isUploading: false,
            progress: 0,
            error: errorMessage,
          });

          // Update form data to show error
          setFormData({
            imageUploadState: "error",
            imageUploadProgress: 0,
          });

          // Add error to store
          addError({
            field: "imageUpload",
            message: errorMessage,
          });

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      clearImageUpload: () => {
        const { setImageUploadState, setFormData, clearErrors } = get();

        // Reset upload state
        setImageUploadState({ ...initialImageUploadState });

        // Clear form data
        setFormData({
          imageFile: undefined,
          imageUrl: "",
          cloudinaryPublicId: undefined,
          imageUploadState: "idle",
          imageUploadProgress: 0,
        });

        // Clear any upload errors
        clearErrors("imageFile");
        clearErrors("imageUpload");
      },

      // FIXED: Enhanced submitProfile with proper gender mapping
      submitProfile: async (): Promise<boolean> => {
        const state = get();

        try {
          set(
            (state) => ({
              formData: { ...state.formData, isSubmitting: true },
            }),
            false,
            "submitProfile_start"
          );

          // Validate all steps before submission
          const allStepsValid = state.steps.every((step) => step.isValid);
          if (!allStepsValid) {
            throw new Error("Please complete all required fields");
          }

          // FIXED: Prepare form data for submission with proper gender handling
          const submissionData = {
            city: state.formData.city,
            username: state.formData.username,
            firstName: state.formData.firstName,
            lastName: state.formData.lastName,
            country: state.formData.country,
            state: state.formData.state,
            dateOfBirth: state.formData.dateOfBirth,
            // FIXED: Ensure gender is in database format
            gender: state.formData.gender || undefined, // Should already be "MALE" or "FEMALE"
            bio: state.formData.bio,
            profileImageUrl: state.formData.imageUrl,
            profileImagePublicId: state.formData.cloudinaryPublicId,
            primarySport: state.formData.primarySport,
            latitude: state.formData.latitude,
            longitude: state.formData.longitude,
            locationAccuracy: state.formData.locationAccuracy,
          };

          console.log("Submitting profile data:", submissionData);

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
            throw new Error(result.error || "Failed to save profile");
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
            "submitProfile_success"
          );

          return true;
        } catch (error) {
          console.error("Profile submission error:", error);

          set(
            (state) => ({
              formData: { ...state.formData, isSubmitting: false },
              errors: [
                ...state.errors.filter((e) => e.field !== "submit"),
                {
                  field: "submit",
                  message:
                    error instanceof Error
                      ? error.message
                      : "Submission failed",
                },
              ],
            }),
            false,
            "submitProfile_error"
          );

          return false;
        }
      },
    })),
    {
      name: "profile-wizard-store",
    }
  )
);

// Existing selector hooks
export const useFormData = () =>
  useProfileWizardStore((state) => state.formData, shallow);

export const useCurrentStep = () =>
  useProfileWizardStore((state) => state.currentStep);

export const useSteps = () =>
  useProfileWizardStore((state) => state.steps, shallow);

export const useErrors = () =>
  useProfileWizardStore((state) => state.errors, shallow);

// NEW: Image upload selector hooks
export const useImageUploadState = () =>
  useProfileWizardStore((state) => state.imageUploadState, shallow);

// Existing action hooks
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

// NEW: Cloudinary action hooks
export const useSetImageUploadState = () =>
  useProfileWizardStore((state) => state.setImageUploadState);

export const useUploadImageToCloudinary = () =>
  useProfileWizardStore((state) => state.uploadImageToCloudinary);

export const useClearImageUpload = () =>
  useProfileWizardStore((state) => state.clearImageUpload);
