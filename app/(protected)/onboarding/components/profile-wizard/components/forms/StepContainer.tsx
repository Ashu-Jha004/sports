// onboarding/components/profile-wizard/components/forms/StepContainer.tsx
"use client";

import React from "react";

interface StepContainerProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  icon,
  title,
  description,
  children,
  className = "",
}) => (
  <div className={`w-full max-w-2xl mx-auto ${className}`}>
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 text-sm md:text-base">{description}</p>
      </div>

      {/* Content */}
      {children}
    </div>
  </div>
);
