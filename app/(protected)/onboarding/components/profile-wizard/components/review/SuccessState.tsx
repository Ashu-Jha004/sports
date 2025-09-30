// onboarding/components/profile-wizard/components/review/SuccessState.tsx
"use client";

import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

export const SuccessState: React.FC = () => (
  <div className="w-full max-w-2xl mx-auto">
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckIcon className="w-10 h-10 text-green-600" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Profile Created Successfully! 🎉
      </h2>

      <p className="text-gray-600 text-lg mb-8">
        Welcome to our athletic community! Your profile has been created and you
        can now start connecting with other athletes.
      </p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => (window.location.href = "/dashboard")}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Go to Dashboard
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = "/profile")}
          className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          View My Profile
        </button>
      </div>
    </div>
  </div>
);
