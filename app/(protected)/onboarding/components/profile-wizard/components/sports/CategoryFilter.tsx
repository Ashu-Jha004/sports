// onboarding/components/profile-wizard/components/sports/CategoryFilter.tsx
"use client";

import React from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { SPORT_CATEGORIES } from "@/lib/constants/index";

interface CategoryFilterProps {
  readonly selectedCategory: string;
  readonly showCategories: boolean;
  readonly onCategoryChange: (category: string) => void;
  readonly onToggleCategories: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  showCategories,
  onCategoryChange,
  onToggleCategories,
}) => (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={onToggleCategories}
      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
    >
      <FunnelIcon className="w-4 h-4" />
      <span className="text-sm font-medium">Categories</span>
    </button>

    {showCategories && (
      <div className="flex flex-wrap gap-2 w-full">
        {SPORT_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    )}
  </div>
);
