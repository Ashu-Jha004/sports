// onboarding/components/profile-wizard/components/ExitConfirmationModal.tsx
"use client";

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ExitConfirmationModalProps {
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  onCancel,
  onConfirm,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
      <div className="flex items-center space-x-3 mb-4">
        <ExclamationTriangleIcon className="w-8 h-8 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
      </div>

      <p className="text-gray-600 mb-6">
        You have unsaved changes in your profile. Are you sure you want to exit?
        Your progress will be lost.
      </p>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Stay
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Exit Anyway
        </button>
      </div>
    </div>
  </div>
);
