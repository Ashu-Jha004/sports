// onboarding/components/profile-wizard/components/progress/OverallProgress.tsx
"use client";

import React from "react";

interface OverallProgressProps {
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly progressPercentage: number;
}

export const OverallProgress: React.FC<OverallProgressProps> = ({
  currentStep,
  totalSteps,
  progressPercentage,
}) => (
  <div className="mb-8">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">
        Step {currentStep} of {totalSteps}
      </span>
      <span className="text-sm font-medium text-gray-700">
        {Math.round(progressPercentage)}% Complete
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  </div>
);
