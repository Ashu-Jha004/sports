// onboarding/components/profile-wizard/components/StepRenderer.tsx
"use client";

import React, { useMemo } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import StepOne from "../StepOne";
import StepTwo from "../StepTwo";
import StepThree from "../stepThree";
import StepFour from "../StepFour";
import StepFive from "../StepFive";

interface StepRendererProps {
  readonly currentStep: number;
  readonly onNavigate: (step: number) => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  onNavigate,
}) => {
  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <StepOne />;
      case 2:
        return <StepTwo />;
      case 3:
        return <StepThree />;
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
            <p className="text-gray-600 mb-4">
              Something went wrong. Please refresh the page or start over.
            </p>
            <button
              onClick={() => onNavigate(1)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Step 1
            </button>
          </div>
        );
    }
  }, [currentStep, onNavigate]);

  return <>{stepContent}</>;
};
