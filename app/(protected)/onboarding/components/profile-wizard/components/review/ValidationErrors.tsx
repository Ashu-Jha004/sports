// onboarding/components/profile-wizard/components/review/ValidationErrors.tsx
"use client";

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ValidationErrorsProps {
  readonly errors: readonly string[];
  readonly title?: string;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  title = "Please fix the following issues:",
}) => (
  <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center space-x-2 mb-3">
      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      <h3 className="font-semibold text-red-800">{title}</h3>
    </div>
    <ul className="text-sm text-red-700 space-y-1">
      {errors.map((error, index) => (
        <li key={index}>• {error}</li>
      ))}
    </ul>
  </div>
);
