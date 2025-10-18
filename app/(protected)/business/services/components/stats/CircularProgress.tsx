import React from "react";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

interface CircularProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepClick?: (step: number) => void;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
  className = "",
}) => {
  const progressPercentage = (completedSteps.size / totalSteps) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Circular Progress Ring */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />

          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-indigo-600 transition-all duration-500 ease-in-out"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(progressPercentage)}%
          </span>
          <span className="text-sm text-gray-500">
            {completedSteps.size}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Current Step Info */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {completedSteps.size} steps completed
        </p>
      </div>

      {/* Mini Step Indicators */}
    </div>
  );
};
