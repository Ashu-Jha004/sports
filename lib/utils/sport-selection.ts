// lib/utils/sport-selection.ts

import { useCallback, useRef } from "react";
import type { Sport } from "@/lib/constants/index";

/**
 * =============================================================================
 * SPORT SELECTION UTILITIES & HELPERS
 * =============================================================================
 */

/**
 * Sport validation hook parameters
 */
interface SportValidationParams {
  readonly setFormData: (data: any) => void;
  readonly setStepValid: (step: number, isValid: boolean) => void;
  readonly setStepCompleted: (step: number, isCompleted: boolean) => void;
  readonly clearErrors: (field: string) => void;
  readonly lastSelectedSport: React.MutableRefObject<string>;
}

/**
 * Custom hook for sport validation logic
 */
export const useSportValidation = ({
  setFormData,
  setStepValid,
  setStepCompleted,
  clearErrors,
  lastSelectedSport,
}: SportValidationParams) => {
  const updateStepStatus = useCallback(
    (sportName: string) => {
      // Prevent unnecessary updates
      if (lastSelectedSport.current === sportName) return;

      lastSelectedSport.current = sportName;

      if (sportName) {
        setFormData({ primarySport: sportName });
        setStepValid(3, true);
        setStepCompleted(3, true);
        clearErrors("primarySport");
      } else {
        setStepValid(3, false);
        setStepCompleted(3, false);
      }
    },
    [
      setFormData,
      setStepValid,
      setStepCompleted,
      clearErrors,
      lastSelectedSport,
    ]
  );

  return { updateStepStatus };
};

/**
 * Filters sports based on search term and category
 */
export const filterSports = (
  sports: readonly Sport[],
  searchTerm: string,
  selectedCategory: string
): readonly Sport[] => {
  let filtered = [...sports];

  // Filter by category
  if (selectedCategory !== "All Sports") {
    filtered = filtered.filter((sport) => sport.category === selectedCategory);
  }

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (sport) =>
        sport.name.toLowerCase().includes(term) ||
        sport.description.toLowerCase().includes(term)
    );
  }

  // Sort by popularity
  return filtered.sort((a, b) => b.popularity - a.popularity);
};

/**
 * Generates popularity stars display
 */
export const getPopularityStars = (popularity: number): string => {
  return "⭐".repeat(Math.min(Math.max(Math.round(popularity / 2), 1), 5));
};

/**
 * Sport benefits information
 */
export const SPORT_BENEFITS_INFO = [
  "Get personalized training recommendations",
  "Connect with athletes in your sport",
  "Receive sport-specific content and tips",
  "Find local competitions and events",
  "Track progress with relevant metrics",
] as const;

/**
 * Gets sport icon by name with fallback
 */
export const getSportIcon = (
  sportName: string,
  sports: readonly Sport[]
): string => {
  const sport = sports.find(
    (s) => s.name.toLowerCase() === sportName.toLowerCase()
  );
  return sport?.icon || "🏆";
};

/**
 * Groups sports by category for display
 */
export const groupSportsByCategory = (sports: readonly Sport[]) => {
  return sports.reduce((groups, sport) => {
    const category = sport.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(sport);
    return groups;
  }, {} as Record<string, Sport[]>);
};
