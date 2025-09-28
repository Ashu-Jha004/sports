"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  useCurrentStep,
  useSteps,
  useFormData,
  useErrors,
  useSetCurrentStep,
  useResetWizard,
} from "@/store/profileWizardStore";
import ProgressBar from "./ProgressBar";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./stepThree"; // FIXED: Corrected import name to match component
import StepFour from "./StepFour";
import StepFive from "./StepFive";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface ProfileWizardProps {
  onComplete?: (profileData: any) => void;
  onCancel?: () => void;
  className?: string;
  showHeader?: boolean;
  allowStepSkipping?: boolean;
}

const ProfileWizard: React.FC<ProfileWizardProps> = ({
  onComplete,
  onCancel,
  className = "",
  showHeader = true,
  allowStepSkipping = false,
}) => {
  const currentStep = useCurrentStep();
  const steps = useSteps();
  const formData = useFormData();
  const errors = useErrors();
  const setCurrentStep = useSetCurrentStep();
  const resetWizard = useResetWizard();

  const [isNavigating, setIsNavigating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // FIXED: Use refs to prevent infinite loops
  const lastFormDataRef = useRef<string>("");
  const isCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete); // FIXED: Add ref for onComplete to prevent stale closures

  // FIXED: Update onComplete ref when it changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // FIXED: Memoize form data check to prevent infinite loops
  const formDataHash = useMemo(() => {
    return JSON.stringify({
      city: formData.city,
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      country: formData.country,
      state: formData.state,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bio: formData.bio,
      primarySport: formData.primarySport,
      latitude: formData.latitude,
      longitude: formData.longitude,
    });
  }, [
    formData.city,
    formData.country,
    formData.username,
    formData.firstName,
    formData.lastName,
    formData.state,
    formData.dateOfBirth,
    formData.gender,
    formData.bio,
    formData.primarySport,
    formData.latitude,
    formData.longitude,
  ]);

  // FIXED: Only update when form data actually changes
  useEffect(() => {
    if (lastFormDataRef.current !== formDataHash) {
      lastFormDataRef.current = formDataHash;
      const emptyFormData = JSON.stringify({
        city: "",
        country: "",
        username: "",
        firstName: "",
        lastName: "",
        state: "",
        dateOfBirth: "",
        gender: "",
        bio: "",
        primarySport: "",
        latitude: undefined,
        longitude: undefined,
      });
      const hasData = formDataHash !== emptyFormData;
      setHasUnsavedChanges(hasData);
    }
  }, [formDataHash]);

  // FIXED: Stable navigation function with minimal dependencies
  const navigateToStep = useCallback(
    (targetStep: number) => {
      if (isNavigating) return;
      if (targetStep < 1 || targetStep > 5) return;

      setIsNavigating(true);

      // Simple timeout to prevent rapid clicking
      setTimeout(() => {
        setCurrentStep(targetStep);
        setIsNavigating(false);
      }, 100);
    },
    [setCurrentStep, isNavigating]
  );

  // FIXED: Simple navigation handlers
  const goToNextStep = useCallback(() => {
    if (currentStep < 5 && !isNavigating) {
      navigateToStep(currentStep + 1);
    }
  }, [currentStep, navigateToStep, isNavigating]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1 && !isNavigating) {
      navigateToStep(currentStep - 1);
    }
  }, [currentStep, navigateToStep, isNavigating]);

  // FIXED: Stable exit handlers
  const handleExit = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitModal(true);
    } else {
      onCancel?.();
    }
  }, [hasUnsavedChanges, onCancel]);

  const confirmExit = useCallback(() => {
    resetWizard();
    setShowExitModal(false);
    onCancel?.();
  }, [resetWizard, onCancel]);

  // FIXED: Memoized step rendering with minimal dependencies
  const renderCurrentStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <StepOne />;
      case 2:
        return <StepTwo />;
      case 3:
        return <StepThree />; // FIXED: Corrected component name
      case 4:
        return <StepFour />;
      case 5:
        return <StepFive />;
      default:
        return (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Invalid Step
            </h3>
            <p className="text-gray-600">
              Something went wrong. Please refresh the page or start over.
            </p>
            <button
              onClick={() => navigateToStep(1)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Step 1
            </button>
          </div>
        );
    }
  }, [currentStep, navigateToStep]);

  // FIXED: Stable step info calculation
  const stepInfo = useMemo(() => {
    const currentStepInfo = steps.find((step) => step.id === currentStep);
    const canGoNext = currentStepInfo?.isValid || allowStepSkipping;
    const canGoPrevious = currentStep > 1;
    const isCompleted = steps[4]?.isCompleted;

    return {
      currentStepInfo,
      canGoNext,
      canGoPrevious,
      isCompleted,
    };
  }, [steps, currentStep, allowStepSkipping]);

  // FIXED: Handle completion with ref to prevent infinite loops and stale closures
  useEffect(() => {
    if (stepInfo.isCompleted && !isCompletedRef.current) {
      isCompletedRef.current = true;
      if (onCompleteRef.current) {
        onCompleteRef.current(formData);
      }
    } else if (!stepInfo.isCompleted) {
      isCompletedRef.current = false;
    }
  }, [stepInfo.isCompleted, formData]); // FIXED: Removed onComplete from dependencies

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Profile Setup Wizard
                </h1>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <InformationCircleIcon className="w-4 h-4" />
                  <span>
                    Complete all steps to create your athletic profile
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {hasUnsavedChanges && (
                  <div className="hidden sm:flex items-center space-x-1 text-xs text-amber-600">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Unsaved changes</span>
                  </div>
                )}
                {onCancel && (
                  <button
                    onClick={handleExit}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    Exit
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar />
        </div>

        {/* Error Summary */}
        {errors.length > 0 && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-800">
                Please fix the following errors:
              </h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={`${error.field}-${index}`}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step Content */}
        <div className="relative">
          {isNavigating && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-xl">
              <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-lg shadow-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-700 font-medium">Loading...</span>
              </div>
            </div>
          )}

          <div className={isNavigating ? "opacity-50 pointer-events-none" : ""}>
            {renderCurrentStep}
          </div>
        </div>

        {/* Navigation - Hide on Step 5 since it has its own submit button */}
        {!stepInfo.isCompleted && currentStep < 5 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={goToPreviousStep}
              disabled={!stepInfo.canGoPrevious || isNavigating}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                stepInfo.canGoPrevious && !isNavigating
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              {/* Step indicator dots */}
              <div className="hidden sm:flex space-x-2">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => navigateToStep(step.id)}
                    disabled={!allowStepSkipping && step.id > currentStep}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      step.id === currentStep
                        ? "bg-blue-600 ring-2 ring-blue-200"
                        : step.isCompleted
                        ? "bg-green-500"
                        : step.isValid
                        ? "bg-blue-300"
                        : "bg-gray-300"
                    } ${
                      allowStepSkipping || step.id <= currentStep
                        ? "cursor-pointer hover:scale-110"
                        : "cursor-not-allowed"
                    }`}
                    aria-label={`Go to step ${step.id}: ${step.title}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNextStep}
                disabled={!stepInfo.canGoNext || isNavigating}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  stepInfo.canGoNext && !isNavigating
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
              >
                <span>Next</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5 Navigation - Show Previous button only */}
        {currentStep === 5 && !stepInfo.isCompleted && (
          <div className="mt-8 flex justify-start">
            <button
              onClick={goToPreviousStep}
              disabled={isNavigating}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !isNavigating
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </button>
          </div>
        )}
      </main>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Unsaved Changes
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              You have unsaved changes in your profile. Are you sure you want to
              exit? Your progress will be lost.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Stay
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Exit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProfileWizard.displayName = "ProfileWizard";

export default ProfileWizard;

// FIXED: Export constants and types
export const WizardStep = {
  LOCATION: 1,
  PERSONAL_DETAILS: 2,
  PRIMARY_SPORT: 3,
  GEOLOCATION: 4,
  REVIEW_SUBMIT: 5,
} as const;

export type WizardStepType = (typeof WizardStep)[keyof typeof WizardStep];

export interface WizardConfig {
  showHeader?: boolean;
  allowStepSkipping?: boolean;
  autoSave?: boolean;
  validationMode?: "onChange" | "onBlur" | "onSubmit";
  theme?: "default" | "minimal" | "branded";
}

export const defaultWizardConfig: WizardConfig = {
  showHeader: true,
  allowStepSkipping: false,
  autoSave: true,
  validationMode: "onChange",
  theme: "default",
};
