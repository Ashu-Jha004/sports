// onboarding/components/profile-wizard/StepFive.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useFormData,
  useSteps,
  useErrors,
  useSetCurrentStep,
  useSubmitProfile,
  useSetStepCompleted,
  useSetStepValid,
  useClearErrors,
} from "@/store/profileWizardStore";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { StepContainer } from "./components/forms/StepContainer";
import { ValidationErrors } from "./components/review/ValidationErrors";
import { ProfileReviewSections } from "./components/review/ProfileReviewSections";
import { SubmissionControls } from "./components/review/SubmissionControls";
import { SuccessState } from "./components/review/SuccessState";

import {
  useProfileValidation,
  validateAllSteps,
  PROFILE_VALIDATION_RULES,
} from "@/lib/utils/profile-review";

/**
 * =============================================================================
 * STEP FIVE - REVIEW & SUBMIT
 * =============================================================================
 */

export const StepFive: React.FC = () => {
  const formData = useFormData();
  const steps = useSteps();
  const storeErrors = useErrors();
  const setCurrentStep = useSetCurrentStep();
  const submitProfile = useSubmitProfile();
  const setStepCompleted = useSetStepCompleted();
  const setStepValid = useSetStepValid();
  const clearErrors = useClearErrors();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Profile validation hook
  const { allStepsValid, validationErrors, userAge } = useProfileValidation(
    formData,
    steps
  );

  // Auto-mark step as valid when ready
  useEffect(() => {
    const isReady = allStepsValid && validationErrors.length === 0;
    setStepValid(5, isReady);
  }, [allStepsValid, validationErrors.length, setStepValid]);

  // Edit step handler
  const handleEditStep = useCallback(
    (stepNumber: number) => {
      setCurrentStep(stepNumber);
    },
    [setCurrentStep]
  );

  // Profile submission handler
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during submission. Please try again.";
      setSubmissionError(errorMessage);
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
    return <SuccessState />;
  }

  return (
    <StepContainer
      icon={<CheckCircleIcon className="w-8 h-8 text-indigo-600" />}
      title="Review your profile"
      description="Please review all information before submitting your athletic profile"
      className="max-w-4xl"
    >
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <ValidationErrors errors={validationErrors} />
      )}

      {/* Profile Review Sections */}
      <ProfileReviewSections
        formData={formData}
        steps={steps}
        userAge={userAge}
        onEditStep={handleEditStep}
      />

      {/* Store Errors */}
      {storeErrors.length > 0 && (
        <ValidationErrors
          errors={storeErrors.map((e) => e.message)}
          title="Please fix these errors:"
        />
      )}

      {/* Submission Controls */}
      <SubmissionControls
        isSubmitting={isSubmitting}
        canSubmit={allStepsValid && validationErrors.length === 0}
        submissionError={submissionError}
        onSubmit={handleSubmit}
      />
    </StepContainer>
  );
};

export default StepFive;
