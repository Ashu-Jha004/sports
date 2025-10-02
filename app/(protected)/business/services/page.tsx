"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Trophy,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { ModeratorFormData } from "../types/service";
import { WelcomeStep } from "./components/WelcomeStep";
import { ContactStep } from "./components/ContactStep";
import { SportsExperienceStep } from "./components/SportsExperinenceStep";
import { LocationStep } from "./components/LocationStep";
import DocumentsStep from "./components/DocumentStep";
import { ReviewStep } from "./components/ReviewStep";
import { redirect } from "next/navigation";

export interface StepProps {
  formData: ModeratorFormData;
  updateFormData: (data: Partial<ModeratorFormData>) => void;
  errors: Record<string, string>;
}

// UPDATED: Enhanced error types matching our API
interface ApiError {
  type:
    | "validation"
    | "network"
    | "server"
    | "conflict"
    | "auth"
    | "rate_limit"
    | "unknown";
  message: string;
  field?: string;
  code?: string;
  details?: Record<string, any>;
}

interface SubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: ApiError | null;
  isCheckingExisting: boolean;
  hasExistingProfile: boolean;
}

// UPDATED: API response types matching our backend
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  metadata: {
    traceId: string;
    timestamp: string;
    version: string;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    field?: string;
    details?: Record<string, any>;
  };
  metadata: {
    traceId: string;
    timestamp: string;
    version: string;
  };
}

const ModeratorOnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ModeratorFormData>({
    guideEmail: "",
    documents: [],
    primarySports: "",
    sports: [],
    experience: null,
    state: "",
    lat: null,
    lon: null,
    city: "",
    country: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
    isCheckingExisting: false,
    hasExistingProfile: false,
  });

  const totalSteps = 6;
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UPDATED: Check for existing moderator profile on component mount
  useEffect(() => {
    checkExistingModeratorProfile();
  }, []);

  // Clear submission errors when user interacts with form
  useEffect(() => {
    if (submissionState.error) {
      setSubmissionState((prev) => ({ ...prev, error: null }));
    }
  }, [formData, currentStep]);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // UPDATED: Check if user already has a moderator profile
  const checkExistingModeratorProfile = async () => {
    setSubmissionState((prev) => ({ ...prev, isCheckingExisting: true }));

    try {
      const response = await fetch(
        "/business/services/api/moderator/register",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result: ApiSuccessResponse<any> = await response.json();

        if (result.data.hasModeratorProfile) {
          setSubmissionState((prev) => ({
            ...prev,
            hasExistingProfile: true,
            isCheckingExisting: false,
          }));
        } else {
          setSubmissionState((prev) => ({
            ...prev,
            hasExistingProfile: false,
            isCheckingExisting: false,
          }));
        }
      } else {
        // If not authenticated or other error, just proceed normally
        setSubmissionState((prev) => ({
          ...prev,
          isCheckingExisting: false,
        }));
      }
    } catch (error) {
      console.warn("Could not check existing profile:", error);
      setSubmissionState((prev) => ({
        ...prev,
        isCheckingExisting: false,
      }));
    }
  };

  const updateFormData = useCallback(
    (data: Partial<ModeratorFormData>) => {
      try {
        setFormData((prev) => ({ ...prev, ...data }));

        // Clear related errors when field is updated
        const newErrors = { ...errors };
        Object.keys(data).forEach((key) => {
          delete newErrors[key];
        });
        setErrors(newErrors);
      } catch (error) {
        console.error("Error updating form data:", error);
        setSubmissionState((prev) => ({
          ...prev,
          error: {
            type: "unknown",
            message: "Failed to update form data. Please try again.",
          },
        }));
      }
    },
    [errors]
  );

  const validateStep = (step: number): boolean => {
    try {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 2:
          if (!formData.guideEmail?.trim()) {
            newErrors.guideEmail = "Organization email is required";
          } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guideEmail.trim())
          ) {
            newErrors.guideEmail = "Please enter a valid email address";
          }
          break;
        case 3:
          if (!formData.primarySports?.trim()) {
            newErrors.primarySports = "Primary sport is required";
          }
          if (!formData.sports || formData.sports.length === 0) {
            newErrors.sports = "At least one sport must be selected";
          } else if (
            formData.primarySports &&
            !formData.sports.includes(formData.primarySports)
          ) {
            newErrors.primarySports =
              "Primary sport must be included in the sports list";
          }
          break;
        case 4:
          if (!formData.country?.trim()) {
            newErrors.country = "Country is required";
          }
          break;
        case 5:
          if (!formData.documents || formData.documents.length === 0) {
            newErrors.documents = "At least one document must be uploaded";
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error("Validation error:", error);
      setSubmissionState((prev) => ({
        ...prev,
        error: {
          type: "validation",
          message: "Form validation failed. Please check your inputs.",
        },
      }));
      return false;
    }
  };

  const handleNext = () => {
    try {
      if (validateStep(currentStep)) {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      }
    } catch (error) {
      console.error("Navigation error:", error);
      setSubmissionState((prev) => ({
        ...prev,
        error: {
          type: "unknown",
          message: "Navigation failed. Please try again.",
        },
      }));
    }
  };

  const handlePrevious = () => {
    try {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    } catch (error) {
      console.error("Navigation error:", error);
      setSubmissionState((prev) => ({
        ...prev,
        error: {
          type: "unknown",
          message: "Navigation failed. Please try again.",
        },
      }));
    }
  };

  // UPDATED: Submit application using our new API
  // UPDATED: Enhanced debugging in your submitApplication function
  // UPDATED: Submit application using our new API
  const submitApplication = async (
    formData: ModeratorFormData
  ): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // DEBUG: Log exactly what we're sending
      console.log("=== FORM DATA DEBUG ===");
      console.log("Raw formData:", formData);
      console.log("Documents array:", formData.documents);
      console.log("Documents length:", formData.documents?.length);

      // ✅ FIXED: Documents are already strings (URLs), no transformation needed
      formData.documents?.forEach((doc, index) => {
        console.log(`Document ${index}:`, doc);
        console.log(`Document ${index} type:`, typeof doc);
        // Documents are now always strings (Cloudinary URLs)
      });

      // ✅ SIMPLIFIED: No transformation needed since documents are already URLs
      const transformedData = {
        ...formData,
        documents: formData.documents || [], // Already strings
      };

      console.log("=== TRANSFORMED DATA ===");
      console.log("Transformed documents:", transformedData.documents);
      console.log("=== END DEBUG ===");

      const response = await fetch(
        "/business/services/api/moderator/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transformedData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        const apiError = result as ApiErrorResponse;
        console.log("API Error Details:", apiError);
        throw new Error(
          apiError.error.message || `Server error: ${response.status}`
        );
      }

      const successResult = result as ApiSuccessResponse<any>;
      console.log("Application submitted successfully:", successResult);
      redirect("/business/services/dashboard");
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Submission error details:", error);
      throw error;
    }
  };

  // UPDATED: Enhanced error handling for our API errors
  const handleSubmit = async () => {
    // Validate final step before submission
    if (!validateStep(currentStep)) {
      return;
    }

    setSubmissionState({
      isSubmitting: true,
      isSuccess: false,
      error: null,
      isCheckingExisting: false,
      hasExistingProfile: false,
    });

    try {
      // Additional validation before submission
      const requiredFields = ["guideEmail", "primarySports", "country"];
      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof ModeratorFormData]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      if (!formData.sports || formData.sports.length === 0) {
        throw new Error("At least one sport must be selected");
      }

      if (!formData.documents || formData.documents.length === 0) {
        throw new Error("At least one document must be uploaded");
      }

      await submitApplication(formData);

      setSubmissionState({
        isSubmitting: false,
        isSuccess: true,
        error: null,
        isCheckingExisting: false,
        hasExistingProfile: false,
      });
    } catch (error: any) {
      console.error("Submission error:", error);

      let errorType: ApiError["type"] = "unknown";
      let errorMessage = "An unexpected error occurred. Please try again.";

      // UPDATED: Handle our specific API errors
      if (error.message.includes("Authentication required")) {
        errorType = "auth";
        errorMessage = "Please log in to submit your application.";
      } else if (error.message.includes("already has a moderator profile")) {
        errorType = "conflict";
        errorMessage =
          "You already have a moderator profile. Only one profile is allowed per user.";
      } else if (error.message.includes("already registered as a moderator")) {
        errorType = "conflict";
        errorMessage = "This email is already registered as a moderator.";
      } else if (error.message.includes("Recent registration detected")) {
        errorType = "rate_limit";
        errorMessage = error.message; // Use the specific rate limit message
      } else if (
        error.message.includes("Network") ||
        error.message.includes("fetch")
      ) {
        errorType = "network";
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes("timeout")) {
        errorType = "network";
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("Server error")) {
        errorType = "server";
        errorMessage = "Server error. Please try again in a few moments.";
      } else if (
        error.message.includes("Missing required fields") ||
        error.message.includes("At least one")
      ) {
        errorType = "validation";
        errorMessage = error.message;
      }

      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: {
          type: errorType,
          message: errorMessage,
        },
        isCheckingExisting: false,
        hasExistingProfile: false,
      });
    }
  };

  const handleRetry = () => {
    setSubmissionState((prev) => ({ ...prev, error: null }));
    // Add small delay before retry
    retryTimeoutRef.current = setTimeout(() => {
      handleSubmit();
    }, 1000); // Increased delay for rate limiting
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      guideEmail: "",
      documents: [],
      primarySports: "",
      sports: [],
      experience: null,
      state: "",
      lat: null,
      lon: null,
      city: "",
      country: "",
    });
    setErrors({});
    setSubmissionState({
      isSubmitting: false,
      isSuccess: false,
      error: null,
      isCheckingExisting: false,
      hasExistingProfile: false,
    });
  };

  // UPDATED: Enhanced error display component
  const ErrorAlert = ({ error }: { error: ApiError }) => (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            {error.type === "validation" && "Validation Error"}
            {error.type === "network" && "Connection Error"}
            {error.type === "server" && "Server Error"}
            {error.type === "conflict" && "Conflict Error"}
            {error.type === "auth" && "Authentication Error"}
            {error.type === "rate_limit" && "Rate Limit Error"}
            {error.type === "unknown" && "Error"}
          </h3>
          <p className="text-sm text-red-700">{error.message}</p>
          {(error.type === "network" || error.type === "server") && (
            <button
              onClick={handleRetry}
              disabled={submissionState.isSubmitting}
              className="mt-2 text-sm text-red-800 underline hover:no-underline disabled:opacity-50"
            >
              {submissionState.isSubmitting ? "Retrying..." : "Try Again"}
            </button>
          )}
          {error.type === "rate_limit" && (
            <p className="mt-2 text-xs text-red-600">
              Please wait before submitting again.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Success display component
  const SuccessAlert = () => (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
      <div className="flex items-start">
        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800 mb-1">
            Application Submitted Successfully!
          </h3>
          <p className="text-sm text-green-700 mb-2">
            Your moderator application has been received. You will be contacted
            within 48 hours.
          </p>
          <button
            onClick={resetForm}
            className="text-sm text-green-800 underline hover:no-underline"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    </div>
  );

  // UPDATED: Existing profile alert
  const ExistingProfileAlert = () => (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            Existing Moderator Profile Found
          </h3>
          <p className="text-sm text-yellow-700">
            You already have a moderator profile. Only one profile is allowed
            per user.
          </p>
          <Link href={"/business/services/dashboard"}>
            <h2 className="text-center py-3 font-medium font-sans  hover:text-white bg-emerald-200 my-2 hover:bg-indigo-400  align-middle justify-center rounded-2xl">
              Visit Your Profile
            </h2>
          </Link>
        </div>
      </div>
    </div>
  );

  // Show loading state while checking existing profile
  if (submissionState.isCheckingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Checking your profile status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Sparta as a Moderator
          </h1>
          <p className="text-gray-600">
            Help shape the future of athletic networking and evaluation
          </p>
        </div>

        {/* Alerts */}
        {submissionState.hasExistingProfile && <ExistingProfileAlert />}
        {submissionState.error && <ErrorAlert error={submissionState.error} />}
        {submissionState.isSuccess && <SuccessAlert />}

        {/* Only show form if no existing profile */}
        {!submissionState.hasExistingProfile && (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              {currentStep === 1 && <WelcomeStep />}
              {currentStep === 2 && (
                <ContactStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                />
              )}
              {currentStep === 3 && (
                <SportsExperienceStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                />
              )}
              {currentStep === 4 && (
                <LocationStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                />
              )}
              {currentStep === 5 && (
                <DocumentsStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                />
              )}
              {currentStep === 6 && <ReviewStep formData={formData} />}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1 || submissionState.isSubmitting}
                className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={submissionState.isSubmitting}
                  className="flex items-center px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={
                    submissionState.isSubmitting || submissionState.isSuccess
                  }
                  className="flex items-center px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submissionState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit Application</>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModeratorOnboardingPage;
