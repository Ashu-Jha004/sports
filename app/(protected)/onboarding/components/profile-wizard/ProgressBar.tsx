// onboarding/components/profile-wizard/ProgressBar.tsx
"use client";

import React from "react";
import { useSteps, useCurrentStep } from "@/store/profileWizardStore";

import { OverallProgress } from "./components/progress/OverallProgress";
import { StepIndicators } from "./components/progress/StepIndicators";
import { CurrentStepInfo } from "./components/progress/CurrentStepInfo";

import {
  calculateProgress,
  getStepDescription,
} from "@/lib/utils/progress-bar";

/**
 * =============================================================================
 * PROGRESS BAR COMPONENT
 * =============================================================================
 */

interface ProgressBarProps {
  readonly className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ className = "" }) => {
  const steps = useSteps();
  const currentStep = useCurrentStep();

  const progressData = calculateProgress(steps);
  const currentStepInfo = steps.find((step) => step.id === currentStep);
  const stepDescription = getStepDescription(currentStep);

  return (
    <div className={`w-full bg-white ${className}`}>
      {/* Overall Progress Bar */}
      <OverallProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        progressPercentage={progressData.percentage}
      />

      {/* Step Indicators */}
      <StepIndicators steps={steps} currentStep={currentStep} />

      {/* Current Step Info */}
      <CurrentStepInfo step={currentStepInfo} description={stepDescription} />
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
export default ProgressBar;
