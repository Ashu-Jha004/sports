// onboarding/components/profile-wizard/components/review/SubmissionControls.tsx
"use client";

import React from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface SubmissionControlsProps {
  readonly isSubmitting: boolean;
  readonly canSubmit: boolean;
  readonly submissionError: string | null;
  readonly onSubmit: () => Promise<void>;
}

export const SubmissionControls: React.FC<SubmissionControlsProps> = ({
  isSubmitting,
  canSubmit,
  submissionError,
  onSubmit,
}) => (
  <>
    {/* Submission Error */}
    {submissionError && (
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">Submission Error</span>
        </div>
        <p className="text-red-700 text-sm mt-2">{submissionError}</p>
      </div>
    )}

    {/* Submit Button */}
    <div className="mt-8 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || !canSubmit}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
          isSubmitting || !canSubmit
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-3">
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
            <span>Creating your profile...</span>
          </div>
        ) : (
          "Create My Athletic Profile"
        )}
      </button>

      {canSubmit && !isSubmitting && (
        <p className="text-center text-green-600 text-sm mt-2 flex items-center justify-center space-x-1">
          <CheckCircleIcon className="w-4 h-4" />
          <span>Ready to submit!</span>
        </p>
      )}
    </div>

    {/* Terms and Privacy */}
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
      <p className="text-xs text-gray-600">
        By creating your profile, you agree to our{" "}
        <button className="text-blue-600 hover:text-blue-700 underline">
          Terms of Service
        </button>{" "}
        and{" "}
        <button className="text-blue-600 hover:text-blue-700 underline">
          Privacy Policy
        </button>
        . Your data is secure and will never be shared without your consent.
      </p>
    </div>
  </>
);
