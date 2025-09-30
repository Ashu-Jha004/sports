// onboarding/components/profile-wizard/components/sports/SportGrid.tsx
"use client";

import React from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { SportCard } from "./SportCard";
import type { Sport } from "@/lib/constants/index";

interface SportGridProps {
  readonly sports: readonly Sport[];
  readonly selectedSport: string;
  readonly onSportSelect: (sportName: string) => void;
  readonly searchTerm: string;
  readonly selectedCategory: string;
  readonly onClearFilters: () => void;
}

export const SportGrid: React.FC<SportGridProps> = ({
  sports,
  selectedSport,
  onSportSelect,
  searchTerm,
  selectedCategory,
  onClearFilters,
}) => {
  // No results message
  if (sports.length === 0) {
    return (
      <div className="text-center py-12">
        <TrophyIcon className="mx-auto w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No sports found
        </h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search terms or category filter
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {sports.map((sport) => (
        <SportCard
          key={sport.id}
          sport={sport}
          isSelected={selectedSport === sport.name}
          onClick={() => onSportSelect(sport.name)}
        />
      ))}
    </div>
  );
};
