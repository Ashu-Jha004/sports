// onboarding/components/profile-wizard/components/progress/CurrentStepInfo.tsx
"use client";

import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import type { WizardStep } from "@/types/profile";

interface CurrentStepInfoProps {
  readonly step?: WizardStep;
  readonly description: string;
}

export const CurrentStepInfo: React.FC<CurrentStepInfoProps> = ({
  step,
  description,
}) => {
  if (!step) return null;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">{step.id}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0">
          {step.isValid && (
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-green-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
