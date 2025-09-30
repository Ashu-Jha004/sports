// onboarding/components/profile-wizard/components/review/ReviewSection.tsx
"use client";

import React from "react";
import {
  CheckCircleIcon,
  PencilIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ReviewSectionProps {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly stepNumber: number;
  readonly isValid: boolean;
  readonly onEdit: () => void;
  readonly children: React.ReactNode;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  icon,
  stepNumber,
  isValid,
  onEdit,
  children,
}) => (
  <div
    className={`border rounded-xl p-6 transition-all duration-200 ${
      isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isValid ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {icon}
        </div>
        <div>
          <h3
            className={`font-semibold ${
              isValid ? "text-green-900" : "text-red-900"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-xs ${isValid ? "text-green-600" : "text-red-600"}`}
          >
            Step {stepNumber}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isValid ? (
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
        ) : (
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
        )}
        <button
          type="button"
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-100 transition-colors"
          aria-label={`Edit ${title}`}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className={isValid ? "text-green-800" : "text-red-800"}>
      {children}
    </div>
  </div>
);
