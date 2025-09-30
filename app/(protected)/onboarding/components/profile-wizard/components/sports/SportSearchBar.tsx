// onboarding/components/profile-wizard/components/sports/SportSearchBar.tsx
"use client";

import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SportSearchBarProps {
  readonly searchTerm: string;
  readonly onSearchChange: (term: string) => void;
  readonly placeholder?: string;
}

export const SportSearchBar: React.FC<SportSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search for a sport...",
}) => (
  <div className="relative">
    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
    />
  </div>
);
