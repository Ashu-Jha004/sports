"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  useFormData,
  useErrors,
  useCurrentStep,
  useSteps,
  useSetCurrentStep,
  useSetStepCompleted,
  useSetStepValid, // NEW: Added for automatic validation
  useClearErrors,
  useSubmitProfile,
} from "@/store/profileWizardStore";
import { calculateAge } from "@/lib/validations";
import {
  CheckCircleIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  MapPinIcon,
  TrophyIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  stepNumber: number;
  isValid: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  icon,
  stepNumber,
  isValid,
  onEdit,
  children,
}) => (
  <div
    className={`border rounded-xl p-6 transition-all duration-200 ${
      isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isValid ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {icon}
        </div>
        <div>
          <h3
            className={`font-semibold ${
              isValid ? "text-green-900" : "text-red-900"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-xs ${isValid ? "text-green-600" : "text-red-600"}`}
          >
            Step {stepNumber}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isValid ? (
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
        ) : (
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
        )}
        <button
          type="button"
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-100 transition-colors"
          aria-label={`Edit ${title}`}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className={isValid ? "text-green-800" : "text-red-800"}>
      {children}
    </div>
  </div>
);

export const StepFive: React.FC = () => {
  const formData = useFormData();
  const steps = useSteps();
  const storeErrors = useErrors();
  const setCurrentStep = useSetCurrentStep();
  const submitProfile = useSubmitProfile();
  const setStepCompleted = useSetStepCompleted();
  const setStepValid = useSetStepValid(); // NEW: Added for automatic validation
  const clearErrors = useClearErrors();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Check if all previous steps are valid
  const allStepsValid = steps.slice(0, 4).every((step) => step.isValid);
  const userAge = formData.dateOfBirth
    ? calculateAge(formData.dateOfBirth)
    : null;

  // Validate all data before allowing submission
  useEffect(() => {
    const errors: string[] = [];

    // Validate location data
    if (!formData.city || !formData.country || !formData.state) {
      errors.push("Location information is incomplete");
    }

    // Validate personal details
    if (!formData.dateOfBirth || !formData.gender || !formData.bio) {
      errors.push("Personal details are incomplete");
    }

    // Validate primary sport
    if (!formData.primarySport) {
      errors.push("Primary sport is not selected");
    }

    // Age validation
    if (userAge !== null && userAge < 13) {
      errors.push("You must be at least 13 years old to create a profile");
    }

    setValidationErrors(errors);
  }, [formData, userAge]);

  // NEW: Automatically mark Step 5 as valid when all previous steps are complete
  useEffect(() => {
    if (allStepsValid && validationErrors.length === 0) {
      setStepValid(5, true);
      console.log("✅ Step 5 marked as valid - ready to submit");
    } else {
      setStepValid(5, false);
      console.log("❌ Step 5 marked as invalid:", {
        allStepsValid,
        validationErrorsCount: validationErrors.length,
      });
    }
  }, [allStepsValid, validationErrors.length, setStepValid]);

  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setCurrentStep(stepNumber);
    },
    [setCurrentStep]
  );

  const handleSubmit = useCallback(async () => {
    if (!allStepsValid || validationErrors.length > 0) {
      setSubmissionError(
        "Please complete all required fields before submitting."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    clearErrors();

    try {
      console.log("🚀 Starting profile submission...");
      const success = await submitProfile();

      if (success) {
        console.log("✅ Profile submission successful");
        setSubmissionSuccess(true);
        setStepCompleted(5, true);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("❌ Profile submission error:", error);
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during submission. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    allStepsValid,
    validationErrors,
    submitProfile,
    clearErrors,
    setStepCompleted,
  ]);

  // Show success state
  if (submissionSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Profile Created Successfully! 🎉
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Welcome to our athletic community! Your profile has been created and
            you can now start connecting with other athletes.
          </p>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/profile")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View My Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Review your profile
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Please review all information before submitting your athletic
            profile
          </p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">
                Please fix the following issues:
              </h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6">
          {/* Location Information */}
          <ReviewSection
            title="Location Information"
            icon={<MapPinIcon className="w-5 h-5 text-blue-600" />}
            stepNumber={1}
            isValid={steps[0]?.isValid || false}
            onEdit={() => handleEditStep(1)}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">City:</span>
                <p>{formData.city || "Not provided"}</p>
              </div>
              <div>
                <span className="font-medium">Country:</span>
                <p>{formData.country || "Not provided"}</p>
              </div>
              <div>
                <span className="font-medium">State:</span>
                <p>{formData.state || "Not provided"}</p>
              </div>
            </div>
          </ReviewSection>

          {/* Personal Details */}
          <ReviewSection
            title="Personal Details"
            icon={<UserCircleIcon className="w-5 h-5 text-green-600" />}
            stepNumber={2}
            isValid={steps[1]?.isValid || false}
            onEdit={() => handleEditStep(2)}
          >
            <div className="space-y-4">
              {/* Profile Image */}
              {(formData.imageUrl || formData.imageFile) && (
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      formData.imageUrl ||
                      (formData.imageFile
                        ? URL.createObjectURL(formData.imageFile)
                        : "")
                    }
                    alt="Profile"
                    className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                  />
                  <div>
                    <span className="text-sm font-medium">
                      Profile image uploaded
                    </span>
                    {formData.imageUploadState === "success" && (
                      <p className="text-xs text-green-600">
                        ✓ Stored in cloud
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date of Birth:</span>
                  <p>
                    {formData.dateOfBirth
                      ? `${new Date(
                          formData.dateOfBirth
                        ).toLocaleDateString()} (Age: ${userAge})`
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Gender:</span>
                  <p className="capitalize">
                    {formData.gender || "Not specified"}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-medium">Bio:</span>
                <p className="mt-1 text-sm bg-white p-3 rounded border">
                  {formData.bio || "No bio provided"}
                </p>
              </div>
            </div>
          </ReviewSection>

          {/* Primary Sport */}
          <ReviewSection
            title="Primary Sport"
            icon={<TrophyIcon className="w-5 h-5 text-yellow-600" />}
            stepNumber={3}
            isValid={steps[2]?.isValid || false}
            onEdit={() => handleEditStep(3)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {formData.primarySport === "Football"
                  ? "🏈"
                  : formData.primarySport === "Soccer"
                  ? "⚽"
                  : formData.primarySport === "Basketball"
                  ? "🏀"
                  : formData.primarySport === "Tennis"
                  ? "🎾"
                  : formData.primarySport === "Swimming"
                  ? "🏊"
                  : formData.primarySport === "Running"
                  ? "🏃"
                  : formData.primarySport === "Cycling"
                  ? "🚴"
                  : formData.primarySport === "Golf"
                  ? "⛳"
                  : "🏆"}
              </span>
              <div>
                <p className="font-medium">
                  {formData.primarySport || "Not selected"}
                </p>
                {formData.primarySport && (
                  <p className="text-sm opacity-75">
                    Your primary athletic focus
                  </p>
                )}
              </div>
            </div>
          </ReviewSection>

          {/* Geolocation */}
          <ReviewSection
            title="Location Coordinates"
            icon={<GlobeAltIcon className="w-5 h-5 text-purple-600" />}
            stepNumber={4}
            isValid={steps[3]?.isValid || false}
            onEdit={() => handleEditStep(4)}
          >
            <div className="text-sm">
              {formData.latitude && formData.longitude ? (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Coordinates:</span>
                    <p>
                      {formData.latitude}, {formData.longitude}
                    </p>
                  </div>
                  {formData.locationAccuracy && (
                    <div>
                      <span className="font-medium">Accuracy:</span>
                      <p>±{Math.round(formData.locationAccuracy)}m</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">
                  Location coordinates not provided (optional)
                </p>
              )}
            </div>
          </ReviewSection>
        </div>

        {/* Submission Error */}
        {submissionError && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Submission Error</span>
            </div>
            <p className="text-red-700 text-sm mt-2">{submissionError}</p>
          </div>
        )}

        {/* Store Errors */}
        {storeErrors.length > 0 && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">
                Please fix these errors:
              </span>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {storeErrors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting || !allStepsValid || validationErrors.length > 0
            }
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isSubmitting || !allStepsValid || validationErrors.length > 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-3">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Creating your profile...</span>
              </div>
            ) : (
              "Create My Athletic Profile"
            )}
          </button>

          {allStepsValid && validationErrors.length === 0 && !isSubmitting && (
            <p className="text-center text-green-600 text-sm mt-2 flex items-center justify-center space-x-1">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Ready to submit!</span>
            </p>
          )}
        </div>

        {/* Terms and Privacy */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <p className="text-xs text-gray-600">
            By creating your profile, you agree to our{" "}
            <button className="text-blue-600 hover:text-blue-700 underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-blue-600 hover:text-blue-700 underline">
              Privacy Policy
            </button>
            . Your data is secure and will never be shared without your consent.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepFive;
