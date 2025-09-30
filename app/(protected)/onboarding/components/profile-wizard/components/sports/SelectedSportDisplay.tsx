// onboarding/components/profile-wizard/components/sports/SelectedSportDisplay.tsx
"use client";

import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { getPopularityStars } from "@/lib/utils/sport-selection";
import type { Sport } from "@/lib/constants/index";

interface SelectedSportDisplayProps {
  readonly sport: Sport;
  readonly className?: string;
}

export const SelectedSportDisplay: React.FC<SelectedSportDisplayProps> = ({
  sport,
  className = "",
}) => (
  <div
    className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}
  >
    <div className="flex items-center space-x-3">
      <span className="text-3xl">{sport.icon}</span>
      <div>
        <h3 className="font-semibold text-blue-900">{sport.name}</h3>
        <p className="text-sm text-blue-700">{sport.description}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-blue-600">Popularity:</span>
          <span className="text-sm">
            {getPopularityStars(sport.popularity)}
          </span>
        </div>
      </div>
      <CheckCircleIcon className="w-6 h-6 text-blue-600 ml-auto" />
    </div>
  </div>
);
