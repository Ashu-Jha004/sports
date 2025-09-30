// onboarding/components/profile-wizard/components/forms/PrivacyNotice.tsx
"use client";

import React from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

interface PrivacyNoticeProps {
  readonly helpInfo: readonly string[];
  readonly title?: string;
  readonly icon?: React.ReactNode;
  readonly colorScheme?: "green" | "blue" | "purple";
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  helpInfo,
  title = "Privacy & Security",
  icon = <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />,
  colorScheme = "green",
}) => {
  const getColorClasses = () => {
    switch (colorScheme) {
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-800 text-blue-700";
      case "purple":
        return "bg-purple-50 border-purple-200 text-purple-800 text-purple-700";
      default:
        return "bg-green-50 border-green-200 text-green-800 text-green-700";
    }
  };

  const colorClasses = getColorClasses();
  const [bgColor, borderColor, titleColor, textColor] = colorClasses.split(" ");

  return (
    <div className={`mt-8 p-4 ${bgColor} rounded-lg border ${borderColor}`}>
      <div className="flex items-start space-x-3">
        {icon}
        <div>
          <h4 className={`text-sm font-semibold ${titleColor} mb-2`}>
            {title}
          </h4>
          <ul className={`text-sm ${textColor} space-y-1`}>
            {helpInfo.map((info, index) => (
              <li key={index}>• {info}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
