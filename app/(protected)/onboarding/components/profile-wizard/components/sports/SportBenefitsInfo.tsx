// onboarding/components/profile-wizard/components/sports/SportBenefitsInfo.tsx
"use client";

import React from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";

interface SportBenefitsInfoProps {
  readonly benefits: readonly string[];
  readonly title?: string;
}

export const SportBenefitsInfo: React.FC<SportBenefitsInfoProps> = ({
  benefits,
  title = "Why choose a primary sport?",
}) => (
  <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
    <div className="flex items-start space-x-3">
      <TrophyIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">{title}</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          {benefits.map((benefit, index) => (
            <li key={index}>• {benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
