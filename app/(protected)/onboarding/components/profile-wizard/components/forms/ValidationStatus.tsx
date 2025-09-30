// onboarding/components/profile-wizard/components/forms/ValidationStatus.tsx
"use client";

import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface ValidationStatusProps {
  readonly isValidating: boolean;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly successMessage: string;
  readonly loadingMessage?: string;
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({
  isValidating,
  isValid,
  isDirty,
  successMessage,
  loadingMessage = "Validating...",
}) => {
  // Show loading state
  if (isValidating) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">{loadingMessage}</span>
      </div>
    );
  }

  // Show success state
  if (isValid && isDirty && !isValidating) {
    return (
      <div className="flex items-center justify-center py-2 text-green-600">
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">{successMessage}</span>
      </div>
    );
  }

  // No status to show
  return null;
};
