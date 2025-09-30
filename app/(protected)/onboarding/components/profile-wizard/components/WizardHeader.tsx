// onboarding/components/profile-wizard/components/WizardHeader.tsx
"use client";

import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface WizardHeaderProps {
  readonly hasUnsavedChanges: boolean;
  readonly onExit?: () => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  hasUnsavedChanges,
  onExit,
}) => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Profile Setup Wizard
          </h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Complete all steps to create your athletic profile</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <div className="hidden sm:flex items-center space-x-1 text-xs text-amber-600">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>Unsaved changes</span>
            </div>
          )}

          {onExit && (
            <button
              onClick={onExit}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Exit
            </button>
          )}
        </div>
      </div>
    </div>
  </header>
);
