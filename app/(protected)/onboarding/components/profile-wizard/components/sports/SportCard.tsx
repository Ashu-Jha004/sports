// onboarding/components/profile-wizard/components/sports/SportCard.tsx
"use client";

import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { getPopularityStars } from "@/lib/utils/sport-selection";
import type { Sport } from "@/lib/constants/index";

interface SportCardProps {
  readonly sport: Sport;
  readonly isSelected: boolean;
  readonly onClick: () => void;
}

export const SportCard: React.FC<SportCardProps> = ({
  sport,
  isSelected,
  onClick,
}) => {
  const cardClasses = `relative p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
    isSelected
      ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
      : "border-gray-200 bg-white hover:border-gray-300"
  }`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl flex-shrink-0">{sport.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{sport.name}</h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {sport.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {sport.category}
            </span>
            <span className="text-sm">
              {getPopularityStars(sport.popularity)}
            </span>
          </div>
        </div>
        {isSelected && (
          <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};
