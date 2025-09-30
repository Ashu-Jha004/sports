// onboarding/components/profile-wizard/components/geolocation/GeolocationPrivacy.tsx
"use client";

import React from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

interface GeolocationPrivacyProps {
  readonly privacyInfo: readonly string[];
  readonly title?: string;
}

export const GeolocationPrivacy: React.FC<GeolocationPrivacyProps> = ({
  privacyInfo,
  title = "Privacy & Location Data",
}) => (
  <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
    <div className="flex items-start space-x-3">
      <ShieldCheckIcon className="w-5 h-5 text-purple-600 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-purple-800 mb-2">{title}</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          {privacyInfo.map((info, index) => (
            <li key={index}>• {info}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
