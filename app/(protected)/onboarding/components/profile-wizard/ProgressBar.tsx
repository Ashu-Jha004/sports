"use client";

import React from "react";
import { useSteps, useCurrentStep } from "@/store/profileWizardStore";
import { CheckIcon } from "@heroicons/react/24/solid";

interface ProgressBarProps {
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ className = "" }) => {
  const steps = useSteps();
  const currentStep = useCurrentStep();

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  const getStepClasses = (stepId: number) => {
    const status = getStepStatus(stepId);
    const baseClasses =
      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ease-in-out text-sm font-medium";

    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-500 border-green-500 text-white shadow-lg`;
      case "current":
        return `${baseClasses} bg-blue-500 border-blue-500 text-white shadow-lg ring-4 ring-blue-200`;
      case "upcoming":
        return `${baseClasses} bg-gray-100 border-gray-300 text-gray-500`;
      default:
        return baseClasses;
    }
  };

  const getConnectorClasses = (stepId: number) => {
    const isCompleted = stepId < currentStep;
    return `flex-1 h-1 mx-2 transition-all duration-500 ease-in-out ${
      isCompleted ? "bg-green-500" : "bg-gray-200"
    }`;
  };

  const getStepTitleClasses = (stepId: number) => {
    const status = getStepStatus(stepId);
    const baseClasses =
      "text-xs font-medium mt-2 transition-colors duration-300 text-center";

    switch (status) {
      case "completed":
        return `${baseClasses} text-green-600`;
      case "current":
        return `${baseClasses} text-blue-600`;
      case "upcoming":
        return `${baseClasses} text-gray-500`;
      default:
        return baseClasses;
    }
  };

  const calculateProgress = () => {
    const completedSteps = steps.filter((step) => step.isCompleted).length;
    const totalSteps = steps.length;
    return (completedSteps / totalSteps) * 100;
  };

  return (
    <div className={`w-full bg-white ${className}`}>
      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(calculateProgress())}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Step Indicators - Desktop */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={getStepClasses(step.id)}>
                  {step.isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className={getStepTitleClasses(step.id)}>{step.title}</div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={getConnectorClasses(step.id)} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Indicators - Mobile */}
      <div className="block md:hidden">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center flex-shrink-0 space-x-2"
            >
              <div className={getStepClasses(step.id)}>
                {step.isCompleted ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{step.id}</span>
                )}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  getStepStatus(step.id) === "current"
                    ? "text-blue-600"
                    : step.isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">{currentStep}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              {steps.find((step) => step.id === currentStep)?.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {getStepDescription(currentStep)}
            </p>
          </div>
          <div className="flex-shrink-0">
            {steps.find((step) => step.id === currentStep)?.isValid && (
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get step descriptions
const getStepDescription = (stepId: number): string => {
  const descriptions: Record<number, string> = {
    1: "Enter your location details including city, country, and state.",
    2: "Provide your personal information such as date of birth and bio.",
    3: "Select your primary sport from the available options.",
    4: "Allow location access to automatically detect your coordinates.",
    5: "Review all information and submit your profile.",
  };

  return descriptions[stepId] || "Complete this step to continue.";
};

// Optional: Progress Bar with Steps Only (minimal version)
export const MinimalProgressBar: React.FC<ProgressBarProps> = ({
  className = "",
}) => {
  const currentStep = useCurrentStep();
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-blue-600">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-inner"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
