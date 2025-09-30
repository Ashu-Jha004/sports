// onboarding/components/profile-wizard/components/progress/MobileStepIndicators.tsx
"use client";

import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { getStepStatus, getStepClasses } from "@/lib/utils/progress-bar";
import type { WizardStep } from "@/types/profile";

interface MobileStepIndicatorsProps {
  readonly steps: readonly WizardStep[];
  readonly currentStep: number;
}

export const MobileStepIndicators: React.FC<MobileStepIndicatorsProps> = ({
  steps,
  currentStep,
}) => (
  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
    {steps.map((step) => {
      const status = getStepStatus(step.id, currentStep);

      return (
        <div
          key={step.id}
          className="flex items-center flex-shrink-0 space-x-2"
        >
          <div className={getStepClasses(step.id, currentStep)}>
            {step.isCompleted ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <span className="text-xs">{step.id}</span>
            )}
          </div>
          <span
            className={`text-xs font-medium whitespace-nowrap ${
              status === "current"
                ? "text-blue-600"
                : step.isCompleted
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            {step.title}
          </span>
        </div>
      );
    })}
  </div>
);
