// onboarding/components/profile-wizard/components/WizardNavigation.tsx
"use client";

import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useCurrentStep } from "@/store/profileWizardStore";

interface StepInfo {
  readonly canGoNext: boolean;
  readonly canGoPrevious: boolean;
}

interface WizardNavigationProps {
  readonly stepInfo: StepInfo;
  readonly isNavigating: boolean;
  readonly onNavigate: (step: number) => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  stepInfo,
  isNavigating,
  onNavigate,
}) => {
  const currentStep = useCurrentStep(); // Get current step
  const { canGoNext, canGoPrevious } = stepInfo;

  return (
    <div className="mt-8 flex items-center justify-between">
      {/* Previous Button */}
      <button
        onClick={() => onNavigate(currentStep - 1)} // FIX: Use absolute step number
        disabled={!canGoPrevious || isNavigating}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          canGoPrevious && !isNavigating
            ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
        }`}
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Previous</span>
      </button>

      {/* Next Button */}
      <button
        onClick={() => onNavigate(currentStep + 1)} // FIX: Use absolute step number
        disabled={!canGoNext || isNavigating}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          canGoNext && !isNavigating
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
            : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
        }`}
      >
        <span>Next</span>
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
