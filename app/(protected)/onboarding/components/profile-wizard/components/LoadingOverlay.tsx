// onboarding/components/profile-wizard/components/LoadingOverlay.tsx
"use client";

import React from "react";

export const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-xl">
    <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-lg shadow-lg">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      <span className="text-gray-700 font-medium">Loading...</span>
    </div>
  </div>
);
