// onboarding/components/profile-wizard/components/ErrorSummary.tsx
"use client";

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { ValidationError } from "@/types/profile";

interface ErrorSummaryProps {
  readonly errors: ValidationError[];
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
        <h3 className="font-medium text-red-800">
          Please fix the following errors:
        </h3>
      </div>
      <ul className="text-sm text-red-700 space-y-1">
        {errors.map((error, index) => (
          <li key={`${error.field}-${index}`}>• {error.message}</li>
        ))}
      </ul>
    </div>
  );
};
