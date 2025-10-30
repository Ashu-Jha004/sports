// onboarding/components/profile-wizard/ProfileWizard.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  useCurrentStep,
  useSteps,
  useFormData,
  useErrors,
  useSetCurrentStep,
  useResetWizard,
} from "@/store/profileWizardStore";
import { WizardHeader } from "./components/WizardHeader";
import { WizardNavigation } from "./components/WizardNavigation";
import { StepRenderer } from "./components/StepRenderer";
import { ErrorSummary } from "./components/ErrorSummary";
import { ProgressBar } from "./ProgressBar";
import { ExitConfirmationModal } from "./components/ExitConfirmationModal";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { ProfileWizardProps } from "../../types/onboardingWizardTypes";
import {
  validateFormDataChanges,
  createWizardStepInfo,
  WIZARD_CONFIG,
} from "@/lib/utils/wizard";

const ProfileWizard: React.FC<ProfileWizardProps> = ({
  onComplete,
  onCancel,
  className = "",
  showHeader = true,
  allowStepSkipping = false,
}) => {
  // Store state
  const currentStep: any = useCurrentStep();
  const steps: any = useSteps();
  const formData: any = useFormData();
  const errors: any = useErrors();
  const setCurrentStep: any = useSetCurrentStep();
  const resetWizard: any = useResetWizard();

  // Local state
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  /**
   * Track form data changes for unsaved changes detection
   */
  useEffect(() => {
    const hasChanges = validateFormDataChanges(formData);
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  /**
   * Handle wizard completion
   */
  useEffect(() => {
    const isCompleted = steps[4]?.isCompleted;
    if (isCompleted && onComplete) {
      onComplete(formData);
    }
  }, [steps, formData, onComplete]);

  /**
   * Navigation handler with validation
   */
  const navigateToStep = useCallback(
    (targetStep: number) => {
      if (isNavigating || targetStep < 1 || targetStep > 5) return;

      setIsNavigating(true);
      setTimeout(() => {
        setCurrentStep(targetStep);
        setIsNavigating(false);
      }, WIZARD_CONFIG.NAVIGATION_DELAY);
    },
    [isNavigating, setCurrentStep]
  );

  /**
   * Exit handler with confirmation
   */
  const handleExit = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitModal(true);
    } else {
      onCancel?.();
    }
  }, [hasUnsavedChanges, onCancel]);

  /**
   * Confirmed exit handler
   */
  const confirmExit = useCallback(() => {
    resetWizard();
    setShowExitModal(false);
    onCancel?.();
  }, [resetWizard, onCancel]);

  /**
   * Memoized step information
   */
  const stepInfo = useMemo(
    () => createWizardStepInfo(steps, currentStep, allowStepSkipping),
    [steps, currentStep, allowStepSkipping]
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <WizardHeader
          hasUnsavedChanges={hasUnsavedChanges}
          onExit={onCancel ? handleExit : undefined}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar />
        </div>

        {/* Error Summary */}
        {errors.length > 0 && (
          <div className="mb-8">
            <ErrorSummary errors={errors} />
          </div>
        )}

        {/* Step Content Container */}
        <div className="relative">
          {/* Loading Overlay */}
          {isNavigating && <LoadingOverlay />}

          {/* Step Content */}
          <div className={isNavigating ? "opacity-50 pointer-events-none" : ""}>
            <StepRenderer
              currentStep={currentStep}
              onNavigate={navigateToStep}
            />
          </div>
        </div>

        {/* Navigation */}
        {currentStep < 5 && !stepInfo.isCompleted && (
          <WizardNavigation
            stepInfo={stepInfo}
            isNavigating={isNavigating}
            onNavigate={navigateToStep}
          />
        )}
      </main>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <ExitConfirmationModal
          onCancel={() => setShowExitModal(false)}
          onConfirm={confirmExit}
        />
      )}
    </div>
  );
};
export default ProfileWizard;
