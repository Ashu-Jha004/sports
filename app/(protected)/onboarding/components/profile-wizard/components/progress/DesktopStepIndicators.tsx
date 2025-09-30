// onboarding/components/profile-wizard/components/progress/DesktopStepIndicators.tsx
"use client";

import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import {
  getStepStatus,
  getStepClasses,
  getStepTitleClasses,
  getConnectorClasses,
} from "@/lib/utils/progress-bar";
import type { WizardStep } from "@/types/profile";

interface DesktopStepIndicatorsProps {
  readonly steps: readonly WizardStep[];
  readonly currentStep: number;
}

export const DesktopStepIndicators: React.FC<DesktopStepIndicatorsProps> = ({
  steps,
  currentStep,
}) => (
  <div className="flex items-center justify-between">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div className={getStepClasses(step.id, currentStep)}>
            {step.isCompleted ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <span>{step.id}</span>
            )}
          </div>
          <div className={getStepTitleClasses(step.id, currentStep)}>
            {step.title}
          </div>
        </div>

        {/* Connector line */}
        {index < steps.length - 1 && (
          <div className={getConnectorClasses(step.id, currentStep)} />
        )}
      </React.Fragment>
    ))}
  </div>
);
